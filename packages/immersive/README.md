# Immersive (`packages/immersive`)

Phase 5 — Deepiri Service Galaxy on port **5174**.

```bash
# Terminal A — Hub (required for live health / event relay)
npm run dev:server

# Terminal B — Immersive
npm run dev:immersive

# Terminal C — Portal (Enter 3D button appears when Hub sees :5174 live)
npm run dev
```

## Layers
1. **Service Galaxy** — health-colored spheres, category clusters, pulsing edges
2. **Event Particles** — Hub WS / demo particles fly along curves (producer colors)
3. **Constellation gravity** — D3-force drifts nodes by traffic

Controls: category filters, particles, constellation, 2D fallback, keyboard Tab/Space/Esc.
Back to Portal is always top-left.
