# Hub Server (`packages/server`)

Lightweight Fastify BFF for the Client Hub (port **5200**).

## Run

```bash
npm run dev:server
# or
npm --prefix packages/server run dev
```

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Hub liveness |
| GET | `/health/all` | Aggregated platform service health |
| GET | `/health/immersive` | Immersive `:5174` live/down |
| GET | `/registry` | Merged catalog from deepiri-registry + local seed overlays |
| GET | `/registry/tools` | Proxy registry tools catalog |
| GET | `/registry/ecosystem` | Proxy registry ecosystem health |
| GET | `/registry/:id` | Lookup repo/service by id |
| PATCH | `/registry/:id` | **501** — mutations belong to deepiri-registry |
| GET | `/docker/status` | `docker compose ps` per seeded local repo |
| POST | `/webhook/github` | Acknowledge discovery (no local JSON write; registry owns catalog) |
| GET | `/github/readme/:owner/:repo` | Proxy README (Launchpad) |
| GET | `/github/commits/:owner/:repo` | Proxy recent commits |
| GET | `/graph/repos` | Repos available for graphing |
| GET | `/graph/:repoId` | Community knowledge graph for a repo |
| WS | `/ws/events` | Realtime-gateway event relay |

Env: see `.env.example` (`REGISTRY_URL` defaults to `http://localhost:5003`).
