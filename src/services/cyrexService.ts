import type { ServiceHealth } from '../types/hub';
import type { DeepiriEvent } from '../types/hub';

// Re-export for callers that still want the hub types
export type { ServiceHealth, DeepiriEvent };

const CYREX_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CYREX_URL) ||
  'http://localhost:8000';

export type CyrexChatContext = {
  page: string;
  selectedService: string | null;
  recentEvents: Array<{ id: string; type: string; producer: string; error?: boolean }>;
  healthSummary: {
    up: number;
    down: number;
    degraded: number;
    total: number;
    worst?: string[];
  };
};

export type CyrexStreamHandlers = {
  onToken: (chunk: string) => void;
  onDone?: () => void;
  onError?: (err: Error) => void;
  signal?: AbortSignal;
};

export function buildCyrexContext(args: {
  page: string;
  selectedService: string | null;
  services: Array<{
    serviceId: string;
    name?: string;
    status: string;
    latencyMs: number | null;
    healthBand: string;
  }>;
  events: Array<{ id: string; type: string; producer: string; error?: boolean }>;
}): CyrexChatContext {
  const up = args.services.filter((s) => s.status === 'up').length;
  const down = args.services.filter((s) => s.status === 'down').length;
  const degraded = args.services.filter((s) => s.status === 'degraded').length;
  return {
    page: args.page,
    selectedService: args.selectedService,
    recentEvents: args.events.slice(-3).map((e) => ({
      id: e.id,
      type: e.type,
      producer: e.producer,
      error: e.error,
    })),
    healthSummary: {
      up,
      down,
      degraded,
      total: args.services.length,
      worst: args.services
        .filter((s) => s.status === 'down' || s.status === 'degraded')
        .slice(0, 5)
        .map((s) => s.name ?? s.serviceId),
    },
  };
}

/** Probe diri-cyrex availability (fast HEAD/GET). */
export async function probeCyrex(timeoutMs = 2500): Promise<boolean> {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(`${CYREX_URL}/health`, { signal: controller.signal }).catch(() =>
      fetch(`${CYREX_URL}/`, { signal: controller.signal })
    );
    clearTimeout(t);
    return Boolean(res && (res.ok || res.status === 404));
  } catch {
    return false;
  }
}

/**
 * Stream a chat reply from diri-cyrex.
 * Tries `/agent/message/stream`, then `/chat` SSE-ish body, then non-stream `/agent/message`.
 */
export async function streamCyrexChat(
  content: string,
  context: CyrexChatContext,
  handlers: CyrexStreamHandlers
): Promise<void> {
  const body = JSON.stringify({
    content,
    message: content,
    context,
    page: context.page,
  });

  const tryStream = async (path: string): Promise<boolean> => {
    const res = await fetch(`${CYREX_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream, text/plain, application/json' },
      body,
      signal: handlers.signal,
    });
    if (!res.ok || !res.body) return false;

    const ctype = res.headers.get('content-type') || '';
    if (ctype.includes('application/json')) {
      const data = (await res.json()) as { data?: { message?: string }; message?: string; reply?: string };
      const text = data?.data?.message || data?.message || data?.reply || '';
      if (text) handlers.onToken(text);
      handlers.onDone?.();
      return true;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      // Strip simple SSE `data:` prefixes if present
      const cleaned = chunk
        .split('\n')
        .map((line) => (line.startsWith('data:') ? line.slice(5).trim() : line))
        .filter((line) => line && line !== '[DONE]')
        .join('');
      if (cleaned) handlers.onToken(cleaned);
    }
    handlers.onDone?.();
    return true;
  };

  try {
    if (await tryStream('/agent/message/stream')) return;
    if (await tryStream('/chat')) return;
    if (await tryStream('/agent/message')) return;
    throw new Error('Cyrex unreachable or returned an empty response');
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    handlers.onError?.(error);
    throw error;
  }
}

export { CYREX_URL };
