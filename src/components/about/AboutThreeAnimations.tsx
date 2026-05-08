"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";
import {
  Suspense,
  useEffect,
  useRef,
  type ComponentType,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import * as THREE from "three";

function DprCap() {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  }, [gl]);
  return null;
}

function SceneLights({
  accent = "#7c3aed",
}: {
  accent?: string;
}) {
  return (
    <>
      <ambientLight intensity={0.38} />
      <directionalLight position={[4, 6, 5]} intensity={0.95} />
      <pointLight position={[-4, -2, -4]} intensity={0.75} color={accent} />
      <pointLight position={[4, 2, 3]} intensity={0.45} color="#22d3ee" />
    </>
  );
}

/** Rounded dice + chip tokens tumbling at different rates */
function DiceTokensScene() {
  const diceA = useRef<THREE.Group>(null);
  const diceB = useRef<THREE.Group>(null);
  const tokenA = useRef<THREE.Mesh>(null);
  const tokenB = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (diceA.current) {
      diceA.current.rotation.x = t * 0.62;
      diceA.current.rotation.y = t * 0.41;
      diceA.current.rotation.z = Math.sin(t * 0.35) * 0.2;
    }
    if (diceB.current) {
      diceB.current.rotation.x = -t * 0.55;
      diceB.current.rotation.z = t * 0.48;
      diceB.current.rotation.y = Math.cos(t * 0.28) * 0.35;
    }
    if (tokenA.current) {
      tokenA.current.rotation.x =
        Math.PI / 2 + Math.sin(t * 0.45) * 0.18;
      tokenA.current.rotation.z = t * 0.33;
    }
    if (tokenB.current) {
      tokenB.current.rotation.x =
        Math.PI / 2 - Math.sin(t * 0.38 + 1) * 0.12;
      tokenB.current.rotation.y = t * 0.22;
    }
  });

  return (
    <>
      <SceneLights accent="#a78bfa" />
      <DprCap />
      <Float speed={1.6} rotationIntensity={0.15} floatIntensity={0.55}>
        <group position={[0, -0.05, 0]}>
          <group ref={diceA} position={[-1.15, 0.35, 0.15]}>
            <RoundedBox
              args={[1, 1, 1]}
              radius={0.13}
              smoothness={5}
              scale={0.78}
            >
              <meshStandardMaterial
                color="#fafafa"
                metalness={0.35}
                roughness={0.32}
              />
            </RoundedBox>
          </group>

          <group ref={diceB} position={[1.05, -0.25, -0.2]}>
            <RoundedBox
              args={[0.82, 0.82, 0.82]}
              radius={0.11}
              smoothness={5}
              scale={0.72}
            >
              <meshStandardMaterial
                color="#c4b5fd"
                emissive="#5b21b6"
                emissiveIntensity={0.18}
                metalness={0.45}
                roughness={0.28}
              />
            </RoundedBox>
          </group>

          <mesh ref={tokenA} position={[0.35, 0.05, 1]}>
            <cylinderGeometry args={[0.52, 0.52, 0.11, 48]} />
            <meshStandardMaterial
              color="#22d3ee"
              emissive="#164e63"
              emissiveIntensity={0.28}
              metalness={0.75}
              roughness={0.22}
            />
          </mesh>

          <mesh ref={tokenB} position={[-0.85, -0.15, -0.95]}>
            <cylinderGeometry args={[0.44, 0.44, 0.09, 48]} />
            <meshStandardMaterial
              color="#f472b6"
              emissive="#831843"
              emissiveIntensity={0.22}
              metalness={0.68}
              roughness={0.25}
            />
          </mesh>
        </group>
      </Float>
    </>
  );
}

/** Spinning torus knot with counter-rotating accent torus */
function KnotScene() {
  const knotRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (knotRef.current) {
      knotRef.current.rotation.x = t * 0.55;
      knotRef.current.rotation.y = t * 0.38;
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = -t * 0.42;
      ringRef.current.rotation.z = t * 0.28;
    }
  });

  return (
    <>
      <SceneLights accent="#f472b6" />
      <DprCap />
      <mesh ref={knotRef} scale={0.42}>
        <torusKnotGeometry args={[1.15, 0.32, 120, 16]} />
        <meshStandardMaterial
          color="#ec4899"
          emissive="#831843"
          emissiveIntensity={0.35}
          roughness={0.22}
          metalness={0.78}
        />
      </mesh>
      <mesh ref={ringRef} rotation={[Math.PI / 2.6, 0, 0]} scale={1.05}>
        <torusGeometry args={[1.65, 0.06, 12, 48]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#164e63"
          emissiveIntensity={0.5}
          roughness={0.15}
          metalness={0.9}
          transparent
          opacity={0.85}
        />
      </mesh>
    </>
  );
}

