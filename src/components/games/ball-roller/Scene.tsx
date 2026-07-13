"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment } from "@react-three/drei";
import { type RefObject, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  BALL_RADIUS,
  GOAL_RADIUS,
  type BallRollerState,
  currentLevel,
} from "@/lib/games/ball-roller/engine";

function Floor({ halfW, halfD }: { halfW: number; halfD: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
      <planeGeometry args={[halfW * 2, halfD * 2]} />
      <meshStandardMaterial
        color="#1a1230"
        roughness={0.85}
        metalness={0.15}
      />
    </mesh>
  );
}

function Rim({ halfW, halfD }: { halfW: number; halfD: number }) {
  const t = 0.18;
  const h = 0.35;
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
          <meshStandardMaterial
            color="#2e2150"
            roughness={0.6}
            metalness={0.25}
          />
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
        <mesh key={i} position={[w.x, 0.4, w.z]} castShadow receiveShadow>
          <boxGeometry args={[w.w, 0.8, w.d]} />
          <meshStandardMaterial
            color="#5b21b6"
            emissive="#3b0764"
            emissiveIntensity={0.25}
            roughness={0.45}
            metalness={0.35}
          />
        </mesh>
      ))}
    </group>
  );
}

function Goal({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0.02, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[GOAL_RADIUS * 0.55, GOAL_RADIUS, 48]} />
        <meshStandardMaterial
          color="#34d399"
          emissive="#059669"
          emissiveIntensity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 1.8, 8]} />
        <meshStandardMaterial color="#a7f3d0" />
      </mesh>
      <mesh position={[0.28, 1.45, 0]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.55, 0.32, 0.04]} />
        <meshStandardMaterial
          color="#34d399"
          emissive="#10b981"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}

function BallMesh({ stateRef }: { stateRef: RefObject<BallRollerState> }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, dt) => {
    const s = stateRef.current;
    if (!ref.current || !s) return;
    ref.current.position.set(s.ball.x, BALL_RADIUS, s.ball.z);
    ref.current.rotation.x += dt * 4;
    ref.current.rotation.z -= dt * 3;
  });

  return (
    <mesh ref={ref} castShadow>
      <sphereGeometry args={[BALL_RADIUS, 32, 32]} />
      <meshStandardMaterial
        color="#fb7185"
        emissive="#be185d"
        emissiveIntensity={0.35}
        roughness={0.25}
        metalness={0.55}
      />
    </mesh>
  );
}

function Platform({
  stateRef,
  levelIndex,
}: {
  stateRef: RefObject<BallRollerState>;
  levelIndex: number;
}) {
  const group = useRef<THREE.Group>(null);
  const live = currentLevel({ levelIndex });

  useFrame(() => {
    const s = stateRef.current;
    if (!group.current || !s) return;
    group.current.rotation.x = s.tilt.z * 0.85;
    group.current.rotation.z = -s.tilt.x * 0.85;
  });

  return (
    <group ref={group}>
      <Floor halfW={live.halfW} halfD={live.halfD} />
      <Rim halfW={live.halfW} halfD={live.halfD} />
      <Walls walls={live.walls} />
      <Goal x={live.goal.x} z={live.goal.z} />
      <BallMesh stateRef={stateRef} />
      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.45}
        scale={Math.max(live.halfW, live.halfD) * 3}
        blur={2.2}
        far={8}
      />
    </group>
  );
}

function CameraRig({ stateRef }: { stateRef: RefObject<BallRollerState> }) {
  useFrame((three) => {
    const s = stateRef.current;
    if (!s) return;
    const level = currentLevel(s);
    const span = Math.max(level.halfW, level.halfD);
    const ideal = new THREE.Vector3(
      s.ball.x * 0.15,
      span * 1.35 + 4,
      s.ball.z * 0.15 + span * 1.15,
    );
    three.camera.position.lerp(ideal, 0.06);
    three.camera.lookAt(s.ball.x * 0.2, 0, s.ball.z * 0.2);
  });
  return null;
}

export default function BallRollerScene({
  stateRef,
  levelIndex,
}: {
  stateRef: RefObject<BallRollerState>;
  levelIndex: number;
}) {
  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 1.75]}
      camera={{ position: [0, 12, 10], fov: 42, near: 0.1, far: 80 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: "#08020f" }}
    >
      <color attach="background" args={["#08020f"]} />
      <ambientLight intensity={0.45} />
      <directionalLight
        castShadow
        position={[8, 14, 6]}
        intensity={1.35}
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-6, 6, -4]} intensity={0.55} color="#c084fc" />
      <Environment preset="night" />
      <Platform stateRef={stateRef} levelIndex={levelIndex} key={levelIndex} />
      <CameraRig stateRef={stateRef} />
    </Canvas>
  );
}
