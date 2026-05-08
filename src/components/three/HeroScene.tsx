"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Stars } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

function CenterOrb() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    meshRef.current.rotation.x =
      Math.sin(state.clock.elapsedTime * 0.2) * 0.15;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.4} floatIntensity={1.2}>
      <mesh ref={meshRef} scale={1.6}>
        <icosahedronGeometry args={[1, 4]} />
        <MeshDistortMaterial
          color="#7c3aed"
          emissive="#4c1d95"
          emissiveIntensity={0.4}
          distort={0.35}
          speed={1.5}
          roughness={0.15}
          metalness={0.85}
        />
      </mesh>

      <mesh scale={1.78}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="#22d3ee"
          wireframe
          transparent
          opacity={0.25}
        />
      </mesh>
    </Float>
  );
}

type ShapeKind = "box" | "sphere" | "torus" | "cone" | "tetra" | "octa";

interface OrbitingShapeProps {
  kind: ShapeKind;
  color: string;
  radius: number;
  speed: number;
  phase: number;
  yOffset: number;
  scale: number;
}

function OrbitingShape({
  kind,
  color,
  radius,
  speed,
  phase,
  yOffset,
  scale,
}: OrbitingShapeProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime * speed + phase;
    groupRef.current.position.x = Math.cos(t) * radius;
    groupRef.current.position.z = Math.sin(t) * radius;
    groupRef.current.position.y =
      yOffset + Math.sin(state.clock.elapsedTime * 1.2 + phase) * 0.3;
    groupRef.current.rotation.x = state.clock.elapsedTime * 0.6;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.4;
  });

  const geometry = useMemo(() => {
    switch (kind) {
      case "box":
        return <boxGeometry args={[1, 1, 1]} />;
      case "sphere":
        return <sphereGeometry args={[0.7, 16, 16]} />;
      case "torus":
        return <torusGeometry args={[0.6, 0.22, 16, 32]} />;
      case "cone":
        return <coneGeometry args={[0.65, 1.2, 16]} />;
      case "tetra":
        return <tetrahedronGeometry args={[0.9, 0]} />;
      case "octa":
        return <octahedronGeometry args={[0.85, 0]} />;
    }
  }, [kind]);

  return (
    <group ref={groupRef} scale={scale}>
      <mesh>
        {geometry}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.35}
          roughness={0.25}
          metalness={0.7}
        />
      </mesh>
    </group>
  );
}

const ORBITERS: OrbitingShapeProps[] = [
  { kind: "box", color: "#f472b6", radius: 3.4, speed: 0.35, phase: 0, yOffset: 0.4, scale: 0.55 },
  { kind: "torus", color: "#22d3ee", radius: 4.2, speed: -0.28, phase: 1.4, yOffset: -0.6, scale: 0.6 },
  { kind: "sphere", color: "#facc15", radius: 3.8, speed: 0.42, phase: 2.6, yOffset: 0.9, scale: 0.45 },
  { kind: "cone", color: "#34d399", radius: 3.1, speed: -0.5, phase: 3.8, yOffset: -0.3, scale: 0.5 },
  { kind: "tetra", color: "#a78bfa", radius: 4.6, speed: 0.3, phase: 5.0, yOffset: 0.1, scale: 0.55 },
  { kind: "octa", color: "#fb7185", radius: 2.8, speed: -0.45, phase: 0.7, yOffset: -0.9, scale: 0.5 },
];

function CameraAutoRotate() {
  const { camera } = useThree();
  const angleRef = useRef(0);

  useFrame((_, delta) => {
    angleRef.current += delta * 0.08;
    camera.position.x = Math.sin(angleRef.current) * 8;
    camera.position.z = Math.cos(angleRef.current) * 8;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function PerformanceGuard() {
  const { gl } = useThree();

  useEffect(() => {
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  }, [gl]);

  return null;
}

function SceneContent() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 6, 4]} intensity={1} />
      <pointLight position={[-6, -3, -4]} intensity={1.2} color="#7c3aed" />
      <pointLight position={[6, 3, 4]} intensity={1} color="#22d3ee" />

      <Stars
        radius={60}
        depth={40}
        count={1200}
        factor={3}
        saturation={0}
        fade
        speed={0.5}
      />

      <CenterOrb />
      {ORBITERS.map((o, i) => (
        <OrbitingShape key={i} {...o} />
      ))}

      <CameraAutoRotate />
      <PerformanceGuard />
    </>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.6, 8], fov: 55 }}
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      style={{ background: "transparent" }}
      performance={{ min: 0.5 }}
    >
      <Suspense fallback={null}>
        <SceneContent />
      </Suspense>
    </Canvas>
  );
}
