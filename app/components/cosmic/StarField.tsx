import { useMemo } from "react";
import * as THREE from "three";

function makeStarGeo(count: number, rMin: number, rMax: number): THREE.BufferGeometry {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = rMin + Math.random() * (rMax - rMin);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return geo;
}

export function StarField() {
  const [dimGeo, dimMat] = useMemo(() => {
    const geo = makeStarGeo(1200, 85, 120);
    const mat = new THREE.PointsMaterial({
      size: 0.10,
      color: "#94a3b8",
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.55,
    });
    return [geo, mat] as const;
  }, []);

  const [midGeo, midMat] = useMemo(() => {
    const geo = makeStarGeo(350, 82, 115);
    const mat = new THREE.PointsMaterial({
      size: 0.18,
      color: "#e2e8f0",
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.75,
    });
    return [geo, mat] as const;
  }, []);

  const [brightGeo, brightMat] = useMemo(() => {
    const geo = makeStarGeo(80, 80, 100);
    const mat = new THREE.PointsMaterial({
      size: 0.30,
      color: "#f8fafc",
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.92,
    });
    return [geo, mat] as const;
  }, []);

  return (
    <group>
      <points geometry={dimGeo} material={dimMat} />
      <points geometry={midGeo} material={midMat} />
      <points geometry={brightGeo} material={brightMat} />
    </group>
  );
}
