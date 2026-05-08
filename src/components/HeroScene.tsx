import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, Stars, Torus } from "@react-three/drei";
import * as THREE from "three";

/* ── Floating crystalline scale symbol ── */
function GoldCrystal() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const innerRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.y = t * 0.18;
    meshRef.current.rotation.x = Math.sin(t * 0.12) * 0.15;
    innerRef.current.rotation.y = -t * 0.25;
    innerRef.current.rotation.z = t * 0.1;
  });

  return (
    <group>
      {/* Outer octahedron */}
      <mesh ref={meshRef}>
        <octahedronGeometry args={[1.4, 0]} />
        <meshStandardMaterial
          color="#C9A84C"
          metalness={0.9}
          roughness={0.1}
          wireframe={false}
          transparent
          opacity={0.85}
          envMapIntensity={2}
        />
      </mesh>
      {/* Inner rotating ring */}
      <mesh ref={innerRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.0, 0.04, 16, 64]} />
        <meshStandardMaterial
          color="#F0D78A"
          metalness={1}
          roughness={0.05}
          emissive="#C9A84C"
          emissiveIntensity={0.4}
        />
      </mesh>
      {/* Second ring */}
      <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <torusGeometry args={[1.15, 0.03, 16, 64]} />
        <meshStandardMaterial
          color="#A8893A"
          metalness={1}
          roughness={0.1}
          emissive="#C9A84C"
          emissiveIntensity={0.2}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
}

/* ── Orbiting particles ── */
function OrbitingParticles({ count = 120 }: { count?: number }) {
  const meshRef = useRef<THREE.Points>(null!);

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 1.8 + Math.random() * 1.8;
      const y = (Math.random() - 0.5) * 2.5;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      speeds[i] = 0.3 + Math.random() * 0.5;
    }
    return { positions, speeds };
  }, [count]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const pos = meshRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + t * speeds[i] * 0.15;
      const radius = 1.8 + Math.sin(t * speeds[i] * 0.4 + i) * 0.4 + 1.0;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#C9A84C"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

/* ── Inner glow sphere ── */
function GlowCore() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    ref.current.scale.setScalar(0.95 + Math.sin(t * 1.2) * 0.05);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.55, 32, 32]} />
      <meshStandardMaterial
        color="#C9A84C"
        emissive="#A87A20"
        emissiveIntensity={1.2}
        transparent
        opacity={0.35}
      />
    </mesh>
  );
}

/* ── Scale pillars (abstract justice) ── */
function ScalePillars() {
  const groupRef = useRef<THREE.Group>(null!);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.08;
  });

  return (
    <group ref={groupRef} position={[0, -0.2, 0]}>
      {/* Left pan */}
      <mesh position={[-1.0, Math.sin(Date.now() * 0.001) * 0.1, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.06, 32]} />
        <meshStandardMaterial color="#C9A84C" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Right pan */}
      <mesh position={[1.0, -Math.sin(Date.now() * 0.001) * 0.1, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.06, 32]} />
        <meshStandardMaterial color="#C9A84C" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Beam */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[2.2, 0.04, 0.04]} />
        <meshStandardMaterial color="#DFC070" metalness={1} roughness={0.05} />
      </mesh>
      {/* Pillar */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.04, 0.08, 1.6, 16]} />
        <meshStandardMaterial color="#A8893A" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

/* ── Scene content ── */
function SceneContent() {
  return (
    <>
      <ambientLight intensity={0.3} color="#1a1a2e" />
      <pointLight position={[3, 4, 3]} color="#C9A84C" intensity={8} distance={12} />
      <pointLight position={[-3, -2, -3]} color="#1E3A8A" intensity={4} distance={10} />
      <pointLight position={[0, 0, 5]} color="#ffffff" intensity={2} distance={8} />
      <Stars radius={40} depth={30} count={800} factor={2} saturation={0} fade speed={0.5} />

      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.5}>
        <GoldCrystal />
      </Float>
      <GlowCore />
      <OrbitingParticles count={140} />
    </>
  );
}

/* ── Exported canvas ── */
export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <SceneContent />
    </Canvas>
  );
}
