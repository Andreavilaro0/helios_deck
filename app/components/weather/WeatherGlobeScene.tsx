import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

const LAT = 64.14;
const LON = -21.90;

function latLonToVec3(lat: number, lon: number, r: number): THREE.Vector3 {
  const phi   = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta),
  );
}

function EarthScene() {
  const groupRef = useRef<THREE.Group>(null);

  const [nightMap, cloudMap] = useLoader(THREE.TextureLoader, [
    "/textures/earth_nightmap.png",
    "/textures/2k_earth_clouds.jpg",
  ]);

  useMemo(() => {
    nightMap.colorSpace = THREE.SRGBColorSpace;
  }, [nightMap]);

  const cloudMat = useMemo(() => new THREE.MeshBasicMaterial({
    map: cloudMap,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), [cloudMap]);

  const pinPos = useMemo(() => latLonToVec3(LAT, LON, 1.04), []);

  // Atmospheric glow
  const atmosMat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {},
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      void main() {
        float rim = 1.0 - max(dot(vNormal, vec3(0,0,1)), 0.0);
        rim = pow(rim, 3.0);
        gl_FragColor = vec4(0.15, 0.45, 1.0, rim * 0.8);
      }
    `,
    transparent: true,
    side: THREE.FrontSide,
    depthWrite: false,
  }), []);

  useFrame((_, dt) => {
    if (groupRef.current) groupRef.current.rotation.y += dt * 0.05;
  });

  // Iceland at lon=-22° → in latLonToVec3 space: x=0.404r, z=0.164r.
  // To maximise z (face camera): rotate Y by atan2(-x,-z) = atan2(-0.404, -0.164) ≈ -1.185 rad.
  const INITIAL_Y = -1.185;

  return (
    <group rotation={[THREE.MathUtils.degToRad(10), 0, 0]}>
      <group ref={groupRef} rotation={[0, INITIAL_Y, 0]}>
        {/* Tierra con textura nocturna — luces de ciudad */}
        <mesh>
          <sphereGeometry args={[1, 96, 96]} />
          <meshBasicMaterial map={nightMap} />
        </mesh>
        {/* Nubes */}
        <mesh>
          <sphereGeometry args={[1.008, 64, 64]} />
          <primitive object={cloudMat} attach="material" />
        </mesh>
        {/* Pin core — Reykjavik */}
        <mesh position={pinPos}>
          <sphereGeometry args={[0.022, 12, 12]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        {/* Pin glow */}
        <mesh position={pinPos}>
          <sphereGeometry args={[0.040, 12, 12]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.3} />
        </mesh>
        {/* Outer ring */}
        <mesh position={pinPos}>
          <sphereGeometry args={[0.060, 12, 12]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.12} />
        </mesh>
      </group>
      {/* Atmósfera */}
      <mesh scale={[1.08, 1.08, 1.08]}>
        <sphereGeometry args={[1, 64, 64]} />
        <primitive object={atmosMat} attach="material" />
      </mesh>
    </group>
  );
}

export function WeatherGlobeScene() {
  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(10,30,100,0.60) 0%, transparent 70%)",
      }} />
      <Canvas
        key="weather-globe"
        camera={{ position: [0, 0, 2.6], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={1} />
        <Suspense fallback={null}>
          <EarthScene />
        </Suspense>
      </Canvas>
      {/* Labels overlay */}
      <div className="absolute inset-x-0 top-3 pointer-events-none flex flex-col items-center gap-1">
        <span style={{ fontSize: "8px", fontFamily: "monospace", color: "rgba(255,255,255,0.40)",
          letterSpacing: "0.16em", textTransform: "uppercase" }}>
          Location on Earth
        </span>
        <div className="flex items-center gap-1.5">
          <svg width="8" height="10" viewBox="0 0 8 10" fill="#38bdf8">
            <path d="M4 0C2.07 0 .5 1.57.5 3.5 .5 6.13 4 10 4 10s3.5-3.87 3.5-6.5C7.5 1.57 5.93 0 4 0zm0 4.75a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z"/>
          </svg>
          <span style={{ fontSize: "13px", fontFamily: "monospace", fontWeight: 600, color: "#e2e8f0" }}>
            Reykjavik, Iceland
          </span>
        </div>
      </div>
    </div>
  );
}