/** Grid of cubes with sinusoidal height wave */
function LatticeWaveScene() {
  const count = 5;
  const refs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    let idx = 0;
    for (let iz = 0; iz < count; iz++) {
      for (let ix = 0; ix < count; ix++) {
        const mesh = refs.current[idx++];
        if (!mesh) continue;
        mesh.position.y =
          Math.sin(t * 1.85 + ix * 0.52 + iz * 0.52) * 0.42;
        mesh.rotation.y = t * 0.28 + ix * 0.12 + iz * 0.08;
      }
    }
  });

  const meshes: React.ReactNode[] = [];
  let idx = 0;
  const span = (count - 1) / 2;
  for (let iz = 0; iz < count; iz++) {
    for (let ix = 0; ix < count; ix++) {
      const i = idx++;
      meshes.push(
        <mesh
          key={`${ix}-${iz}`}
          ref={(el) => {
            refs.current[i] = el;
          }}
          position={[ix - span, 0, iz - span]}
          scale={0.34}
        >
          <boxGeometry />
          <meshStandardMaterial
            color="#34d399"
            emissive="#064e3b"
            emissiveIntensity={0.22}
            roughness={0.28}
            metalness={0.65}
          />
        </mesh>
      );
    }
  }

  return (
    <>
      <SceneLights accent="#34d399" />
      <DprCap />
      <group position={[0, -0.15, 0]}>{meshes}</group>
    </>
  );
}

/** Octahedron + wire halo — rotation, lift, and scale track scroll progress (0–1) */
function ScrollDrivenScene({
  progressRef,
}: {
  progressRef: MutableRefObject<number>;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const p = progressRef.current;
    const idle = state.clock.elapsedTime;
    groupRef.current.rotation.y = p * Math.PI * 2 + idle * 0.12;
    groupRef.current.rotation.x =
      Math.sin(p * Math.PI) * 0.52 + Math.sin(idle * 0.35) * 0.06;
    groupRef.current.rotation.z = Math.cos(p * Math.PI * 1.5) * 0.22;
    groupRef.current.position.y = (p - 0.5) * 0.55;
    const s = 0.68 + p * 0.52;
    groupRef.current.scale.setScalar(s);
  });

  return (
    <>
      <SceneLights accent="#a855f7" />
      <DprCap />
      <group ref={groupRef}>
        <mesh>
          <octahedronGeometry args={[1.05, 0]} />
          <meshStandardMaterial
            color="#c084fc"
            emissive="#581c87"
            emissiveIntensity={0.38}
            roughness={0.2}
            metalness={0.78}
          />
        </mesh>
        <mesh rotation={[Math.PI / 4, Math.PI / 5, 0]} scale={1.35}>
          <torusGeometry args={[1.15, 0.018, 12, 72]} />
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#164e63"
            emissiveIntensity={0.45}
            roughness={0.12}
            metalness={0.92}
            transparent
            opacity={0.75}
          />
        </mesh>
      </group>
    </>
  );
}

/** Core sphere + soft halo; lerps toward normalized pointer (-1…1) */
function CursorFollowerScene({
  cursorRef,
}: {
  cursorRef: MutableRefObject<{ x: number; y: number }>;
}) {
  const coreRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const tx = cursorRef.current.x * 1.9;
    const ty = cursorRef.current.y * 1.45;
    const k = 0.11;

    if (coreRef.current) {
      coreRef.current.position.x += (tx - coreRef.current.position.x) * k;
      coreRef.current.position.y += (ty - coreRef.current.position.y) * k;
      coreRef.current.rotation.x = t * 0.31;
      coreRef.current.rotation.y = t * 0.38;
    }
    if (haloRef.current) {
      const hx = tx * 0.72;
      const hy = ty * 0.72;
      haloRef.current.position.x +=
        (hx - haloRef.current.position.x) * (k * 0.85);
      haloRef.current.position.y +=
        (hy - haloRef.current.position.y) * (k * 0.85);
      haloRef.current.rotation.z = t * 0.08;
    }
    if (lightRef.current && coreRef.current) {
      lightRef.current.position.copy(coreRef.current.position);
      lightRef.current.position.z = 2.2;
    }
  });

  return (
    <>
      <SceneLights accent="#38bdf8" />
      <DprCap />
      <pointLight
        ref={lightRef}
        intensity={2.4}
        distance={8}
        color="#e0f2fe"
        position={[0, 0, 2.2]}
      />
      <mesh ref={haloRef}>
        <sphereGeometry args={[0.62, 24, 24]} />
        <meshStandardMaterial
          color="#38bdf8"
          transparent
          opacity={0.14}
          roughness={1}
          metalness={0}
        />
      </mesh>
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.42, 1]} />
        <meshStandardMaterial
          color="#f0f9ff"
          emissive="#0369a1"
          emissiveIntensity={0.42}
          roughness={0.14}
          metalness={0.66}
        />
      </mesh>
    </>
  );
}

