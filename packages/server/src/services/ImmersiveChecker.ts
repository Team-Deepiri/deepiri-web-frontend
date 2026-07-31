export type ImmersiveStatus = 'live' | 'down';

export class ImmersiveChecker {
  private status: ImmersiveStatus = 'down';
  private lastChecked: string | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private readonly url: string;
  private readonly intervalMs: number;

  constructor(
    url = process.env.IMMERSIVE_URL ?? 'http://localhost:5174',
    // Match portal health cadence so Enter 3D appears promptly when :5174 is up
    intervalMs = 10_000
  ) {
    this.url = url.replace(/\/$/, '');
    this.intervalMs = intervalMs;
  }

  start(): void {
    void this.check();
    this.timer = setInterval(() => {
      void this.check();
    }, this.intervalMs);
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  getStatus(): { status: ImmersiveStatus; lastChecked: string | null; url: string } {
    return { status: this.status, lastChecked: this.lastChecked, url: this.url };
  }

  /** Public re-check for Hub routes / tests. */
  async recheck(): Promise<{ status: ImmersiveStatus; lastChecked: string | null; url: string }> {
    await this.check();
    return this.getStatus();
  }

  private async check(): Promise<void> {
    this.lastChecked = new Date().toISOString();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3_000);
      const res = await fetch(this.url, { signal: controller.signal, method: 'HEAD' }).catch(
        async () => fetch(this.url, { signal: controller.signal })
      );
      clearTimeout(timeout);
      this.status = res.ok || res.status === 404 ? 'live' : 'down';
    } catch {
      this.status = 'down';
    }
  }
}
