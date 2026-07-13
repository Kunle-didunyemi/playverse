"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { type RefObject, useRef } from "react";
import * as THREE from "three";
import {
  SLAB_HEIGHT,
  type CubeStackState,
} from "@/lib/games/cube-stack/engine";

function Tower({ stateRef }: { stateRef: RefObject<CubeStackState> }) {
  const group = useRef<THREE.Group>(null);
  const movingRef = useRef<THREE.Mesh>(null);
  const stackGroup = useRef<THREE.Group>(null);

  useFrame(() => {
    const s = stateRef.current;
    if (!s || !group.current || !stackGroup.current) return;
    const topY = s.moving.y;
    group.current.position.y = -topY + 1.2;

    const children = stackGroup.current.children;
    s.stack.forEach((slab, i) => {
      let mesh = children[i] as THREE.Mesh | undefined;
      if (!mesh) {
        mesh = new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.25 }),
        );
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        stackGroup.current!.add(mesh);
      }
      mesh.visible = true;
      mesh.position.set(slab.x, slab.y, slab.z);
      mesh.scale.set(slab.w, SLAB_HEIGHT, slab.d);
      (mesh.material as THREE.MeshStandardMaterial).color.set(slab.color);
    });
    for (let i = s.stack.length; i < children.length; i++) {
      children[i]!.visible = false;
    }

    if (movingRef.current) {
      const m = s.moving;
      movingRef.current.position.set(m.x, m.y, m.z);
      movingRef.current.scale.set(m.w, SLAB_HEIGHT, m.d);
      (movingRef.current.material as THREE.MeshStandardMaterial).color.set(
        m.color,
      );
      movingRef.current.visible = s.phase !== "lost";
    }
  });

  return (
    <group ref={group}>
      <group ref={stackGroup} />
      <mesh ref={movingRef} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.35} metalness={0.3} />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.02, 0]}
        receiveShadow
      >
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#12081f" />
      </mesh>
    </group>
  );
}

function CameraRig({ stateRef }: { stateRef: RefObject<CubeStackState> }) {
  useFrame((three) => {
    const s = stateRef.current;
    const y = s?.moving.y ?? 1;
    three.camera.position.lerp(new THREE.Vector3(6.5, y + 5, 6.5), 0.08);
    three.camera.lookAt(0, y + 0.5, 0);
  });
  return null;
}

export default function CubeStackScene({
  stateRef,
}: {
  stateRef: RefObject<CubeStackState>;
}) {
  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 1.5]}
      camera={{ position: [6.5, 6, 6.5], fov: 42 }}
      className="h-full w-full"
      style={{ background: "#08020f" }}
    >
      <color attach="background" args={["#08020f"]} />
      <ambientLight intensity={0.55} />
      <directionalLight
        castShadow
        position={[6, 12, 4]}
        intensity={1.3}
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-4, 6, -2]} intensity={0.4} color="#c084fc" />
      <Tower stateRef={stateRef} />
      <CameraRig stateRef={stateRef} />
    </Canvas>
  );
}
