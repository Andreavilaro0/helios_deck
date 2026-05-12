import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import type { SignalRecord } from "~/types/signal";
import type { PlanetDescriptor } from "./planet-explorer";
import {
  createEarthDayNightMaterial,
  createFresnelMaterial,
  fresnelRimColor,
} from "./EarthDayNightMaterial";
import { StarField } from "./StarField";

interface Props {
  kp: number;
  signal: SignalRecord;
  planet: PlanetDescriptor;
}

function formatUTCHeader(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
    hour12: false,
  });
}

function GenericPlanet({ planet }: { planet: PlanetDescriptor }) {
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
      groupRef.current.rotation.z = Math.sin(performance.now() * 0.00018) * 0.05;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * planet.rotationSpeed * 0.2;
    }
  });

  return (
    <group ref={groupRef} scale={planet.modelScale} rotation={[0.12, -0.72, 0]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[planet.radius, 128, 128]} />
        <meshStandardMaterial map={texture} roughness={1} metalness={0} />
      </mesh>

      {planet.ring && ringGeometry ? (
        <mesh rotation={[planet.ring.tiltX, 0, 0]}>
          <primitive object={ringGeometry} attach="geometry" />
          <meshBasicMaterial
            map={ringTexture}
            side={THREE.DoubleSide}
            transparent
            opacity={0.92}
            depthWrite={false}
          />
        </mesh>
      ) : null}
    </group>
  );
}

function EarthPlanet({ kp }: { kp: number }) {
  const earthGroupRef = useRef<THREE.Group>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const [dayMap, normalMap, specularMap, nightMap, cloudMap] = useLoader(THREE.TextureLoader, [
    "/textures/earth_daymap.jpg",
    "/textures/earth_normal.jpg",
    "/textures/earth_specular.jpg",
    "/textures/earth_nightmap.png",
    "/textures/2k_earth_clouds.jpg",
  ]);

  useEffect(() => {
    dayMap.colorSpace = THREE.SRGBColorSpace;
    nightMap.colorSpace = THREE.SRGBColorSpace;
    for (const texture of [dayMap, normalMap, specularMap, nightMap, cloudMap]) {
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.anisotropy = 8;
    }
  }, [cloudMap, dayMap, nightMap, normalMap, specularMap]);

  const dayNightMat = useMemo(
    () => createEarthDayNightMaterial({ dayTexture: dayMap, nightTexture: nightMap }),
    [dayMap, nightMap],
  );
  const cloudMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: cloudMap,
        transparent: true,
        opacity: 0.24,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [cloudMap],
  );
  const fresnelMat = useMemo(() => createFresnelMaterial(fresnelRimColor(kp)), [kp]);

  useEffect(() => {
    dayNightMat.uniforms.uKp.value = kp;
  }, [dayNightMat, kp]);

  useEffect(() => {
    return () => {
      dayNightMat.dispose();
      cloudMat.dispose();
      fresnelMat.dispose();
    };
  }, [cloudMat, dayNightMat, fresnelMat]);

  useFrame((_, delta) => {
    if (earthGroupRef.current) earthGroupRef.current.rotation.y += delta * 0.08;
    if (cloudRef.current) cloudRef.current.rotation.y += delta * 0.05;
  });

  return (
    <group scale={1.14} rotation={[THREE.MathUtils.degToRad(23.5), -0.7, 0]}>
      <group ref={earthGroupRef}>
        <mesh>
          <sphereGeometry args={[1, 128, 128]} />
          <primitive object={dayNightMat} attach="material" />
        </mesh>
        <mesh>
          <sphereGeometry args={[1.001, 64, 64]} />
          <meshPhongMaterial
            map={dayMap}
            normalMap={normalMap}
            specularMap={specularMap}
            specular={new THREE.Color(0x446688)}
            shininess={45}
            transparent
            opacity={0.1}
            depthWrite={false}
          />
        </mesh>
      </group>

      <mesh ref={cloudRef}>
        <sphereGeometry args={[1.005, 64, 64]} />
        <primitive object={cloudMat} attach="material" />
      </mesh>

      <mesh scale={[1.012, 1.012, 1.012]}>
        <sphereGeometry args={[1, 64, 64]} />
        <primitive object={fresnelMat} attach="material" />
      </mesh>
    </group>
  );
}

function PlanetModel({ kp, planet }: { kp: number; planet: PlanetDescriptor }) {
  if (planet.id === "earth") return <EarthPlanet kp={kp} />;
  return <GenericPlanet planet={planet} />;
}

