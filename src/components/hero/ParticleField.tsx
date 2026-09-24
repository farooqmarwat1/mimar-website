"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Subtle atmospheric depth layer for the hero - the "3D experience" from the
 * stack. Deliberately minimal: soft floating dust/light motes that drift and
 * gently react to scroll progress, giving the push-in animation real depth
 * parallax without needing an actual 3D building model.
 *
 * Kept as its own component so it can be swapped for a real R3F scene later
 * (e.g. a low-poly building the camera flies through) without touching the
 * scroll/crossfade logic in Hero.tsx.
 */

// Deterministic pseudo-random generator (same input -> same output), so
// generating the mote field stays a pure/idempotent computation - Math.random
// inside render/useMemo trips React Compiler's purity checks.
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 43758.5453;
  return x - Math.floor(x);
}

function Motes({ progress }: { progress: React.MutableRefObject<number> }) {
  const count = 260;
  const points = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (seededRandom(i * 12.9898) - 0.5) * 12;
      arr[i * 3 + 1] = (seededRandom(i * 78.233) - 0.5) * 7;
      arr[i * 3 + 2] = (seededRandom(i * 37.719) - 0.5) * 10;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!points.current) return;
    const t = state.clock.getElapsedTime();
    points.current.rotation.y = t * 0.015 + progress.current * 0.6;
    points.current.position.z = progress.current * 4;
    points.current.position.y = -progress.current * 0.6;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#fcfcfc"
        transparent
        opacity={0.45}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export default function ParticleField({ progress }: { progress: React.MutableRefObject<number> }) {
  return (
    <Canvas
      className="pointer-events-none"
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 0, 5], fov: 50 }}
    >
      <Motes progress={progress} />
    </Canvas>
  );
}
