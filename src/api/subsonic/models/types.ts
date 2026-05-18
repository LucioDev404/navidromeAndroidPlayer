export type ConnectionHealthStatus =
  | "unknown"
  | "healthy"
  | "unhealthy"
  | "unreachable";

export interface NavidromeEndpoint {
  id: string;
  label: string;
  baseUrl: string;
  username: string;
  createdAt: string;
  lastConnectedAt?: string;
  connectionStatus: ConnectionHealthStatus;
}

export interface EndpointCredentials {
  username: string;
  password: string;
}

export interface SubsonicAuthParams {
  u: string;
  t: string;
  s: string;
  v: string;
  c: string;
  f: "json";
}

export interface SubsonicResponseEnvelope<T> {
  "subsonic-response": {
    status: "ok" | "failed";
    version: string;
    type?: string;
    error?: {
      code: number;
      message: string;
    };
  } & T;
}

export interface SubsonicPingResult {
  status: "ok" | "failed";
  version?: string;
  type?: string;
  openSubsonic?: boolean;
}

export interface CreateEndpointInput {
  label: string;
  baseUrl: string;
  username: string;
  password: string;
}

export interface UpdateEndpointInput {
  label?: string;
  baseUrl?: string;
  username?: string;
  password?: string;
}
