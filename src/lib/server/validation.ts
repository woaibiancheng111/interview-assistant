const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeString(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value);
}

export function isStrongEnoughPassword(value: string, minLength = 6): boolean {
  return value.length >= minLength;
}
