import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import type { PlanetDescriptor } from "./planet-explorer";
import { StarField } from "./StarField";

interface Props {
  planet: PlanetDescriptor;
  solarWindLabel: string;
  onPrevious: () => void;
  onNext: () => void;
}

function PlanetModel({ planet }: { planet: PlanetDescriptor }) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, planet.texturePath);
  const ringTexture = useLoader(
    THREE.TextureLoader,
    planet.ring?.texturePath ?? "/textures/atlas26/saturn_ring.png",
  );

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = 8;

    ringTexture.colorSpace = THREE.SRGBColorSpace;
    ringTexture.minFilter = THREE.LinearMipmapLinearFilter;
    ringTexture.magFilter = THREE.LinearFilter;
    ringTexture.anisotropy = 8;
  }, [ringTexture, texture]);

  const ringGeometry = useMemo(() => {
    if (!planet.ring) return null;
    const geometry = new THREE.RingGeometry(planet.ring.innerRadius, planet.ring.outerRadius, 180);
    const positions = geometry.attributes.position;
    const uv = geometry.attributes.uv;

    for (let i = 0; i < positions.count; i += 1) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const distance = Math.sqrt(x * x + y * y);
      const u = (distance - planet.ring.innerRadius) / (planet.ring.outerRadius - planet.ring.innerRadius);
      uv.setXY(i, u, 0.5);
    }

    return geometry;
  }, [planet]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(performance.now() * 0.00016) * 0.04;
      groupRef.current.position.y = Math.sin(performance.now() * 0.0007) * 0.05;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * planet.rotationSpeed * 0.18;
    }
  });

  return (
    <group ref={groupRef} scale={planet.modelScale * 1.14} rotation={[0.12, -0.8, 0]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[planet.radius, 128, 128]} />
        <meshStandardMaterial map={texture} roughness={0.95} metalness={0.02} />
      </mesh>

      <mesh scale={[1.03, 1.03, 1.03]}>
        <sphereGeometry args={[planet.radius, 64, 64]} />
        <meshBasicMaterial color={planet.glowColor} transparent opacity={0.08} />
      </mesh>

      {planet.ring && ringGeometry ? (
        <mesh rotation={[planet.ring.tiltX, 0, 0]}>
          <primitive object={ringGeometry} attach="geometry" />
          <meshBasicMaterial map={ringTexture} side={THREE.DoubleSide} transparent opacity={0.9} depthWrite={false} />
        </mesh>
      ) : null}
    </group>
  );
}

function SceneAnnotations({ planet, solarWindLabel }: { planet: PlanetDescriptor; solarWindLabel: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 select-none" aria-hidden="true">
      <svg width="100%" height="100%" viewBox="0 0 1000 700" preserveAspectRatio="none">
        <defs>
          <filter id="planet-callout-glow" x="-150%" y="-150%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <ellipse cx="514" cy="398" rx="282" ry="72" fill="none" stroke={planet.orbitColor} strokeWidth="1.25" opacity="0.52" />
        <ellipse cx="648" cy="346" rx="186" ry="52" fill="none" stroke="#37d2ff" strokeWidth="1.35" strokeDasharray="9 10" opacity="0.65" transform="rotate(-13 648 346)" />
        <ellipse cx="406" cy="458" rx="212" ry="54" fill="none" stroke="#ff8a45" strokeWidth="1.2" strokeDasharray="7 10" opacity="0.45" transform="rotate(-12 406 458)" />
        <ellipse cx="756" cy="510" rx="104" ry="30" fill="none" stroke="#a36cff" strokeWidth="1.1" opacity="0.48" transform="rotate(-28 756 510)" />

        <circle cx="258" cy="458" r="5.5" fill="#ffb15a" filter="url(#planet-callout-glow)" />
        <circle cx="775" cy="303" r="5.5" fill="#37d2ff" filter="url(#planet-callout-glow)" />
        <circle cx="876" cy="575" r="5.5" fill="#ad79ff" filter="url(#planet-callout-glow)" />

        <line x1="258" y1="458" x2="190" y2="340" stroke="#ff8a45" strokeWidth="1.1" opacity="0.6" />
        <line x1="775" y1="303" x2="810" y2="214" stroke="#37d2ff" strokeWidth="1.1" opacity="0.68" />
        <line x1="876" y1="575" x2="816" y2="520" stroke="#b07eff" strokeWidth="1.1" opacity="0.6" />

        <text x="162" y="324" fill="#f8fafc" fontSize="12" fontFamily="monospace" letterSpacing="2">SOLAR WIND</text>
        <text x="162" y="345" fill="#cbd5e1" fontSize="12">{solarWindLabel}</text>

        <text x="812" y="200" fill="#f8fafc" fontSize="12" fontFamily="monospace" letterSpacing="2">MAGNETOSPHERE</text>
        <text x="812" y="221" fill="#67d2ff" fontSize="12">{planet.details.magnetosphere}</text>

        <text x="820" y="505" fill="#f8fafc" fontSize="12" fontFamily="monospace" letterSpacing="2">RADIATION LEVEL</text>
        <text x="820" y="526" fill="#d8b4fe" fontSize="12">{planet.details.radiation}</text>
      </svg>
    </div>
  );
}

