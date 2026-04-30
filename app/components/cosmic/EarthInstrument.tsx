import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  kp: number;
}

function sphereColor(kp: number): string {
  if (kp >= 5) return "#0a0206";
  if (kp >= 4) return "#090600";
  return "#020b14";
}

function sphereEmissive(kp: number): string {
  if (kp >= 5) return "#3d0000";
  if (kp >= 4) return "#2d1500";
  return "#001520";
}

function sphereEmissiveIntensity(kp: number): number {
  if (kp >= 5) return 0.35;
  if (kp >= 4) return 0.2;
  return 0.08;
}

function atmosphereColor(kp: number): string {
  if (kp >= 5) return "#ff2040";
  if (kp >= 4) return "#f59e0b";
  return "#06b6d4";
}

function atmosphereOpacity(kp: number): number {
  if (kp >= 5) return 0.22;
  if (kp >= 4) return 0.14;
  return 0.07;
}

export function EarthInstrument({ kp }: Props) {
  const sphereRef = useRef<THREE.Mesh>(null);
  const atmosRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y += delta * 0.06;
    }
    if (atmosRef.current) {
      atmosRef.current.rotation.y -= delta * 0.02;
    }
  });

  return (
    <group>
      {/* Main planet sphere */}
      <mesh ref={sphereRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          color={sphereColor(kp)}
          emissive={sphereEmissive(kp)}
          emissiveIntensity={sphereEmissiveIntensity(kp)}
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>

      {/* Atmosphere — slightly larger, BackSide renders from inside */}
      <mesh ref={atmosRef}>
        <sphereGeometry args={[1.06, 64, 64]} />
        <meshStandardMaterial
          color={atmosphereColor(kp)}
          transparent
          opacity={atmosphereOpacity(kp)}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
