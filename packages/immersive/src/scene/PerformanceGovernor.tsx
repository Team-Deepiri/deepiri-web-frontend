import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useSceneStore } from '../store/sceneStore';

/**
 * 60fps target; if frame time > 20ms for several frames, degrade to 30fps
 * (lower DPR, drop particles / starfield via sceneStore.quality).
 */
export function PerformanceGovernor() {
  const { gl } = useThree();
  const ema = useRef(12);
  const badStreak = useRef(0);
  const goodStreak = useRef(0);
  const setTargetFps = useSceneStore((s) => s.setTargetFps);
  const setQuality = useSceneStore((s) => s.setQuality);
  const setParticlesEnabled = useSceneStore((s) => s.setParticlesEnabled);
  const targetFps = useSceneStore((s) => s.targetFps);
  const reducedMotion = useSceneStore((s) => s.reducedMotion);

  useFrame((_, dt) => {
    if (reducedMotion) return;
    const ms = dt * 1000;
    ema.current = ema.current * 0.9 + ms * 0.1;

    if (ema.current > 20) {
      badStreak.current += 1;
      goodStreak.current = 0;
      if (badStreak.current > 45 && targetFps !== 30) {
        setTargetFps(30);
        setQuality('medium');
        setParticlesEnabled(false);
        gl.setPixelRatio(Math.min(1.25, window.devicePixelRatio));
      }
    } else if (ema.current < 14) {
      goodStreak.current += 1;
      badStreak.current = 0;
      if (goodStreak.current > 120 && targetFps !== 60) {
        setTargetFps(60);
        setQuality('high');
        gl.setPixelRatio(Math.min(1.75, window.devicePixelRatio));
      }
    }
  });

  return null;
}
