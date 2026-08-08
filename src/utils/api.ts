/** Extract API error message from axios-style errors. */
export function getActionErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const message = (err as { response?: { data?: { error?: string } } }).response?.data
      ?.error;
    if (message) {
      return message;
    }
  }
  return fallback;
}
