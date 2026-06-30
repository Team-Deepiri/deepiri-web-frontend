import axios from "axios";
import { POLL_INTERVALS_MS } from "@deepiri/shared";
import type { ImmersiveStatus } from "@deepiri/shared";

const IMMERSIVE_URL = process.env.IMMERSIVE_URL || "http://localhost:5174";

export class ImmersiveChecker {
  private status: ImmersiveStatus = {
    status: "down",
    checkedAt: Date.now(),
  };
  private interval: NodeJS.Timeout | null = null;

  start() {
    this.check();
    this.interval = setInterval(() => this.check(), POLL_INTERVALS_MS.IMMERSIVE_CHECK);
    console.log("ImmersiveChecker started");
  }

  stop() {
    if (this.interval) clearInterval(this.interval);
  }

  getStatus(): ImmersiveStatus {
    return this.status;
  }

  private async check() {
    try {
      await axios.get(`${IMMERSIVE_URL}/ping`, { timeout: 3000 });
      this.status = { status: "live", checkedAt: Date.now() };
    } catch {
      this.status = { status: "down", checkedAt: Date.now() };
    }
  }
}
