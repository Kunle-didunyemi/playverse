"use client";

import { Canvas, type ThreeEvent, useFrame } from "@react-three/fiber";
import { type RefObject, Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  BALL_RADIUS,
  HOLE_RADIUS,
  type MiniGolfState,
  currentHole,
} from "@/lib/games/mini-golf/engine";

function Green({ halfW, halfD }: { halfW: number; halfD: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[halfW * 2, halfD * 2]} />
      <meshStandardMaterial color="#166534" roughness={0.92} metalness={0.05} />
    </mesh>
  );
}

function Border({ halfW, halfD }: { halfW: number; halfD: number }) {
  const t = 0.22;
  const h = 0.28;
  const parts = useMemo(
    () => [
      { x: 0, z: -halfD - t / 2, w: halfW * 2 + t * 2, d: t },
      { x: 0, z: halfD + t / 2, w: halfW * 2 + t * 2, d: t },
      { x: -halfW - t / 2, z: 0, w: t, d: halfD * 2 },
      { x: halfW + t / 2, z: 0, w: t, d: halfD * 2 },
    ],
    [halfW, halfD],
  );
  return (
    <group>
      {parts.map((p, i) => (
        <mesh key={i} position={[p.x, h / 2, p.z]} castShadow receiveShadow>
          <boxGeometry args={[p.w, h, p.d]} />
          <meshStandardMaterial color="#713f12" roughness={0.75} />
        </mesh>
      ))}
    </group>
  );
}

function Walls({
  walls,
}: {
  walls: { x: number; z: number; w: number; d: number }[];
}) {
  return (
    <group>
      {walls.map((w, i) => (
        <mesh key={i} position={[w.x, 0.32, w.z]} castShadow receiveShadow>
          <boxGeometry args={[w.w, 0.64, w.d]} />
          <meshStandardMaterial color="#a16207" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function Cup({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0.02, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[HOLE_RADIUS, 32]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 1.7, 8]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      <mesh position={[0.3, 1.35, 0]} rotation={[0, 0, -0.35]}>
        <boxGeometry args={[0.55, 0.32, 0.04]} />
        <meshStandardMaterial
          color="#f43f5e"
          emissive="#be123c"
          emissiveIntensity={0.45}
        />
      </mesh>
    </group>
  );
}

function BallMesh({ stateRef }: { stateRef: RefObject<MiniGolfState> }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    const s = stateRef.current;
    if (!ref.current || !s) return;
    ref.current.position.set(s.ball.x, BALL_RADIUS, s.ball.z);
    const speed = Math.hypot(s.vel.x, s.vel.z);
    if (speed > 0.05) {
      ref.current.rotation.x += dt * speed * 2;
      ref.current.rotation.z -= dt * speed * 1.5;
    }
  });
  return (
    <mesh ref={ref} castShadow>
      <sphereGeometry args={[BALL_RADIUS, 28, 28]} />
      <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.25} />
    </mesh>
  );
}

function AimGuide({ stateRef }: { stateRef: RefObject<MiniGolfState> }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    const s = stateRef.current;
    if (!ref.current || !s) return;
    const show = s.phase === "aiming";
    ref.current.visible = show;
    if (!show) return;
    ref.current.position.set(s.ball.x, 0.06, s.ball.z);
    ref.current.rotation.y = Math.PI / 2 - s.aimAngle;
    const len = 0.9 + (s.charging ? s.power * 0.4 : 1.5);
    ref.current.scale.set(1, 1, len);
  });

  return (
    <group ref={ref}>
      <mesh position={[0, 0, 0.75]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 1.5, 8]} />
        <meshStandardMaterial
          color="#fde68a"
          emissive="#f59e0b"
          emissiveIntensity={0.65}
          transparent
          opacity={0.9}
        />
      </mesh>
      <mesh position={[0, 0, 1.55]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.14, 0.3, 10]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#d97706"
          emissiveIntensity={0.55}
        />
      </mesh>
    </group>
  );
}

