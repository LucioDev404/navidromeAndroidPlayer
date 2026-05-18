import { SubsonicApiError } from "../api/subsonic/models/errors";
import { normalizeServerUrl } from "../api/subsonic/utils/url";

export interface LoginFormValues {
  label: string;
  baseUrl: string;
  username: string;
  password: string;
}

export interface LoginFormErrors {
  label?: string;
  baseUrl?: string;
  username?: string;
  password?: string;
}

export function validateLoginForm(values: LoginFormValues): LoginFormErrors {
  const errors: LoginFormErrors = {};

  if (!values.label.trim()) {
    errors.label = "Give this server a name";
  }

  if (!values.baseUrl.trim()) {
    errors.baseUrl = "Server URL is required";
  } else {
    try {
      normalizeServerUrl(values.baseUrl);
    } catch (error) {
      errors.baseUrl =
        error instanceof SubsonicApiError
          ? error.message
          : "Enter a valid server URL";
    }
  }

  if (!values.username.trim()) {
    errors.username = "Username is required";
  }

  if (!values.password) {
    errors.password = "Password is required";
  }

  return errors;
}

export function hasLoginFormErrors(errors: LoginFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
