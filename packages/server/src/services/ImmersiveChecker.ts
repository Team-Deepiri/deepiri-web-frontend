export type ImmersiveStatus = 'live' | 'down';

export class ImmersiveChecker {
  private status: ImmersiveStatus = 'down';
  private lastChecked: string | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private readonly url: string;
  private readonly intervalMs: number;

  constructor(
    url = process.env.IMMERSIVE_URL ?? 'http://localhost:5174',
    intervalMs = 30_000
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