export function PlanetScene({ planet, solarWindLabel, onPrevious, onNext }: Props) {
  return (
    <div className="relative h-full overflow-hidden rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,rgba(4,11,24,0.58)_0%,rgba(2,6,16,0.44)_100%)] shadow-[inset_0_0_80px_rgba(0,0,0,0.32)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_52%_48%,rgba(255,138,69,0.24)_0%,rgba(255,138,69,0.08)_20%,transparent_48%),radial-gradient(circle_at_74%_36%,rgba(41,160,255,0.18)_0%,transparent_24%),radial-gradient(circle_at_18%_82%,rgba(170,83,255,0.09)_0%,transparent_30%)]" />

      <div className="pointer-events-none absolute inset-x-0 top-10 z-10 text-center">
        <div className="text-[30px] font-semibold uppercase tracking-[0.3em] text-white md:text-[34px]">{planet.name}</div>
        <div className="mt-1 text-[16px] font-medium" style={{ color: planet.accentColor }}>
          Selected Planet
        </div>
      </div>

      <button
        type="button"
        aria-label="Previous planet"
        onClick={onPrevious}
        className="absolute left-4 top-1/2 z-20 grid h-14 w-14 -translate-y-1/2 place-items-center rounded-full border border-[#6aa6ff80] bg-[rgba(9,20,44,0.92)] text-[#a9d0ff] shadow-[0_0_22px_rgba(93,146,255,0.24)] transition hover:scale-[1.03] md:left-6"
      >
        <ChevronLeft size={22} />
      </button>

      <button
        type="button"
        aria-label="Next planet"
        onClick={onNext}
        className="absolute right-4 top-1/2 z-20 grid h-14 w-14 -translate-y-1/2 place-items-center rounded-full border border-[#6aa6ff80] bg-[rgba(9,20,44,0.92)] text-[#a9d0ff] shadow-[0_0_22px_rgba(93,146,255,0.24)] transition hover:scale-[1.03] md:right-6"
      >
        <ChevronRight size={22} />
      </button>

      <motion.div
        animate={{ y: [0, -8, 0], scale: [1, 1.008, 1] }}
        transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0"
      >
        <Canvas camera={{ position: [0, 0.14, 4.55], fov: 30 }} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} gl={{ antialias: true, alpha: true }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[-5.6, 3.2, 4.6]} intensity={2.8} color="#fff0d0" />
          <directionalLight position={[4.2, -1.2, 2.4]} intensity={0.55} color="#5ab3ff" />
          <pointLight position={[0, 0, 2.8]} intensity={0.6} color={planet.glowColor} />
          <Suspense fallback={null}>
            <PlanetModel planet={planet} />
            <StarField />
          </Suspense>
        </Canvas>
      </motion.div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_50%,rgba(1,4,12,0.3)_100%)]" />
      <SceneAnnotations planet={planet} solarWindLabel={solarWindLabel} />
    </div>
  );
}
