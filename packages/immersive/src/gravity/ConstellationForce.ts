import * as d3 from 'd3';
import { IMMERSIVE_EDGES, IMMERSIVE_SERVICES } from '../config/services';
import { useSceneStore } from '../store/sceneStore';

type SimNode = { id: string; x?: number; y?: number; z?: number; vx?: number; vy?: number; vz?: number };

/**
 * Lightweight 3D constellation: project force simulation onto x/z,
 * keep subtle y drift. Link strength scales with live traffic.
 */
export class ConstellationForce {
  private sim: d3.Simulation<SimNode, undefined> | null = null;
  private nodes: SimNode[] = [];
  private running = false;

  start(): void {
    if (this.running) return;
    this.running = true;
    this.nodes = IMMERSIVE_SERVICES.map((s) => {
      const n = useSceneStore.getState().nodes[s.id];
      return {
        id: s.id,
        x: n?.position[0] ?? 0,
        y: n?.position[1] ?? 0,
        z: n?.position[2] ?? 0,
      };
    });

    const links = IMMERSIVE_EDGES.map(([source, target]) => ({ source, target }));

    this.sim = d3
      .forceSimulation(this.nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .id((d) => (d as SimNode).id)
          .distance(4.5)
          .strength((l) => {
            const a = typeof l.source === 'object' ? (l.source as SimNode).id : String(l.source);
            const b = typeof l.target === 'object' ? (l.target as SimNode).id : String(l.target);
            const key = [a, b].sort().join('::');
            const traffic = useSceneStore.getState().traffic[key] ?? 0;
            return Math.min(1, 0.15 + traffic * 0.04);
          })
      )
      .force('charge', d3.forceManyBody().strength(-18))
      .force('center', d3.forceCenter(0, 0))
      .force(
        'towardCenter',
        // High-connection / high-traffic nodes drift inward
        () => {
          for (const n of this.nodes) {
            const deg = useSceneStore.getState().nodes[n.id]?.connections ?? 1;
            const pull = Math.min(0.08, deg * 0.008);
            n.vx = (n.vx ?? 0) - (n.x ?? 0) * pull * 0.02;
            n.vy = (n.vy ?? 0) - (n.y ?? 0) * pull * 0.02;
          }
        }
      )
      .alpha(0.55)
      .alphaDecay(0.022);

    this.sim.on('tick', () => {
      if (!useSceneStore.getState().constellationMode) return;
      for (const n of this.nodes) {
        const cur = useSceneStore.getState().nodes[n.id];
        if (!cur) continue;
        // Map 2D sim x/y → world x/z; preserve gentle y
        const y = (cur.position[1] + (n.y ?? 0) * 0.02) * 0.98;
        useSceneStore.getState().setNodePosition(n.id, [n.x ?? 0, y, n.y ?? 0]);
      }
    });
  }

  stop(): void {
    this.sim?.stop();
    this.sim = null;
    this.running = false;
  }

  reheat(): void {
    this.sim?.alpha(0.35).restart();
  }
}
