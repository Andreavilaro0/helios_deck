import { useEffect, useMemo, useRef, Suspense } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import {
  createEarthDayNightMaterial,
  createFresnelMaterial,
  fresnelRimColor,
} from "./EarthDayNightMaterial";

interface Props {
  kp: number;
}

function EarthMesh({ kp }: Props) {
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
    dayMap.colorSpace  = THREE.SRGBColorSpace;
    nightMap.colorSpace = THREE.SRGBColorSpace;
    for (const t of [dayMap, normalMap, specularMap, nightMap, cloudMap]) {
      t.minFilter = THREE.LinearMipmapLinearFilter;
      t.magFilter = THREE.LinearFilter;
    }
  }, [dayMap, normalMap, specularMap, nightMap, cloudMap]);

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
  }, [dayNightMat, cloudMat, fresnelMat]);

  useFrame((_, delta) => {
    if (earthGroupRef.current) {
      earthGroupRef.current.rotation.y += delta * 0.05;
    }
    if (cloudRef.current) {
      cloudRef.current.rotation.y += delta * 0.042;
    }
  });

  return (
    <group rotation={[THREE.MathUtils.degToRad(23.5), 0, 0]}>
      <group ref={earthGroupRef}>
        <mesh name="earth">
          <sphereGeometry args={[1, 128, 128]} />
          <primitive object={dayNightMat} attach="material" />
        </mesh>

        {/* Phong layer: normal-map ocean specular — blue-tinted for realism */}
        <mesh>
          <sphereGeometry args={[1.001, 64, 64]} />
          <meshPhongMaterial
            map={dayMap}
            normalMap={normalMap}
            specularMap={specularMap}
            specular={new THREE.Color(0x446688)}
            shininess={45}
            transparent
            opacity={0.09}
            depthWrite={false}
          />
        </mesh>
      </group>

      <mesh ref={cloudRef}>
        <sphereGeometry args={[1.005, 64, 64]} />
        <primitive object={cloudMat} attach="material" />
      </mesh>

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
