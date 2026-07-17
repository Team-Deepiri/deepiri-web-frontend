# Deepiri Web Frontend

One Vite/React app, one container. Backends live in **deepiri-platform**.

## Run

```bash
yarn install
yarn dev          # http://localhost:5173  (portal + /immersive)
```

Prefer platform bring-up: `docker-compose.dev.yml` → `frontend-dev` on `deepiri-dev-network`.

## App routes

| Route | What |
|---|---|
| `/` … portal pages | Hub UI (ops, events, launchpad, …) |
| `/immersive` | Three.js universe (same app, not a second container) |
| `/login` | Auth via **api-gateway** → **auth-service** |

## Platform backends (do not add hub-server here)

| Need | Platform service |
|---|---|
| Login / API | `api-gateway` (:5100) + `auth-service` |
| Service catalog + health | `deepiri-registry` (:5003) |
| Live events | `realtime-gateway` (:5008) |
| GitHub webhooks → catalog | `external-bridge` → registry |

Env (see `.env.example`):

```bash
VITE_API_GATEWAY_URL=http://localhost:5100
VITE_REGISTRY_URL=http://localhost:5003
VITE_REALTIME_GATEWAY_URL=http://localhost:5008
```

## Structure

```
src/                 # single app
  app/ pages/ …      # portal shell
  immersive/         # 3D scene (route /immersive)
packages/shared/     # @deepiri/shared types/utils
Dockerfile           # one image (dev + prod targets)
docker-compose.yml   # optional UI-only; primary path is platform compose
```
