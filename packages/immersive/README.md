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
1. **Service Galaxy** — instanced health-colored spheres, category clusters, Line2 edges that pulse with traffic
2. **Event Particles** — Hub WS / demo particles fly CatmullRomCurve3 paths (producer colors from `@deepiri/shared`)
3. **Constellation gravity** — D3-force drifts nodes by traffic; high-degree services pull center

## Controls
Category filters · particles · constellation · 2D fallback · reset camera · keyboard Tab / Space / Esc

**Back to Portal** is always top-left. Portal JWT arrives via `postMessage` (`deepiri:auth`).

## Performance
- 60fps target; if frame time stays above ~20ms, quality drops to 30fps (lower DPR, particles off)
- WebGL detect → D3 `FlatGraph` fallback
- `prefers-reduced-motion` disables particles / starfield / gravity

## Smoke
```bash
curl -s http://localhost:5200/health/immersive
curl -s -X POST http://localhost:5200/events/demo -H 'content-type: application/json' -d '{"producer":"synapse"}'
curl -s -X POST http://localhost:5200/health/immersive/check
```
