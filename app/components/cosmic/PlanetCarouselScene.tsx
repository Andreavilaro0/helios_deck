"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Suspense } from "react";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { CarouselArrow } from "./CarouselArrow";
import { PlanetDots } from "./PlanetDots";
import { type Planet, defaultPlanetId, planets as defaultPlanets } from "./planets";
import { PlanetSphere } from "./PlanetSphere";
import type { PlanetId } from "./planet-explorer";
import { PlanetarySystem } from "./PlanetarySystem";
import { StarField } from "./StarField";

const swipeThreshold = 42;

function wrapIndex(index: number, length: number) {
  return (index + length) % length;
}

function getNeighborIndices(activeIndex: number, length: number) {
  return {
    prev: wrapIndex(activeIndex - 1, length),
    next: wrapIndex(activeIndex + 1, length),
  };
}

interface CarouselPlanetProps {
  planet: Planet;
  position: "left" | "center" | "right";
  direction: number;
  onCenterInteractionChange?: (interactive: boolean) => void;
}

function configureTexture(texture: THREE.Texture) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 8;
}

function CenterPlanetMesh({ planet }: { planet: Planet }) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, planet.texturePath);
  const ringTexture = useLoader(
    THREE.TextureLoader,
    planet.ring?.texturePath ?? "/textures/atlas26/saturn_ring.png",
  );

  useEffect(() => {
    configureTexture(texture);
    configureTexture(ringTexture);
  }, [ringTexture, texture]);

  const ringGeometry = useMemo(() => {
    if (!planet.ring) return null;
    const geometry = new THREE.RingGeometry(
      planet.ring.innerRadius,
      planet.ring.outerRadius,
      180,
    );
    const positions = geometry.attributes.position;
    const uv = geometry.attributes.uv;

    for (let i = 0; i < positions.count; i += 1) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const distance = Math.sqrt(x * x + y * y);
      const u =
        (distance - planet.ring.innerRadius) /
        (planet.ring.outerRadius - planet.ring.innerRadius);
      uv.setXY(i, u, 0.5);
    }

    return geometry;
  }, [planet]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.26) * 0.035;
      groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.05;
    }

    if (meshRef.current) {
      meshRef.current.rotation.y += delta * planet.rotationSpeed * 0.28;
    }
  });

  return (
    <group ref={groupRef} scale={planet.modelScale} rotation={[0.12, -0.8, 0]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[planet.radius, 128, 128]} />
        <meshStandardMaterial map={texture} roughness={0.95} metalness={0.02} />
      </mesh>

      {planet.ring && ringGeometry ? (
        <mesh rotation={[planet.ring.tiltX, 0, 0]}>
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
  );
}

function CenterPlanet3D({
  planet,
  size,
  onInteractionChange,
}: {
  planet: Planet;
  size: number;
  onInteractionChange?: (interactive: boolean) => void;
}) {
  return (
    <div
      className="relative cursor-grab active:cursor-grabbing"
      onPointerEnter={() => onInteractionChange?.(true)}
      onPointerLeave={() => onInteractionChange?.(false)}
      onPointerDown={() => onInteractionChange?.(true)}
      onPointerUp={() => onInteractionChange?.(false)}
      onPointerCancel={() => onInteractionChange?.(false)}
      style={{
        width: size,
        height: size,
      }}
    >
      <Canvas
        camera={{ position: [0, 0.14, 4.55], fov: 30 }}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[-5.6, 3.2, 4.6]}
          intensity={2.8}
          color="#fff0d0"
        />
        <directionalLight
          position={[4.2, -1.2, 2.4]}
          intensity={0.55}
          color="#5ab3ff"
        />
        <Suspense fallback={null}>
          <CenterPlanetMesh planet={planet} />
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            autoRotate={false}
            rotateSpeed={0.52}
            dampingFactor={0.08}
            enableDamping
            minPolarAngle={Math.PI * 0.36}
            maxPolarAngle={Math.PI * 0.64}
            minAzimuthAngle={-0.9}
            maxAzimuthAngle={0.9}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

function BackgroundSpaceSystem() {
  return (
    <div className="pointer-events-none absolute inset-0 opacity-60">
      <Canvas
        camera={{ position: [0, 0.08, 8.2], fov: 35 }}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.42} />
        <directionalLight position={[-6, 3.2, 4.8]} intensity={1.25} color="#dbeafe" />
        <pointLight position={[0, 0, 2.2]} intensity={0.42} color="#ffb15a" />
        <Suspense fallback={null}>
          <group position={[0, -0.02, -0.58]} scale={1.14}>
            <PlanetarySystem />
          </group>
          <StarField />
        </Suspense>
      </Canvas>
    </div>
  );
}

function CarouselPlanet({
  planet,
  position,
  direction,
  onCenterInteractionChange,
}: CarouselPlanetProps) {
  const isCenter = position === "center";
  const xOffset =
    position === "left"
      ? "calc(-31vw + 100px)"
      : position === "right"
        ? "calc(31vw - 100px)"
        : "0px";
  const size = isCenter ? 304 : 192;
  const rotateY = position === "left" ? 22 : position === "right" ? -22 : 0;

  return (
    <motion.div
      key={`${planet.id}-${position}`}
      className="absolute left-1/2 top-1/2 [transform-style:preserve-3d]"
      initial={{
        x: position === "center" ? direction * 160 : position === "left" ? -540 : 540,
        y: isCenter ? "-52%" : "-50%",
        opacity: position === "center" ? 0.52 : 0,
        scale: position === "center" ? 0.84 : 0.64,
        filter: position === "center" ? "blur(4px)" : "blur(8px)",
        rotateY,
      }}
      animate={{
        x: xOffset,
        y: isCenter ? "-52%" : "-50%",
        opacity: isCenter ? 1 : 0.42,
        scale: isCenter ? 1 : 0.64,
        filter: isCenter ? "blur(0px)" : "blur(1.8px)",
        rotateY,
      }}
      exit={{
        x: position === "center" ? (direction < 0 ? 180 : -180) : position === "left" ? -580 : 580,
        y: isCenter ? "-52%" : "-50%",
        opacity: 0,
        scale: 0.58,
        filter: "blur(8px)",
        rotateY,
      }}
      transition={{
        type: "spring",
        stiffness: 160,
        damping: 24,
        mass: 1.05,
      }}
      style={{ translateX: "-50%" }}
    >
      {isCenter ? (
        <CenterPlanet3D
          planet={planet}
          size={size}
          onInteractionChange={onCenterInteractionChange}
        />
      ) : (
        <PlanetSphere
          textureUrl={planet.texturePath}
          glowColor={planet.glowColor}
          atmosphereColor={
            planet.id === "mars"
              ? "rgba(255,142,82,0.28)"
              : planet.id === "earth"
                ? "rgba(110,199,255,0.24)"
                : planet.id === "saturn"
                  ? "rgba(223,202,165,0.2)"
                  : "rgba(255,255,255,0.14)"
          }
          size={size}
          variant="side"
          position={position}
        />
      )}
    </motion.div>
  );
}

interface PlanetCarouselSceneProps {
  planets?: Planet[];
  activePlanetId?: string;
  onSelectPlanet?: (planetId: string) => void;
  labelLeft?: string;
  valueLeft?: string;
  labelRightTop?: string;
  valueRightTop?: string;
  labelRightBottom?: string;
  valueRightBottom?: string;
}

export function PlanetCarouselScene({
  planets = defaultPlanets,
  activePlanetId = defaultPlanetId,
  onSelectPlanet,
  labelLeft = "Solar Wind",
  valueLeft = "398 km/s",
  labelRightTop = "Magnetosphere",
  valueRightTop = "Weak / Localized",
  labelRightBottom = "Radiation Level",
  valueRightBottom = "Low",
}: PlanetCarouselSceneProps) {
  const initialIndex = planets.findIndex((planet) => planet.id === activePlanetId);
  const [activeIndex, setActiveIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const [direction, setDirection] = useState(1);
  const [planetInteractive, setPlanetInteractive] = useState(false);

  useEffect(() => {
    const nextIndex = planets.findIndex((planet) => planet.id === activePlanetId);
    if (nextIndex >= 0 && nextIndex !== activeIndex) {
      setDirection(nextIndex > activeIndex ? 1 : -1);
      setActiveIndex(nextIndex);
    }
  }, [activeIndex, activePlanetId, planets]);

  const { prev, next } = useMemo(
    () => getNeighborIndices(activeIndex, planets.length),
    [activeIndex],
  );

  const activePlanet = planets[activeIndex];
  const previousPlanet = planets[prev];
  const nextPlanet = planets[next];

  function goTo(index: number, dir?: number) {
    const normalized = wrapIndex(index, planets.length);
    setDirection(dir ?? (normalized > activeIndex ? 1 : -1));
    setActiveIndex(normalized);
    onSelectPlanet?.(planets[normalized].id as PlanetId);
  }

  function goPrevious() {
    goTo(activeIndex - 1, -1);
  }

  function goNext() {
    goTo(activeIndex + 1, 1);
  }

  return (
    <section className="relative h-[620px] w-full overflow-hidden rounded-[36px] border border-white/6 bg-[linear-gradient(180deg,rgba(3,10,22,0.56)_0%,rgba(2,6,16,0.24)_100%)] px-4 py-6 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)] md:h-[680px] xl:h-[720px]">
      <BackgroundSpaceSystem />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(53,124,255,0.1)_0%,transparent_26%),radial-gradient(circle_at_84%_26%,rgba(34,211,238,0.08)_0%,transparent_24%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(rgba(152,179,255,0.7)_0.65px,transparent_0.65px)] [background-size:30px_30px] [mask-image:radial-gradient(circle_at_center,black,transparent_84%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(rgba(255,255,255,0.9)_0.8px,transparent_0.8px)] [background-size:54px_54px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />
      <div className="pointer-events-none absolute inset-x-[18%] top-[10%] h-[22%] rounded-full bg-[radial-gradient(circle,rgba(85,148,255,0.08)_0%,transparent_74%)] blur-3xl" />
      <div className="pointer-events-none absolute inset-x-[8%] top-[24%] h-[44%] rounded-full border border-orange-300/7 opacity-18 [mask-image:linear-gradient(90deg,transparent,black_18%,black_82%,transparent)]" />
      <div className="pointer-events-none absolute left-[15%] top-[55%] h-px w-[25%] -rotate-[31deg] bg-gradient-to-r from-orange-300/0 via-orange-300/24 to-orange-300/0" />
      <div className="pointer-events-none absolute right-[18%] top-[36%] h-px w-[18%] -rotate-[63deg] bg-gradient-to-r from-cyan-300/0 via-cyan-300/50 to-cyan-300/0" />
      <div className="pointer-events-none absolute right-[14%] top-[69%] h-px w-[11%] -rotate-[40deg] bg-gradient-to-r from-violet-300/0 via-violet-300/50 to-violet-300/0" />
      <div className="pointer-events-none absolute left-[20%] top-[60%] h-2.5 w-2.5 rounded-full bg-orange-300 shadow-[0_0_18px_rgba(253,186,116,0.9)]" />
      <div className="pointer-events-none absolute right-[18%] top-[38%] h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.9)]" />
      <div className="pointer-events-none absolute right-[12%] top-[70%] h-2.5 w-2.5 rounded-full bg-violet-300 shadow-[0_0_18px_rgba(196,181,253,0.9)]" />

      <div className="relative z-10 flex h-full flex-col">
        <motion.div
          key={activePlanet.id}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: "easeOut" }}
          className="pt-1 text-center"
        >
          <div className="text-[30px] font-semibold uppercase tracking-[0.34em] text-white md:text-[34px]">
            {activePlanet.name}
          </div>
          <div className="mt-1 text-[13px] font-medium text-orange-300/88">
            Selected Planet
          </div>
        </motion.div>

        <div className="relative flex-1 [perspective:1800px]">
          <motion.div
            drag={planetInteractive ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.16}
            onDragEnd={(_, info) => {
              if (info.offset.x <= -swipeThreshold) goNext();
              if (info.offset.x >= swipeThreshold) goPrevious();
            }}
            className="absolute inset-0 [transform-style:preserve-3d]"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <CarouselPlanet
                key={`${previousPlanet.id}-left-${activePlanet.id}`}
                planet={previousPlanet}
                position="left"
                direction={direction}
              />
              <CarouselPlanet
                key={`${activePlanet.id}-center`}
                planet={activePlanet}
                position="center"
                direction={direction}
                onCenterInteractionChange={setPlanetInteractive}
              />
              <CarouselPlanet
                key={`${nextPlanet.id}-right-${activePlanet.id}`}
                planet={nextPlanet}
                position="right"
                direction={direction}
              />
            </AnimatePresence>
          </motion.div>

          <div className="pointer-events-none absolute left-[12%] top-[55%] z-10 hidden -translate-y-1/2 lg:block">
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/78">{labelLeft}</div>
            <div className="mt-2 text-[14px] text-white/70">Heliospheric stream</div>
            <div className="mt-2 text-[22px] font-medium text-white/84">{valueLeft}</div>
          </div>

          <div className="pointer-events-none absolute right-[12%] top-[31%] z-10 hidden lg:block">
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/78">{labelRightTop}</div>
            <div className="mt-2 text-[14px] font-medium text-cyan-200/80">{valueRightTop}</div>
          </div>

          <div className="pointer-events-none absolute right-[11%] top-[68%] z-10 hidden lg:block">
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/78">{labelRightBottom}</div>
            <div className="mt-2 text-[14px] font-medium text-violet-200/80">{valueRightBottom}</div>
          </div>

          <div className="absolute inset-y-0 left-[1.25%] flex items-center">
            <CarouselArrow direction="left" onClick={goPrevious} className="h-14 w-14" />
          </div>

          <div className="absolute inset-y-0 right-[1.25%] flex items-center">
            <CarouselArrow direction="right" onClick={goNext} className="h-14 w-14" />
          </div>

        </div>

        <motion.div
          key={`meta-${activePlanet.id}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: "easeOut" }}
          className="relative z-10 mt-auto flex flex-col items-center gap-4 pb-1"
        >
          <PlanetDots
            count={planets.length}
            activeIndex={activeIndex}
            onSelect={(index) => goTo(index, index > activeIndex ? 1 : -1)}
          />
        </motion.div>
      </div>
    </section>
  );
}