function MiniCanvas({
  children,
  cameraPosition,
  pointerEventsNone = false,
}: {
  children: ReactNode;
  cameraPosition: [number, number, number];
  pointerEventsNone?: boolean;
}) {
  return (
    <Canvas
      camera={{ position: cameraPosition, fov: 48 }}
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      className="h-full w-full touch-none"
      style={{
        background: "transparent",
        pointerEvents: pointerEventsNone ? "none" : "auto",
      }}
    >
      <Suspense fallback={null}>{children}</Suspense>
    </Canvas>
  );
}

type StaticPanel = {
  kind: "static";
  title: string;
  body: string;
  camera: [number, number, number];
  Scene: ComponentType;
};

type ScrollPanel = {
  kind: "scroll";
  title: string;
  body: string;
  camera: [number, number, number];
};

type CursorPanel = {
  kind: "cursor";
  title: string;
  body: string;
  camera: [number, number, number];
};

type Panel = StaticPanel | ScrollPanel | CursorPanel;

const panels: Panel[] = [
  {
    kind: "static",
    title: "Why we built Playverse",
    body: "We wanted one place for quick sessions and serious scores — classic puzzles in the browser, accounts that follow you, and leaderboards that actually matter.",
    Scene: DiceTokensScene,
    camera: [0, 0.35, 5.6],
  },
  {
    kind: "static",
    title: "Tech that stays smooth",
    body: "Modern WebGL, thoughtful defaults, and responsive layouts so games feel good on a laptop or phone without sacrificing polish.",
    Scene: KnotScene,
    camera: [0, 0.35, 5.8],
  },
  {
    kind: "static",
    title: "Community-first play",
    body: "Signing in keeps your progress synced. Climb the boards, challenge friends, and help us grow the catalog — more titles are always on the way.",
    Scene: LatticeWaveScene,
    camera: [0, 0.85, 6.2],
  },
  {
    kind: "scroll",
    title: "Scroll-driven motion",
    body: "Scroll this page and watch the scene react — rotation, scale, and tilt follow how much of the frame has crossed your viewport, so motion stays tied to the way you read.",
    camera: [0, 0.15, 5.5],
  },
  {
    kind: "cursor",
    title: "Follows your cursor",
    body: "Move the pointer over the canvas: the core eases toward you and the light rides along — a small, tactile moment that keeps the page feeling responsive.",
    camera: [0, 0.15, 5.35],
  },
];

function AboutSectionRow({
  panel,
  index,
  reverse,
}: {
  panel: Panel;
  index: number;
  reverse: boolean;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef(0);
  const cursorRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (panel.kind !== "scroll") return;
    const el = frameRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const track = vh + rect.height;
      const traveled = vh * 0.5 - rect.top;
      scrollProgressRef.current = THREE.MathUtils.clamp(
        traveled / track,
        0,
        1
      );
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [panel.kind]);

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (panel.kind !== "cursor") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const w = rect.width || 1;
    const h = rect.height || 1;
    cursorRef.current.x = ((e.clientX - rect.left) / w) * 2 - 1;
    cursorRef.current.y = -(((e.clientY - rect.top) / h) * 2 - 1);
  };

  let canvasInner: ReactNode;
  if (panel.kind === "scroll") {
    canvasInner = <ScrollDrivenScene progressRef={scrollProgressRef} />;
  } else if (panel.kind === "cursor") {
    canvasInner = <CursorFollowerScene cursorRef={cursorRef} />;
  } else {
    const Scene = panel.Scene;
    canvasInner = <Scene />;
  }

  const cursorMode = panel.kind === "cursor";

  return (
    <section className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
      <div
        ref={frameRef}
        onPointerMove={cursorMode ? onPointerMove : undefined}
        onPointerLeave={
          cursorMode
            ? () => {
                cursorRef.current.x = 0;
                cursorRef.current.y = 0;
              }
            : undefined
        }
        className={`relative aspect-4/3 w-full overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-violet-950/40 via-black/60 to-cyan-950/25 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] ${reverse ? "md:order-2" : ""} ${cursorMode ? "cursor-crosshair" : ""}`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.12),transparent_65%)]" />
        <MiniCanvas
          cameraPosition={panel.camera}
          pointerEventsNone={cursorMode}
        >
          {canvasInner}
        </MiniCanvas>
      </div>
      <div className={reverse ? "md:order-1" : ""}>
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-400/90">
          {String(index + 1).padStart(2, "0")}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {panel.title}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-zinc-400">
          {panel.body}
        </p>
      </div>
    </section>
  );
}

export default function AboutThreeAnimations() {
  return (
    <div className="mt-16 flex flex-col gap-20">
      {panels.map((panel, i) => (
        <AboutSectionRow
          key={panel.title}
          panel={panel}
          index={i}
          reverse={i % 2 === 1}
        />
      ))}
    </div>
  );
}