function PlanetModelFallback() {
  return (
    <mesh>
      <sphereGeometry args={[1, 48, 48]} />
      <meshBasicMaterial color="#08111f" />
    </mesh>
  );
}

function OverlayAnnotations({ planet }: { planet: PlanetDescriptor }) {
  return (
    <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
      <svg width="100%" height="100%" viewBox="0 0 1000 700" preserveAspectRatio="none">
        <defs>
          <filter id="planet-glow-cyan" x="-150%" y="-150%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="planet-glow-accent" x="-150%" y="-150%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <ellipse cx="500" cy="395" rx="322" ry="72" fill="none" stroke={planet.orbitColor} strokeWidth="1.5" opacity="0.48" />
        <ellipse cx="560" cy="352" rx="248" ry="54" fill="none" stroke="#32c8ff" strokeWidth="1.25" strokeDasharray="7 7" opacity="0.52" transform="rotate(-14 560 352)" />
        <ellipse cx="452" cy="430" rx="286" ry="60" fill="none" stroke="#9d59ff" strokeWidth="1.1" strokeDasharray="8 10" opacity="0.42" transform="rotate(16 452 430)" />

        <circle cx="290" cy="434" r="6" fill="#ff9d3f" filter="url(#planet-glow-accent)" />
        <circle cx="720" cy="292" r="6" fill="#32c8ff" filter="url(#planet-glow-cyan)" />
        <circle cx="862" cy="532" r="6" fill="#9d59ff" filter="url(#planet-glow-accent)" />

        <line x1="292" y1="432" x2="232" y2="336" stroke="#ff9d3f" strokeWidth="1.1" opacity="0.6" />
        <line x1="722" y1="292" x2="806" y2="206" stroke="#32c8ff" strokeWidth="1.1" opacity="0.6" />
        <line x1="860" y1="530" x2="808" y2="472" stroke="#9d59ff" strokeWidth="1.1" opacity="0.55" />

        <text x="220" y="322" fill="#f8fafc" fontSize="12" fontFamily="monospace" letterSpacing="2">SOLAR WIND</text>
        <text x="222" y="340" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">Heliospheric stream</text>

        <text x="812" y="196" fill="#f8fafc" fontSize="12" fontFamily="monospace" letterSpacing="2">MAGNETOSPHERE</text>
        <text x="814" y="214" fill="#7dd3fc" fontSize="11" fontFamily="sans-serif">{planet.details.magnetosphere}</text>

        <text x="820" y="466" fill="#f8fafc" fontSize="12" fontFamily="monospace" letterSpacing="2">RADIATION LEVEL</text>
        <text x="822" y="484" fill="#d8b4fe" fontSize="11" fontFamily="sans-serif">{planet.details.radiation}</text>
      </svg>
    </div>
  );
}

export function CenterStage({ kp, signal, planet }: Props) {
  return (
    <div className="h-full relative overflow-hidden rounded-[28px]">
      <div className="absolute inset-x-0 top-8 z-10 text-center pointer-events-none">
        <div className="text-[30px] font-semibold tracking-[0.28em] text-white uppercase">{planet.name}</div>
        <div className="mt-1 text-[16px] font-medium" style={{ color: planet.accentColor }}>
          {planet.subtitle}
        </div>
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${planet.glowColor}2d 0%, rgba(7,14,26,0.12) 32%, rgba(2,6,16,0.0) 68%)`,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 22% 48%, rgba(255,130,58,0.18) 0%, rgba(255,130,58,0.07) 22%, transparent 44%)",
        }}
      />

      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0.12, 4.6], fov: 30 }}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.65} />
          <directionalLight position={[-5, 2.4, 4]} intensity={2.6} color="#fff1d6" />
          <directionalLight position={[4, -1, 2]} intensity={0.45} color="#5ab3ff" />
          <pointLight position={[0, 0, -5]} intensity={0.3} color="#2548a9" />
          <StarField />
          <Suspense fallback={<PlanetModelFallback />}>
            <PlanetModel kp={kp} planet={planet} />
          </Suspense>
        </Canvas>

        <OverlayAnnotations planet={planet} />
      </div>

      <div className="absolute top-10 right-10 rounded-2xl border border-white/10 bg-black/25 px-4 py-2 backdrop-blur-xl">
        <div className="text-[11px] font-mono tracking-[0.26em] text-white/45 uppercase">UTC</div>
        <div className="text-[17px] font-mono tabular-nums text-white">{formatUTCHeader(signal.timestamp)} UTC</div>
      </div>
    </div>
  );
}
