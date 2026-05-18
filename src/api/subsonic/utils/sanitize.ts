export function sanitizeLabel(label: string): string {
  return label.trim().slice(0, 64);
}

export function sanitizeUsername(username: string): string {
  return username.trim().slice(0, 128);
}

export function sanitizePassword(password: string): string {
  return password;
}

export function sanitizeErrorMessage(message: string): string {
  return message.replace(/(password|token|secret)=[^&\s]+/gi, "$1=[REDACTED]");
}
