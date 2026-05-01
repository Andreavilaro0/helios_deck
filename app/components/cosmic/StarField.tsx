import { useMemo } from "react";
import * as THREE from "three";

const DIM_COUNT = 2700;
const BRIGHT_COUNT = 300;

function makeStarGeometry(count: number): THREE.BufferGeometry {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 80 + Math.random() * 40;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return geo;
}

export function StarField() {
  const [dimGeo, dimMat] = useMemo(() => {
    const geo = makeStarGeometry(DIM_COUNT);
    const mat = new THREE.PointsMaterial({
      size: 0.1,
      color: "#94a3b8",
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.5,
    });
    return [geo, mat] as const;
  }, []);

  const [brightGeo, brightMat] = useMemo(() => {
    const geo = makeStarGeometry(BRIGHT_COUNT);
    const mat = new THREE.PointsMaterial({
      size: 0.22,
      color: "#e2e8f0",
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9,
    });
    return [geo, mat] as const;
  }, []);

  return (
    <>
      <points geometry={dimGeo} material={dimMat} />
      <points geometry={brightGeo} material={brightMat} />
    </>
  );
}