function Course({
  stateRef,
  holeIndex,
}: {
  stateRef: RefObject<MiniGolfState>;
  holeIndex: number;
}) {
  const hole = currentHole({ holeIndex });
  return (
    <group>
      <Green halfW={hole.halfW} halfD={hole.halfD} />
      <Border halfW={hole.halfW} halfD={hole.halfD} />
      <Walls walls={hole.walls} />
      <Cup x={hole.cup.x} z={hole.cup.z} />
      <BallMesh stateRef={stateRef} />
      <AimGuide stateRef={stateRef} />
    </group>
  );
}

function CameraRig({ stateRef }: { stateRef: RefObject<MiniGolfState> }) {
  useFrame((three) => {
    const s = stateRef.current;
    if (!s) return;
    const hole = currentHole(s);
    const span = Math.max(hole.halfW, hole.halfD);
    const ideal = new THREE.Vector3(
      s.ball.x * 0.15,
      span * 1.15 + 5.5,
      s.ball.z * 0.15 + span * 1.35,
    );
    three.camera.position.lerp(ideal, 0.08);
    three.camera.lookAt(s.ball.x * 0.2, 0, s.ball.z * 0.2);
  });
  return null;
}

function AimPlane({
  stateRef,
  holeIndex,
  onAim,
  onChargeStart,
  onChargeEnd,
}: {
  stateRef: RefObject<MiniGolfState>;
  holeIndex: number;
  onAim: (x: number, z: number) => void;
  onChargeStart: () => void;
  onChargeEnd: () => void;
}) {
  const hole = currentHole({ holeIndex });

  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (stateRef.current?.phase !== "aiming") return;
    onAim(e.point.x, e.point.z);
  };

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.04, 0]}
      onPointerMove={onPointerMove}
      onPointerDown={(e) => {
        e.stopPropagation();
        if (stateRef.current?.phase !== "aiming") return;
        onAim(e.point.x, e.point.z);
        onChargeStart();
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        onChargeEnd();
      }}
      onPointerLeave={() => {
        if (stateRef.current?.charging) onChargeEnd();
      }}
    >
      <planeGeometry args={[hole.halfW * 2.5, hole.halfD * 2.5]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}

function SceneInner({
  stateRef,
  holeIndex,
  onAim,
  onChargeStart,
  onChargeEnd,
}: {
  stateRef: RefObject<MiniGolfState>;
  holeIndex: number;
  onAim: (x: number, z: number) => void;
  onChargeStart: () => void;
  onChargeEnd: () => void;
}) {
  return (
    <>
      <color attach="background" args={["#07140c"]} />
      <ambientLight intensity={0.65} />
      <directionalLight
        castShadow
        position={[8, 16, 8]}
        intensity={1.45}
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-6, 8, -4]} intensity={0.35} color="#86efac" />
      <hemisphereLight args={["#bfdbfe", "#14532d", 0.45]} />
      <Course stateRef={stateRef} holeIndex={holeIndex} key={holeIndex} />
      <AimPlane
        stateRef={stateRef}
        holeIndex={holeIndex}
        onAim={onAim}
        onChargeStart={onChargeStart}
        onChargeEnd={onChargeEnd}
      />
      <CameraRig stateRef={stateRef} />
    </>
  );
}

export default function MiniGolfScene({
  stateRef,
  holeIndex,
  onAim,
  onChargeStart,
  onChargeEnd,
}: {
  stateRef: RefObject<MiniGolfState>;
  holeIndex: number;
  onAim: (x: number, z: number) => void;
  onChargeStart: () => void;
  onChargeEnd: () => void;
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [0, 14, 12], fov: 42, near: 0.1, far: 80 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      className="h-full w-full touch-none"
      style={{ background: "#07140c" }}
    >
      <Suspense fallback={null}>
        <SceneInner
          stateRef={stateRef}
          holeIndex={holeIndex}
          onAim={onAim}
          onChargeStart={onChargeStart}
          onChargeEnd={onChargeEnd}
        />
      </Suspense>
    </Canvas>
  );
}
