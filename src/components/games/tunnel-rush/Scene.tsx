"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { type RefObject, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  LANE_X,
  PLAYER_Z,
  type TunnelRushState,
} from "@/lib/games/tunnel-rush/engine";

function TunnelShell() {
  const rings = useMemo(
    () => Array.from({ length: 24 }, (_, i) => -i * 4),
    [],
  );
  return (
    <group>
      {rings.map((z, i) => (
        <mesh key={i} position={[0, 0, z]} rotation={[0, 0, i * 0.08]}>
          <torusGeometry args={[4.2, 0.08, 8, 32]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? "#4c1d95" : "#1e3a5f"}
            emissive="#2e1065"
            emissiveIntensity={0.25}
          />
        </mesh>
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -2.2, -20]}>
        <cylinderGeometry args={[4.4, 4.4, 60, 32, 1, true]} />
        <meshStandardMaterial
          color="#0f172a"
          side={THREE.BackSide}
          roughness={0.9}
        />
      </mesh>
    </group>
  );
}

function Player({ stateRef }: { stateRef: RefObject<TunnelRushState> }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const s = stateRef.current;
    if (!ref.current || !s) return;
    const targetX = LANE_X[s.lane] ?? 0;
    ref.current.position.x = THREE.MathUtils.lerp(
      ref.current.position.x,
      targetX,
      0.2,
    );
    ref.current.position.y = -0.8;
    ref.current.position.z = PLAYER_Z;
  });
  return (
    <mesh ref={ref} castShadow>
      <boxGeometry args={[0.9, 0.55, 1.2]} />
      <meshStandardMaterial
        color="#22d3ee"
        emissive="#0891b2"
        emissiveIntensity={0.45}
        metalness={0.4}
        roughness={0.3}
      />
    </mesh>
  );
}

function Obstacles({ stateRef }: { stateRef: RefObject<TunnelRushState> }) {
  const group = useRef<THREE.Group>(null);
  useFrame(() => {
    const s = stateRef.current;
    if (!group.current || !s) return;
    const children = group.current.children;
    s.obstacles.forEach((o, i) => {
      let mesh = children[i] as THREE.Mesh | undefined;
      if (!mesh) {
        mesh = new THREE.Mesh(
          new THREE.BoxGeometry(1.5, 1.5, 1.5),
          new THREE.MeshStandardMaterial({
            color: "#f43f5e",
            emissive: "#9f1239",
            emissiveIntensity: 0.35,
          }),
        );
        mesh.castShadow = true;
        group.current!.add(mesh);
      }
      mesh.visible = true;
      mesh.position.set(LANE_X[o.lane] ?? 0, -0.5, o.z);
    });
    for (let i = s.obstacles.length; i < children.length; i++) {
      children[i]!.visible = false;
    }
  });
  return <group ref={group} />;
}

function CameraRig({ stateRef }: { stateRef: RefObject<TunnelRushState> }) {
  useFrame((three) => {
    const s = stateRef.current;
    const x = LANE_X[s?.lane ?? 1] ?? 0;
    three.camera.position.lerp(new THREE.Vector3(x * 0.25, 1.8, PLAYER_Z + 6), 0.1);
    three.camera.lookAt(x * 0.15, 0, PLAYER_Z - 8);
  });
  return null;
}

export default function TunnelRushScene({
  stateRef,
}: {
  stateRef: RefObject<TunnelRushState>;
}) {
  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 1.5]}
      camera={{ position: [0, 2, 10], fov: 55 }}
      className="h-full w-full"
      style={{ background: "#05010a" }}
    >
      <color attach="background" args={["#05010a"]} />
      <fog attach="fog" args={["#05010a", 12, 42]} />
      <ambientLight intensity={0.4} />
      <directionalLight castShadow position={[4, 8, 6]} intensity={1.1} />
      <pointLight position={[0, 2, 2]} intensity={0.6} color="#a78bfa" />
      <TunnelShell />
      <Player stateRef={stateRef} />
      <Obstacles stateRef={stateRef} />
      <CameraRig stateRef={stateRef} />
    </Canvas>
  );
}
