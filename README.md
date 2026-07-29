# Deepiri Web Frontend

One Vite/React app, one container. Backends live in **deepiri-platform**.

## Run (primary — platform normal workflow)

From the **deepiri-platform** repo root (not this folder):

```bash
# Auth + gateway + realtime + frontend together (recommended)
docker compose -f docker-compose.dev.yml up -d auth-service api-gateway realtime-gateway frontend-dev

# Or bring the whole platform stack
docker compose -f docker-compose.dev.yml up -d
```

Then open **http://localhost:5173**.

`frontend-dev` builds from this submodule (`./deepiri-web-frontend`), mounts the source for Vite HMR, and joins `deepiri-dev-network` so it can reach platform services. Prefer this over any compose file in this repo.

Optional local UI-only (already on the platform network):

```bash
# only if platform stack / network is already up
docker compose up   # see docker-compose.yml — not the default path
```

### Host npm (optional)

```bash
npm install
npm run dev          # http://localhost:5173  (portal + /immersive)
```

## App routes

| Route | What |
|---|---|
| `/` … portal pages | Hub UI (ops, events, launchpad, …) |
| `/immersive` | Three.js universe (same app, not a second container) |
| `/login` | Auth via **api-gateway** → **auth-service** |
| `/contact` | Contact form |

## Platform backends (do not add hub-server here)

| Need | Platform service |
|---|---|
| Login / API | `api-gateway` (:5100) + `auth-service` (:5001) |
| Service catalog + health | registry / gateway-proxied catalog |
| Live events + multi-user presence | `realtime-gateway` (:5008) |
| GitHub webhooks → catalog | `external-bridge` → registry |

Env (see `.env.example`; also set on `frontend-dev` in platform `docker-compose.dev.yml`):

```bash
VITE_API_GATEWAY_URL=http://localhost:5100
VITE_REGISTRY_URL=http://localhost:5003
VITE_REALTIME_GATEWAY_URL=http://localhost:5008
```

## Multi-user realtime

Presence and live collaboration belong in **platform `realtime-gateway`**, not a frontend-only multiplayer module. The app joins the gateway over socket.io (`usePresence` / `useEventStream`) so other clients on the same page can be visible. Extending rooms / peer UX is a platform-service concern.

## Structure

```
src/                 # single app
  app/ pages/ …      # portal shell
  immersive/         # 3D scene (route /immersive)
packages/shared/     # @deepiri/shared types/utils
Dockerfile           # one image (dev + prod targets)
docker-compose.yml   # optional UI-only; primary path is platform compose
```
