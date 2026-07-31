/** Short, locale-aware timestamp for Ops dashboards. */
export function formatTimestamp(value?: string | null, emptyLabel = 'Not started'): string {
  if (!value) return emptyLabel;
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
