import NetInfo from "@react-native-community/netinfo";

import { safeLog } from "../../../security/safeLog";
import { buildSubsonicAuthParams } from "../auth/tokenAuth";
import { dedupeRequest } from "../cache/requestCache";
import { SUBSONIC_PATHS } from "../endpoints/paths";
import { SubsonicApiError } from "../models/errors";
import type {
  EndpointCredentials,
  SubsonicAuthParams,
  SubsonicPingResult,
  SubsonicResponseEnvelope,
} from "../models/types";
import { withExponentialBackoff } from "../utils/retry";
import { sanitizeErrorMessage } from "../utils/sanitize";
import {
  buildSubsonicRequestUrl,
  normalizeServerUrl,
  redactUrlForLogs,
} from "../utils/url";

const DEFAULT_TIMEOUT_MS = 20_000;

export interface SubsonicClientOptions {
  baseUrl: string;
  credentials: EndpointCredentials;
  allowInsecure?: boolean;
  timeoutMs?: number;
  maxRetries?: number;
  requireNetwork?: boolean;
}

export class SubsonicClient {
  private readonly restBaseUrl: string;
  private readonly origin: string;
  private readonly credentials: EndpointCredentials;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly requireNetwork: boolean;

  constructor(options: SubsonicClientOptions) {
    const normalized = normalizeServerUrl(options.baseUrl, {
      allowInsecure: options.allowInsecure ?? __DEV__,
    });
    this.restBaseUrl = normalized.restBaseUrl;
    this.origin = normalized.origin;
    this.credentials = {
      username: options.credentials.username.trim(),
      password: options.credentials.password,
    };
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.maxRetries = options.maxRetries ?? 2;
    this.requireNetwork = options.requireNetwork ?? true;
  }

  getRestBaseUrl(): string {
    return this.restBaseUrl;
  }

  getOrigin(): string {
    return this.origin;
  }

  buildAuthParams(): SubsonicAuthParams {
    return buildSubsonicAuthParams(this.credentials);
  }

  buildAuthenticatedQuery(
    extraParams: Record<string, string> = {},
  ): Record<string, string> {
    return {
      ...(this.buildAuthParams() as unknown as Record<string, string>),
      ...extraParams,
    };
  }

  getCoverArtUrl(coverArtId: string, size = 300): string {
    return buildSubsonicRequestUrl(
      this.restBaseUrl,
      SUBSONIC_PATHS.getCoverArt,
      {
        ...this.buildAuthenticatedQuery(),
        id: coverArtId,
        size: String(size),
      },
    );
  }

  getStreamUrl(songId: string): string {
    return buildSubsonicRequestUrl(this.restBaseUrl, SUBSONIC_PATHS.stream, {
      ...this.buildAuthenticatedQuery(),
      id: songId,
    });
  }

  async ping(signal?: AbortSignal): Promise<SubsonicPingResult> {
    return this.requestPing(signal);
  }

  async request<T>(
    path: string,
    extraParams: Record<string, string> = {},
    signal?: AbortSignal,
  ): Promise<T> {
    const cacheKey = `${this.restBaseUrl}:${path}:${JSON.stringify(extraParams)}`;

    return dedupeRequest(cacheKey, () => {
      const url = buildSubsonicRequestUrl(
        this.restBaseUrl,
        path,
        this.buildAuthenticatedQuery(extraParams),
      );

      return withExponentialBackoff(
        async () => {
          if (this.requireNetwork) {
            await this.assertOnline();
          }
          return this.executeJsonRequest<T>(url, signal);
        },
        { maxAttempts: this.maxRetries + 1 },
      );
    });
  }

  private async requestPing(signal?: AbortSignal): Promise<SubsonicPingResult> {
    const url = buildSubsonicRequestUrl(
      this.restBaseUrl,
      SUBSONIC_PATHS.ping,
      this.buildAuthenticatedQuery(),
    );

    if (this.requireNetwork) {
      await this.assertOnline();
    }

    const payload = await withExponentialBackoff(
      () =>
        this.executeJsonRequest<{ version?: string; type?: string }>(
          url,
          signal,
        ),
      { maxAttempts: this.maxRetries + 1 },
    );

    return {
      status: "ok",
      version: payload.version,
      type: payload.type,
    };
  }

  private async executeJsonRequest<T>(
    url: string,
    externalSignal?: AbortSignal,
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    const abortListener = () => controller.abort();
    externalSignal?.addEventListener("abort", abortListener);

    safeLog("debug", "Subsonic request", {
      url: redactUrlForLogs(url),
    });

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new SubsonicApiError(
          "SERVER_UNREACHABLE",
          `Server responded with HTTP ${response.status}.`,
          { retryable: response.status >= 500, statusCode: response.status },
        );
      }

      const json = (await response.json()) as SubsonicResponseEnvelope<
        Record<string, unknown>
      >;
      const body = json["subsonic-response"];

      if (!body) {
        throw new SubsonicApiError(
          "MALFORMED_RESPONSE",
          "Server returned an unexpected response format.",
        );
      }

      if (body.status === "failed") {
        const code = body.error?.code;
        const message = sanitizeErrorMessage(
          body.error?.message ?? "Subsonic API request failed.",
        );

        if (code === 40 || code === 41) {
          throw new SubsonicApiError("INVALID_CREDENTIALS", message, {
            retryable: false,
            statusCode: 401,
          });
        }

        throw new SubsonicApiError("UNKNOWN", message, { retryable: false });
      }

      return body as T;
    } catch (error) {
      if (externalSignal?.aborted) {
        throw new SubsonicApiError("CANCELLED", "Request was cancelled.");
      }

      if (error instanceof SubsonicApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new SubsonicApiError(
            "TIMEOUT",
            `Request timed out after ${this.timeoutMs}ms.`,
            { retryable: true, cause: error },
          );
        }

        const message = error.message.toLowerCase();

        if (
          message.includes("network request failed") ||
          message.includes("failed to fetch")
        ) {
          throw new SubsonicApiError(
            "SERVER_UNREACHABLE",
            "Unable to reach the server. Check the URL and your network.",
            { retryable: true, cause: error },
          );
        }

        if (message.includes("ssl") || message.includes("cert")) {
          throw new SubsonicApiError(
            "SSL_ERROR",
            "TLS/SSL connection failed. Verify the server certificate.",
            { retryable: false, cause: error },
          );
        }
      }

      throw new SubsonicApiError(
        "UNKNOWN",
        "Unexpected network error while contacting the server.",
        { retryable: true, cause: error },
      );
    } finally {
      clearTimeout(timeoutId);
      externalSignal?.removeEventListener("abort", abortListener);
    }
  }

  private async assertOnline(): Promise<void> {
    const state = await NetInfo.fetch();
    if (state.isConnected === false) {
      throw new SubsonicApiError(
        "OFFLINE",
        "No network connection. Connect to the internet and try again.",
        { retryable: true },
      );
    }
  }
}
