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
| GET | `/registry` | Repo + service registry |
| PATCH | `/registry/:id` | Update a registered repo |
| GET | `/docker/status` | `docker compose ps` per registered repo |
| POST | `/webhook/github` | Auto-discover repos from GitHub events |
| GET | `/graph/repos` | Repos available for graphing |
| GET | `/graph/:repoId` | Community knowledge graph for a repo |
| WS | `/ws/events` | Realtime-gateway event relay |

Env: see `.env.example`.
