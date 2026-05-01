import { useMemo, useRef } from "react";
import * as THREE from "three";

const STAR_COUNT = 1500;

export function StarField() {
  const pointsRef = useRef<THREE.Points>(null);

  const [geometry, material] = useMemo(() => {
    const positions = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT; i++) {
      const r = 80 + Math.random() * 40;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.15,
      color: "#94a3b8",
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.65,
    });

    return [geo, mat] as const;
  }, []);

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}
