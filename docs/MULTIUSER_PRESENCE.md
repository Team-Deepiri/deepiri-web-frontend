# Multi-user presence (platform realtime-gateway)

Joe’s review on the old `MultiplayerCollaboration.tsx` asked for multi-user realtime via **platform services**, not a frontend-only multiplayer stack.

## Approach on this branch

- The SPA connects to **`realtime-gateway`** (`VITE_REALTIME_GATEWAY_URL`, default `:5008`) with socket.io.
- `src/hooks/usePresence.ts` announces the signed-in user and listens for `presence:update` in room `deepiri-hub`.
- The Topbar shows peer count when the gateway is connected.

## Platform follow-up

Hardening (authenticated rooms, server-authoritative roster, cursor/selection sync) belongs in **`deepiri-realtime-gateway`**, not a second frontend hub-server. Frontend should stay a thin client of that service.
