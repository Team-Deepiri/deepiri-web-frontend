# Deepiri Web Frontend

Monorepo — 3 services, 1 repo.

## Services

| Service | Port | Description |
|---|---|---|
| `packages/portal` | 5173 | Main hub — every team, every role, every day |
| `packages/immersive` | 5174 | Three.js 3D universe — separate subrepo service |
| `packages/server` | 5200 | Hub backend server — owned by the frontend team |
| `packages/shared` | — | Shared types and utilities (@deepiri/shared) |

## Getting Started

```bash
# Install dependencies
yarn install

# Run all services
yarn dev:all

# Run individually
yarn dev:portal
yarn dev:server
yarn dev:immersive
```

## Structure

```
packages/
  portal/      # React + Vite — port 5173
  immersive/   # Three.js — port 5174
  server/      # Fastify — port 5200
  shared/      # @deepiri/shared types + utils
```

## Notes
- Hub Server must be running before Portal and Immersive
- Immersive button in Portal navbar only appears when Immersive is detected live
- Frontend only — no platform microservices are modified
