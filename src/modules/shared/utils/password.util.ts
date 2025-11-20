export function generateTempPassword(): string {
  return Math.random().toString(36).slice(-10);
}
