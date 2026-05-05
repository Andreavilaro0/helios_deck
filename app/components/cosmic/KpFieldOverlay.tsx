import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  kp: number;
}

function fieldColor(kp: number): string {
  if (kp >= 5) return "#f43f5e";
  if (kp >= 4) return "#f59e0b";
  return "#22d3ee";
}

function outerColor(kp: number): string {
  if (kp >= 5) return "#fb923c";
  if (kp >= 4) return "#fcd34d";
  return "#818cf8";
}

function baseOpacity(kp: number): number {
  if (kp >= 5) return 0.78;
  if (kp >= 4) return 0.52;
  return 0.30;
}

export function KpFieldOverlay({ kp }: Props) {
  const ref0 = useRef<THREE.Mesh>(null);
  const ref1 = useRef<THREE.Mesh>(null);
  const ref2 = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ref0.current) ref0.current.rotation.y += delta * 0.05;
    if (ref1.current) ref1.current.rotation.y -= delta * 0.035;
    if (ref2.current) ref2.current.rotation.y += delta * 0.018;
  });

  const color   = fieldColor(kp);
  const outer   = outerColor(kp);
  const opacity = baseOpacity(kp);

  return (
    <group>
      {/* Inner ring — equatorial current sheet, ~11.5° dipole tilt */}
      <mesh ref={ref0} rotation={[Math.PI / 2 + 0.20, 0, 0]}>
        <torusGeometry args={[1.26, 0.006, 8, 160]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2.8}
          transparent
          opacity={opacity}
          depthWrite={false}
        />
      </mesh>

      {/* Mid ring — higher L-shell (~L 4) */}
      <mesh ref={ref1} rotation={[0.48, 0.15, 0.10]}>
        <torusGeometry args={[1.38, 0.004, 8, 160]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.8}
          transparent
          opacity={opacity * 0.55}
          depthWrite={false}
        />
      </mesh>

      {/* Outer belt */}
      <mesh ref={ref2} rotation={[0.68, 0.0, 0.35]}>
        <torusGeometry args={[1.54, 0.004, 8, 160]} />
        <meshStandardMaterial
          color={outer}
          emissive={outer}
          emissiveIntensity={1.5}
          transparent
          opacity={opacity * 0.32}
          depthWrite={false}
        />
      </mesh>

      {/* North auroral ring — at ~70° latitude */}
      <group position={[0, 0.72, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.68, 0.003, 6, 80]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.8}
            transparent
            opacity={opacity * 0.55}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* South auroral ring */}
      <group position={[0, -0.72, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.68, 0.003, 6, 80]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.8}
            transparent
            opacity={opacity * 0.55}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Storm ring — compressed magnetosphere */}
      {kp >= 5 && (
        <mesh rotation={[Math.PI / 2 + 0.10, 0, 0]}>
          <torusGeometry args={[1.18, 0.007, 8, 160]} />
          <meshStandardMaterial
            color="#ff4060"
            emissive="#ff4060"
            emissiveIntensity={3.5}
            transparent
            opacity={0.75}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}
