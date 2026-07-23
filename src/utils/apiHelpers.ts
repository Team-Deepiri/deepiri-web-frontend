/**
 * Safely builds API URLs with encoded path segments.
 *
 * Each segment is URI-encoded to prevent path traversal and special-character issues.
 * Query parameters with `undefined` or `null` values are automatically stripped.
 *
 * @example
 * buildUrl('/api/users', ['john doe', 'settings'])  → '/api/users/john%20doe/settings'
 * buildUrl('/api/search', [], { q: 'hello world', page: 1 })  → '/api/search?q=hello%20world&page=1'
 */
export function buildUrl(
  base: string,
  segments: (string | number | undefined | null)[] = [],
  params?: Record<string, string | number | boolean | undefined | null>,
): string {
  const encoded = segments
    .filter((s): s is string | number => s != null)
    .map(s => encodeURIComponent(String(s)))
    .join('/');

  const path = encoded ? `${base}/${encoded}` : base;

  if (!params) return path;

  const cleaned = cleanQuery(params);
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(cleaned)) {
    qs.set(key, String(value));
  }
  const search = qs.toString();
  return search ? `${path}?${search}` : path;
}

/**
 * Strips `undefined` and `null` values from a params object,
 * returning only defined key-value pairs.
 *
 * @example
 * cleanQuery({ q: 'test', page: undefined, limit: null, sort: 'asc' })
 * → { q: 'test', sort: 'asc' }
 */
export function cleanQuery<T extends Record<string, unknown>>(
  params: T,
): Partial<T> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      result[key] = value;
    }
  }
  return result as Partial<T>;
}
