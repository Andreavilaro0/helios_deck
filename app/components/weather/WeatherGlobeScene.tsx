import { useRef, useMemo, useEffect, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { EARTH_VERT, EARTH_FRAG, ATMOS_VERT, ATMOS_FRAG } from "./earth-shaders";

const LAT = 64.14;
const LON = -21.90;
const INITIAL_Y = -1.6;
// Sun angle: upper-right in world space, lights Europe from a cinematic morning angle
const SUN_DIR = new THREE.Vector3(1.2, 0.5, 0.85).normalize();

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
  const earthGroupRef = useRef<THREE.Group>(null);
  const cloudGroupRef = useRef<THREE.Group>(null);
  const earthMatRef   = useRef<THREE.ShaderMaterial | null>(null);

  const [dayMap, nightMap, specMap, cloudMap, cloudAlpha] = useLoader(
    THREE.TextureLoader,
    [
      "/textures/earth_daymap.jpg",
      "/textures/earth_nightmap.png",
      "/textures/earth_specular.jpg",
      "/textures/04_earthcloudmap.jpg",
      "/textures/05_earthcloudmaptrans.jpg",
    ],
  );

  useEffect(() => {
    dayMap.colorSpace   = THREE.SRGBColorSpace;
    nightMap.colorSpace = THREE.SRGBColorSpace;
  }, [dayMap, nightMap]);

  const earthMat = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        dayMap:   { value: dayMap },
        nightMap: { value: nightMap },
        specMap:  { value: specMap },
        sunDir:   { value: SUN_DIR },
        camPos:   { value: new THREE.Vector3(0, 0, 2.6) },
      },
      vertexShader:   EARTH_VERT,
      fragmentShader: EARTH_FRAG,
    });
    earthMatRef.current = mat;
    return mat;
  }, [dayMap, nightMap, specMap]);

  const atmosMat = useMemo(() => new THREE.ShaderMaterial({
    uniforms:       {},
    vertexShader:   ATMOS_VERT,
    fragmentShader: ATMOS_FRAG,
    transparent:    true,
    side:           THREE.BackSide,
    depthWrite:     false,
  }), []);

  const cloudMat = useMemo(() => new THREE.MeshLambertMaterial({
    map:         cloudMap,
    alphaMap:    cloudAlpha,
    transparent: true,
    depthWrite:  false,
    opacity:     0.88,
  }), [cloudMap, cloudAlpha]);

  const pinPos = useMemo(() => latLonToVec3(LAT, LON, 1.04), []);

  useFrame(({ camera }, dt) => {
    earthMatRef.current?.uniforms.camPos.value.copy(camera.position);
    if (earthGroupRef.current) earthGroupRef.current.rotation.y += dt * 0.05;
    // Clouds rotate slightly faster — realistic drift
    if (cloudGroupRef.current) cloudGroupRef.current.rotation.y += dt * 0.062;
  });

  return (
    <group rotation={[THREE.MathUtils.degToRad(10), 0, 0]}>
      {/* Earth surface — day/night shader */}
      <group ref={earthGroupRef} rotation={[0, INITIAL_Y, 0]}>
        <mesh>
          <sphereGeometry args={[1, 96, 96]} />
          <primitive object={earthMat} attach="material" />
        </mesh>
        {/* Reykjavik pin */}
        <mesh position={pinPos}>
          <sphereGeometry args={[0.020, 12, 12]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        <mesh position={pinPos}>
          <sphereGeometry args={[0.038, 12, 12]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.28} />
        </mesh>
        <mesh position={pinPos}>
          <sphereGeometry args={[0.058, 12, 12]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.10} />
        </mesh>
      </group>

      {/* Cloud layer — independent rotation, lit by directional light */}
      <group ref={cloudGroupRef} rotation={[0, INITIAL_Y, 0]}>
        <mesh>
          <sphereGeometry args={[1.009, 64, 64]} />
          <primitive object={cloudMat} attach="material" />
        </mesh>
      </group>

      {/* Atmosphere halo — BackSide Fresnel glow */}
      <mesh scale={[1.10, 1.10, 1.10]}>
        <sphereGeometry args={[1, 48, 48]} />
        <primitive object={atmosMat} attach="material" />
      </mesh>
    </group>
  );
}

export function WeatherGlobeScene() {
  return (
    <div className="relative w-full h-full">
      <Canvas
        key="weather-globe"
        camera={{ position: [0, 0, 2.6], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        style={{ background: "transparent" }}
      >
        {/* Directional sun light — position matches SUN_DIR in shader */}
        <directionalLight position={[1.2, 0.5, 0.85]} intensity={1.8} color="#fff8e8" />
        <ambientLight intensity={0.04} />
        <Suspense fallback={null}>
          <EarthScene />
        </Suspense>
      </Canvas>

      {/* Location label overlay */}
      <div className="absolute inset-x-0 top-3 pointer-events-none flex flex-col items-center gap-1">
        <span style={{ fontSize: "8px", fontFamily: "monospace", color: "rgba(255,255,255,0.38)",
          letterSpacing: "0.16em", textTransform: "uppercase" }}>
          Location on Earth
        </span>
        <div className="flex items-center gap-1.5">
          <svg width="8" height="10" viewBox="0 0 8 10" fill="#38bdf8">
            <path d="M4 0C2.07 0 .5 1.57.5 3.5 .5 6.13 4 10 4 10s3.5-3.87 3.5-6.5C7.5 1.57 5.93 0 4 0zm0 4.75a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z" />
          </svg>
          <span style={{ fontSize: "13px", fontFamily: "monospace", fontWeight: 600, color: "#e2e8f0" }}>
            Reykjavik, Iceland
          </span>
        </div>
      </div>
    </div>
  );
}
