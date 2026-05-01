import { useRef, useMemo, useEffect, Suspense } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { createEarthDayNightMaterial } from "./EarthDayNightMaterial";

interface Props {
  kp: number;
}

// Sun angle — upper-right-front gives a visible terminator from the camera
const SUN_DIR = new THREE.Vector3(1.2, 0.4, 0.8).normalize();

// Kp drives the Fresnel rim glow color (cyan → amber → red)
function fresnelRimColor(kp: number): THREE.Color {
  if (kp >= 5) return new THREE.Color(0xff2040);
  if (kp >= 4) return new THREE.Color(0xf59e0b);
  return new THREE.Color(0x0088ff);
}

/**
 * Fresnel atmospheric rim glow — adapted from bobbyroe/threejs-earth (MIT).
 * Bright at grazing angles (atmosphere edge), transparent facing camera.
 */
function createFresnelMaterial(rimColor: THREE.Color): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      color1: { value: rimColor },
      color2: { value: new THREE.Color(0x000000) },
      fresnelBias: { value: 0.1 },
      fresnelScale: { value: 1.0 },
      fresnelPower: { value: 4.0 },
    },
    vertexShader: `
      uniform float fresnelBias;
      uniform float fresnelScale;
      uniform float fresnelPower;
      varying float vReflectionFactor;
      void main() {
        vec4 mvPosition    = modelViewMatrix * vec4(position, 1.0);
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vec3 worldNormal   = normalize(mat3(
          modelMatrix[0].xyz,
          modelMatrix[1].xyz,
          modelMatrix[2].xyz
        ) * normal);
        vec3 I = worldPosition.xyz - cameraPosition;
        vReflectionFactor = fresnelBias + fresnelScale *
          pow(1.0 + dot(normalize(I), worldNormal), fresnelPower);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 color1;
      uniform vec3 color2;
      varying float vReflectionFactor;
      void main() {
        float f = clamp(vReflectionFactor, 0.0, 1.0);
        gl_FragColor = vec4(mix(color2, color1, vec3(f)), f);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
  });
}

function EarthMesh({ kp }: Props) {
  const earthGroupRef = useRef<THREE.Group>(null);

  // 4 surface texture layers — useLoader suspends until all are ready
  const [colorMap, normalMap, specularMap, nightMap] =
    useLoader(THREE.TextureLoader, [
      "/textures/earth_daymap.jpg",
      "/textures/earth_normal.jpg",
      "/textures/earth_specular.jpg",
      "/textures/earth_nightmap.png",
    ]);

  useEffect(() => {
    colorMap.colorSpace = THREE.SRGBColorSpace;
    nightMap.colorSpace = THREE.SRGBColorSpace;
    for (const t of [colorMap, normalMap, specularMap, nightMap]) {
      t.minFilter = THREE.LinearMipmapLinearFilter;
      t.magFilter = THREE.LinearFilter;
    }
  }, [colorMap, normalMap, specularMap, nightMap]);

  // Atlas26 GLSL terminator shader for the planet surface
  const dayNightMat = useMemo(
    () => createEarthDayNightMaterial({ dayTexture: colorMap, nightTexture: nightMap }),
    [colorMap, nightMap]
  );

  // bobbyroe Fresnel rim glow — Kp sets the color
  const fresnelMat = useMemo(() => createFresnelMaterial(fresnelRimColor(kp)), [kp]);

  useEffect(() => {
    dayNightMat.uniforms.uSunDirection.value.copy(SUN_DIR);
  }, [dayNightMat]);

  // Dispose GPU resources on unmount
  useEffect(() => {
    return () => {
      dayNightMat.dispose();
      fresnelMat.dispose();
    };
  }, [dayNightMat, fresnelMat]);

  useFrame(() => {
    if (!earthGroupRef.current) return;
    const t = Date.now() / 1000;
    const DAY = 24 * 60 * 60;
    earthGroupRef.current.rotation.y = (t / (DAY * 0.008)) * Math.PI * 2;
  });

  return (
    <group rotation={[THREE.MathUtils.degToRad(23.5), 0, 0]}>
      {/* Surface + ocean specular highlight */}
      <group ref={earthGroupRef}>
        {/* GLSL day/night terminator — city lights on dark side */}
        <mesh name="earth">
          <sphereGeometry args={[1, 128, 128]} />
          <primitive object={dayNightMat} attach="material" />
        </mesh>

        {/* Phong layer for normal-map ocean reflections (10% opacity) */}
        <mesh>
          <sphereGeometry args={[1.001, 64, 64]} />
          <meshPhongMaterial
            map={colorMap}
            normalMap={normalMap}
            specularMap={specularMap}
            specular={new THREE.Color(0x444444)}
            shininess={30}
            transparent
            opacity={0.1}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Fresnel atmospheric rim glow — Kp-tinted */}
      <mesh scale={[1.01, 1.01, 1.01]}>
        <sphereGeometry args={[1, 64, 64]} />
        <primitive object={fresnelMat} attach="material" />
      </mesh>
    </group>
  );
}

function EarthFallback() {
  return (
    <mesh>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial color="#030e20" />
    </mesh>
  );
}

export function EarthInstrument({ kp }: Props) {
  return (
    <Suspense fallback={<EarthFallback />}>
      <EarthMesh kp={kp} />
    </Suspense>
  );
}
