import { useRef, useMemo, useEffect, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { EARTH_VERT, EARTH_FRAG, ATMOS_VERT, ATMOS_FRAG } from "./earth-shaders";

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

// Compute globe Y-rotation so that the given longitude faces the camera (at +Z)
function targetRotY(lon: number): number {
  return Math.PI / 2 - (lon + 180) * (Math.PI / 180);
}

// Find shortest rotation from current to a target angle
function shortestPath(current: number, target: number): number {
  const c = ((current % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const t = ((target  % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  let diff = t - c;
  if (diff >  Math.PI) diff -= 2 * Math.PI;
  if (diff < -Math.PI) diff += 2 * Math.PI;
  return current + diff;
}

interface EarthSceneProps { lat: number; lon: number }

function EarthScene({ lat, lon }: EarthSceneProps) {
  const earthGroupRef = useRef<THREE.Group>(null);
  const cloudGroupRef = useRef<THREE.Group>(null);
  const earthMatRef   = useRef<THREE.ShaderMaterial | null>(null);

  // Y-rotation tracking (fully controlled via refs, not JSX state)
  const rotYRef             = useRef(targetRotY(lon));
  const transitionTargetRef = useRef(rotYRef.current);
  const isTransitioningRef  = useRef(false);

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

  // Animate globe to new location when lat/lon change
  useEffect(() => {
    const raw = targetRotY(lon);
    transitionTargetRef.current = shortestPath(rotYRef.current, raw);
    isTransitioningRef.current = true;
  }, [lat, lon]);

  const pinPos = useMemo(() => latLonToVec3(lat, lon, 1.04), [lat, lon]);

  useFrame(({ camera }, dt) => {
    earthMatRef.current?.uniforms.camPos.value.copy(camera.position);

    if (isTransitioningRef.current) {
      const remaining = transitionTargetRef.current - rotYRef.current;
      if (Math.abs(remaining) < 0.008) {
        rotYRef.current = transitionTargetRef.current;
        isTransitioningRef.current = false;
      } else {
        // Ease-out: fast start, slow finish
        rotYRef.current += remaining * Math.min(dt * 4, 0.12);
      }
    } else {
      rotYRef.current += dt * 0.05;
    }

    if (earthGroupRef.current) earthGroupRef.current.rotation.y = rotYRef.current;
    if (cloudGroupRef.current) cloudGroupRef.current.rotation.y = rotYRef.current + 0.08;
  });

  return (
    <group rotation={[THREE.MathUtils.degToRad(10), 0, 0]}>
      {/* Earth surface */}
      <group ref={earthGroupRef}>
        <mesh>
          <sphereGeometry args={[1, 96, 96]} />
          <primitive object={earthMat} attach="material" />
        </mesh>
        {/* Location pin */}
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

      {/* Cloud layer */}
      <group ref={cloudGroupRef}>
        <mesh>
          <sphereGeometry args={[1.009, 64, 64]} />
          <primitive object={cloudMat} attach="material" />
        </mesh>
      </group>

      {/* Atmosphere halo */}
      <mesh scale={[1.10, 1.10, 1.10]}>
        <sphereGeometry args={[1, 48, 48]} />
        <primitive object={atmosMat} attach="material" />
      </mesh>
    </group>
  );
}

interface Props {
  lat: number;
  lon: number;
  locationLabel: string;
}

export function WeatherGlobeScene({ lat, lon, locationLabel }: Props) {
  return (
    <div className="relative w-full h-full">
      <Canvas
        key="weather-globe"
        camera={{ position: [0, 0, 2.6], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        style={{ background: "transparent" }}
      >
        <directionalLight position={[1.2, 0.5, 0.85]} intensity={1.8} color="#fff8e8" />
        <ambientLight intensity={0.04} />
        <Suspense fallback={null}>
          <EarthScene lat={lat} lon={lon} />
        </Suspense>
      </Canvas>

      {/* Location label overlay */}
      <div className="absolute inset-x-0 top-3 pointer-events-none flex flex-col items-center gap-1">
        <span style={{
          fontSize: "8px", fontFamily: "monospace", color: "rgba(147,197,253,0.55)",
          letterSpacing: "0.20em", textTransform: "uppercase",
          textShadow: "0 0 10px rgba(59,130,246,0.40)",
        }}>
          Location on Earth
        </span>
        <div className="flex items-center gap-1.5" style={{
          background: "rgba(2,6,30,0.72)",
          border: "1px solid rgba(59,130,246,0.45)",
          borderRadius: "99px",
          padding: "4px 12px 4px 8px",
          backdropFilter: "blur(12px)",
          boxShadow: "0 0 20px rgba(59,130,246,0.18)",
        }}>
          <svg width="8" height="10" viewBox="0 0 8 10" fill="#38bdf8" style={{ filter: "drop-shadow(0 0 4px rgba(56,189,248,0.70))" }}>
            <path d="M4 0C2.07 0 .5 1.57.5 3.5 .5 6.13 4 10 4 10s3.5-3.87 3.5-6.5C7.5 1.57 5.93 0 4 0zm0 4.75a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z" />
          </svg>
          <span style={{ fontSize: "13px", fontFamily: "monospace", fontWeight: 700, color: "#e2e8f0",
            textShadow: "0 0 20px rgba(56,189,248,0.30)" }}>
            {locationLabel}
          </span>
        </div>
      </div>

      {/* HUD — corner brackets + center crosshair */}
      <svg className="absolute inset-0 pointer-events-none w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Corner brackets */}
        <path d="M 5 16 L 5 5 L 16 5"  fill="none" stroke="rgba(59,130,246,0.60)" strokeWidth="1.2" />
        <path d="M 84 5 L 95 5 L 95 16" fill="none" stroke="rgba(59,130,246,0.60)" strokeWidth="1.2" />
        <path d="M 5 84 L 5 95 L 16 95" fill="none" stroke="rgba(59,130,246,0.60)" strokeWidth="1.2" />
        <path d="M 95 84 L 95 95 L 84 95" fill="none" stroke="rgba(59,130,246,0.60)" strokeWidth="1.2" />
        {/* Center crosshair */}
        <circle cx="50" cy="50" r="1.5" fill="none" stroke="rgba(59,130,246,0.28)" strokeWidth="0.5" />
        <line x1="45.5" y1="50" x2="48" y2="50" stroke="rgba(59,130,246,0.22)" strokeWidth="0.5" />
        <line x1="52"   y1="50" x2="54.5" y2="50" stroke="rgba(59,130,246,0.22)" strokeWidth="0.5" />
        <line x1="50" y1="45.5" x2="50" y2="48"   stroke="rgba(59,130,246,0.22)" strokeWidth="0.5" />
        <line x1="50" y1="52"   x2="50" y2="54.5"  stroke="rgba(59,130,246,0.22)" strokeWidth="0.5" />
      </svg>

      {/* Coordinates readout — bottom right */}
      <div className="absolute bottom-3 right-4 pointer-events-none">
        <span style={{ fontSize: "8px", fontFamily: "monospace", color: "rgba(59,130,246,0.48)", letterSpacing: "0.12em" }}>
          {lat >= 0 ? `${lat.toFixed(2)}°N` : `${Math.abs(lat).toFixed(2)}°S`}{" · "}
          {lon >= 0 ? `${lon.toFixed(2)}°E` : `${Math.abs(lon).toFixed(2)}°W`}
        </span>
      </div>
    </div>
  );
}
