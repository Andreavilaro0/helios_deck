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

function fieldOpacity(kp: number): number {
  if (kp >= 5) return 0.75;
  if (kp >= 4) return 0.45;
  return 0.2;
}

export function KpFieldOverlay({ kp }: Props) {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.12;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * 0.08;
    }
  });

  const color = fieldColor(kp);
  const opacity = fieldOpacity(kp);

  return (
    <group>
      {/* Polar field ring — tilted to represent magnetic field inclination */}
      <mesh ref={ring1Ref} rotation={[0, 0, Math.PI / 5]}>
        <torusGeometry args={[1.3, 0.008, 8, 120]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2}
          transparent
          opacity={opacity}
          depthWrite={false}
        />
      </mesh>

      {/* Equatorial ring */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.25, 0.005, 8, 120]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.5}
          transparent
          opacity={opacity * 0.6}
          depthWrite={false}
        />
      </mesh>

      {/* Storm-only outer ring */}
      {kp >= 5 && (
        <mesh rotation={[Math.PI / 3, 0, Math.PI / 6]}>
          <torusGeometry args={[1.4, 0.006, 8, 120]} />
          <meshStandardMaterial
            color="#ff6080"
            emissive="#ff6080"
            emissiveIntensity={3}
            transparent
            opacity={0.5}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}
