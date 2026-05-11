import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { StarField } from "~/components/cosmic/StarField";

// Reykjavik: lat=64.14°, lon=-21.90°
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

function EarthWithPin() {
  const groupRef = useRef<THREE.Group>(null);
  const pinRef   = useRef<THREE.Mesh>(null);

  const [nightMap, cloudMap] = useLoader(THREE.TextureLoader, [
    "/textures/earth_nightmap.png",
    "/textures/2k_earth_clouds.jpg",
  ]);

  useEffect(() => {
    nightMap.colorSpace = THREE.SRGBColorSpace;
    nightMap.minFilter  = THREE.LinearMipmapLinearFilter;
    cloudMap.minFilter  = THREE.LinearMipmapLinearFilter;
  }, [nightMap, cloudMap]);

  const pinPos = useMemo(() => latLonToVec3(LAT, LON, 1.04), []);

  const cloudMat = useMemo(() => new THREE.MeshBasicMaterial({
    map: cloudMap,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), [cloudMap]);

  const fresnelMat = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
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
          rim = pow(rim, 2.8);
          gl_FragColor = vec4(0.24, 0.52, 1.0, rim * 0.72);
        }
      `,
      transparent: true,
      side: THREE.FrontSide,
      depthWrite: false,
    });
    return mat;
  }, []);

  useEffect(() => () => { cloudMat.dispose(); fresnelMat.dispose(); }, [cloudMat, fresnelMat]);

  useFrame((_, dt) => {
    if (groupRef.current) groupRef.current.rotation.y += dt * 0.04;
  });

  return (
    <group rotation={[THREE.MathUtils.degToRad(23.5), 0, 0]}>
      <group ref={groupRef}>
        {/* Earth night texture */}
        <mesh>
          <sphereGeometry args={[1, 96, 96]} />
          <meshBasicMaterial map={nightMap} />
        </mesh>
        {/* Clouds */}
        <mesh>
          <sphereGeometry args={[1.005, 64, 64]} />
          <primitive object={cloudMat} attach="material" />
        </mesh>
        {/* Location pin dot */}
        <mesh ref={pinRef} position={pinPos}>
          <sphereGeometry args={[0.022, 12, 12]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        {/* Pin glow halo */}
        <mesh position={pinPos}>
          <sphereGeometry args={[0.038, 12, 12]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.3} />
        </mesh>
        {/* Outer pulse ring */}
        <mesh position={pinPos}>
          <sphereGeometry args={[0.050, 12, 12]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.10} />
        </mesh>
      </group>
      {/* Atmosphere fresnel */}
      <mesh scale={[1.06, 1.06, 1.06]}>
        <sphereGeometry args={[1, 64, 64]} />
        <primitive object={fresnelMat} attach="material" />
      </mesh>
    </group>
  );
}

export function WeatherGlobeScene() {
  return (
    <div className="relative w-full h-full">
      {/* Radial halo behind globe */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 70% 70% at 50% 50%, rgba(20,50,140,0.55) 0%, transparent 70%)",
      }} />
      <Canvas
        key="weather-globe"
        camera={{ position: [0, 0, 2.8], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.12} />
        <directionalLight position={[-4, 2, 4]} intensity={1.2} color="#fff5e0" />
        <StarField />
        <EarthWithPin />
      </Canvas>
      {/* Location label overlay */}
      <div className="absolute inset-x-0 top-3 pointer-events-none flex flex-col items-center gap-1">
        <span style={{ fontSize: "8px", fontFamily: "monospace", color: "rgba(255,255,255,0.35)",
          letterSpacing: "0.16em", textTransform: "uppercase" }}>
          Location on Earth
        </span>
        <div className="flex items-center gap-1.5">
          <svg width="8" height="10" viewBox="0 0 8 10" fill="#38bdf8">
            <path d="M4 0C2.07 0 .5 1.57.5 3.5 .5 6.13 4 10 4 10s3.5-3.87 3.5-6.5C7.5 1.57 5.93 0 4 0zm0 4.75a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z"/>
          </svg>
          <span style={{ fontSize: "12px", fontFamily: "monospace", fontWeight: 600, color: "#e2e8f0" }}>
            Reykjavik, Iceland
          </span>
        </div>
      </div>
    </div>
  );
}
