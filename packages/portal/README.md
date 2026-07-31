# @deepiri/portal

Phase 3 Portal shell lives in the running SPA under `src/app/` (Shell, Topbar,
Sidebar, Cyrex panel, Immersive button) so `npm run dev` on the root Vite app
is the Client Hub.

This package remains the monorepo home for the eventual standalone portal
Vite entry (`dev:portal`). Until that cutover:

| Doc path | Live path |
|----------|-----------|
| `packages/portal/src/app/Shell.tsx` | `src/app/Shell.tsx` |
| `packages/portal/src/store/*` | `src/store/*` |
| `packages/portal/src/hooks/useImmersiveStatus.ts` | `src/hooks/useImmersiveStatus.ts` |

Hub Server: `packages/server` on `:5200`.
