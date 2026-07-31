/** Map health-ish status strings to a CSS class with a dashboard-specific prefix. */
export function statusBadgeClass(status: string, prefix: string): string {
  switch (status) {
    case 'healthy':
    case 'ok':
      return `${prefix}-status-healthy`;
    case 'unhealthy':
    case 'down':
      return `${prefix}-status-unhealthy`;
    default:
      return `${prefix}-status-unknown`;
  }
}
