import { Suspense, useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

type PlanetKey =
  | "mercury"
  | "venus"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune"
  | "pluto";

interface PlanetSpec {
  key: PlanetKey;
  texturePath: string;
  radius: number;
  orbitRadius: number;
  orbitTilt: number;
  orbitSpeed: number;
  rotationSpeed: number;
  angleOffset: number;
  yOffset: number;
  zOffset: number;
  emissive?: string;
  ring?: {
    texturePath: string;
    innerRadius: number;
    outerRadius: number;
    tiltX: number;
  };
}

const PLANETS: PlanetSpec[] = [
  {
    key: "mercury",
    texturePath: "/textures/atlas26/mercury.jpg",
    radius: 0.11,
    orbitRadius: 2.15,
    orbitTilt: 0.08,
    orbitSpeed: 0.18,
    rotationSpeed: 0.7,
    angleOffset: 0.2,
    yOffset: 0.16,
    zOffset: -1.6,
  },
  {
    key: "venus",
    texturePath: "/textures/atlas26/venus_surface.jpg",
    radius: 0.18,
    orbitRadius: 2.5,
    orbitTilt: -0.1,
    orbitSpeed: 0.14,
    rotationSpeed: 0.4,
    angleOffset: 1.0,
    yOffset: -0.2,
    zOffset: -1.9,
    emissive: "#51331a",
  },
  {
    key: "mars",
    texturePath: "/textures/atlas26/mars.jpg",
    radius: 0.15,
    orbitRadius: 2.9,
    orbitTilt: 0.14,
    orbitSpeed: 0.11,
    rotationSpeed: 0.55,
    angleOffset: 2.2,
    yOffset: 0.2,
    zOffset: -2.1,
    emissive: "#4a2416",
  },
  {
    key: "jupiter",
    texturePath: "/textures/atlas26/jupiter.jpg",
    radius: 0.34,
    orbitRadius: 3.55,
    orbitTilt: -0.06,
    orbitSpeed: 0.08,
    rotationSpeed: 0.9,
    angleOffset: 3.0,
    yOffset: -0.3,
    zOffset: -2.55,
    emissive: "#3b2417",
  },
  {
    key: "saturn",
    texturePath: "/textures/atlas26/saturn.jpg",
    radius: 0.3,
    orbitRadius: 4.05,
    orbitTilt: 0.11,
    orbitSpeed: 0.065,
    rotationSpeed: 0.8,
    angleOffset: 4.05,
    yOffset: 0.26,
    zOffset: -2.9,
    emissive: "#493c22",
    ring: {
      texturePath: "/textures/atlas26/saturn_ring.png",
      innerRadius: 0.42,
      outerRadius: 0.72,
      tiltX: Math.PI / 2.5,
    },
  },
  {
    key: "uranus",
    texturePath: "/textures/atlas26/uranus.jpg",
    radius: 0.22,
    orbitRadius: 4.55,
    orbitTilt: -0.18,
    orbitSpeed: 0.05,
    rotationSpeed: 0.35,
    angleOffset: 5.0,
    yOffset: -0.12,
    zOffset: -3.15,
    emissive: "#163842",
  },
  {
    key: "neptune",
    texturePath: "/textures/atlas26/neptune.jpg",
    radius: 0.21,
    orbitRadius: 4.95,
    orbitTilt: 0.16,
    orbitSpeed: 0.042,
    rotationSpeed: 0.32,
    angleOffset: 5.85,
    yOffset: 0.1,
    zOffset: -3.45,
    emissive: "#10285b",
  },
  {
    key: "pluto",
    texturePath: "/textures/atlas26/pluto.webp",
    radius: 0.09,
    orbitRadius: 5.35,
    orbitTilt: -0.12,
    orbitSpeed: 0.03,
    rotationSpeed: 0.22,
    angleOffset: 0.95,
    yOffset: -0.08,
    zOffset: -3.8,
  },
];

function configureTexture(texture: THREE.Texture) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 8;
}

