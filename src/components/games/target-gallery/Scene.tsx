"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { type RefObject, useRef } from "react";
import * as THREE from "three";
import {
  ROUND_SECONDS,
  type TargetGalleryState,
} from "@/lib/games/target-gallery/engine";

function Targets({
  stateRef,
  onHit,
}: {
  stateRef: RefObject<TargetGalleryState>;
  onHit: (id: number | null) => void;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    const s = stateRef.current;
    if (!group.current || !s) return;
    const now = ROUND_SECONDS - s.timeLeft;
    const children = group.current.children;

    s.targets.forEach((t, i) => {
      let mesh = children[i] as THREE.Mesh | undefined;
      if (!mesh) {
        mesh = new THREE.Mesh(
          new THREE.SphereGeometry(1, 24, 24),
          new THREE.MeshStandardMaterial({
            roughness: 0.35,
            metalness: 0.2,
          }),
        );
        mesh.castShadow = true;
        group.current!.add(mesh);
      }
      mesh.visible = true;
      mesh.userData.id = t.id;
      const bob = Math.sin((now - t.born) * 2.2 + t.id) * 0.15;
      mesh.position.set(t.x, t.y + bob, t.z);
      mesh.scale.setScalar(t.r);
      (mesh.material as THREE.MeshStandardMaterial).color.set(t.color);
      (mesh.material as THREE.MeshStandardMaterial).emissive.set(t.color);
      (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.25;
    });

    for (let i = s.targets.length; i < children.length; i++) {
      children[i]!.visible = false;
    }
  });

  return (
    <group
      ref={group}
      onClick={(e) => {
        e.stopPropagation();
        const id = (e.object as THREE.Mesh).userData.id as number | undefined;
        onHit(id ?? null);
      }}
    />
  );
}

function Room() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -6]} receiveShadow>
        <planeGeometry args={[16, 20]} />
        <meshStandardMaterial color="#1a1230" />
      </mesh>
      <mesh position={[0, 3, -14]} receiveShadow>
        <planeGeometry args={[16, 8]} />
        <meshStandardMaterial color="#2e1065" />
      </mesh>
      <mesh position={[-8, 3, -6]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[20, 8]} />
        <meshStandardMaterial color="#1e1b4b" />
      </mesh>
      <mesh position={[8, 3, -6]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[20, 8]} />
        <meshStandardMaterial color="#1e1b4b" />
      </mesh>
    </group>
  );
}

export default function TargetGalleryScene({
  stateRef,
  onHit,
}: {
  stateRef: RefObject<TargetGalleryState>;
  onHit: (id: number | null) => void;
}) {
  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 1.5]}
      camera={{ position: [0, 2.2, 6], fov: 50 }}
      className="h-full w-full touch-none"
      style={{ background: "#10081c" }}
      onPointerMissed={() => onHit(null)}
    >
      <color attach="background" args={["#10081c"]} />
      <ambientLight intensity={0.5} />
      <directionalLight castShadow position={[4, 10, 6]} intensity={1.2} />
      <pointLight position={[0, 4, 2]} intensity={0.5} color="#f472b6" />
      <Room />
      <Targets stateRef={stateRef} onHit={onHit} />
    </Canvas>
  );
}