function OrbitTrack({ radius, tilt, zOffset }: { radius: number; tilt: number; zOffset: number }) {
  const geometry = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, radius, radius * 0.46, 0, Math.PI * 2, false, 0);
    const points = curve.getPoints(160).map((point) => new THREE.Vector3(point.x, point.y, zOffset));
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [radius, zOffset]);

  return (
    <lineLoop rotation={[0, 0, tilt]}>
      <primitive object={geometry} attach="geometry" />
      <lineBasicMaterial color="#6ea6ff" transparent opacity={0.09} />
    </lineLoop>
  );
}

function Planet({ spec, texture, ringTexture }: { spec: PlanetSpec; texture: THREE.Texture; ringTexture?: THREE.Texture }) {
  const orbitRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  const ringGeometry = useMemo(() => {
    if (!spec.ring) return null;
    const geometry = new THREE.RingGeometry(spec.ring.innerRadius, spec.ring.outerRadius, 128);
    const positions = geometry.attributes.position;
    const uv = geometry.attributes.uv;

    for (let i = 0; i < positions.count; i += 1) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const distance = Math.sqrt(x * x + y * y);
      const u = (distance - spec.ring.innerRadius) / (spec.ring.outerRadius - spec.ring.innerRadius);
      uv.setXY(i, u, 0.5);
    }

    return geometry;
  }, [spec]);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();

    if (orbitRef.current) {
      orbitRef.current.rotation.z = spec.orbitTilt;
      orbitRef.current.rotation.y = elapsed * spec.orbitSpeed + spec.angleOffset;
    }

    if (meshRef.current) {
      meshRef.current.rotation.y = elapsed * spec.rotationSpeed;
    }
  });

  return (
    <>
      <OrbitTrack radius={spec.orbitRadius} tilt={spec.orbitTilt} zOffset={spec.zOffset} />
      <group ref={orbitRef}>
        <group position={[spec.orbitRadius, spec.yOffset, spec.zOffset]}>
          <mesh ref={meshRef}>
            <sphereGeometry args={[spec.radius, 48, 48]} />
            <meshStandardMaterial
              map={texture}
              emissive={spec.emissive ?? "#000000"}
              emissiveIntensity={spec.emissive ? 0.15 : 0}
              roughness={1}
              metalness={0}
            />
          </mesh>

          {spec.ring && ringGeometry && ringTexture ? (
            <mesh rotation={[spec.ring.tiltX, 0, 0]}>
              <primitive object={ringGeometry} attach="geometry" />
              <meshBasicMaterial
                map={ringTexture}
                side={THREE.DoubleSide}
                transparent
                opacity={0.88}
                depthWrite={false}
              />
            </mesh>
          ) : null}
        </group>
      </group>
    </>
  );
}

function PlanetarySystemMesh() {
  const planetTexturePaths = PLANETS.map((planet) => planet.texturePath);
  const textures = useLoader(THREE.TextureLoader, planetTexturePaths) as THREE.Texture[];
  const saturnRingTexture = useLoader(THREE.TextureLoader, "/textures/atlas26/saturn_ring.png");

  useEffect(() => {
    textures.forEach(configureTexture);
    configureTexture(saturnRingTexture);
  }, [textures, saturnRingTexture]);

  const textureMap = useMemo(() => {
    return PLANETS.reduce<Record<PlanetKey, THREE.Texture>>((acc, planet, index) => {
      acc[planet.key] = textures[index];
      return acc;
    }, {} as Record<PlanetKey, THREE.Texture>);
  }, [textures]);

  return (
    <group>
      {PLANETS.map((planet) => (
        <Planet
          key={planet.key}
          spec={planet}
          texture={textureMap[planet.key]}
          ringTexture={planet.ring ? saturnRingTexture : undefined}
        />
      ))}
    </group>
  );
}

function PlanetarySystemFallback() {
  return null;
}

export function PlanetarySystem() {
  return (
    <Suspense fallback={<PlanetarySystemFallback />}>
      <PlanetarySystemMesh />
    </Suspense>
  );
}
