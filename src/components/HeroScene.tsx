import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Torus } from "@react-three/drei";
import * as THREE from "three";

/* ── Lighting ── */
function Lights() {
  return (
    <>
      <ambientLight intensity={0.7} color="#FFF8E8" />
      {/* Primary gold warm key light */}
      <directionalLight position={[5, 6, 4]} color="#DFC070" intensity={5} />
      {/* Navy fill from bottom-left for depth */}
      <pointLight position={[-5, -3, -4]} color="#1E3A8A" intensity={6} distance={18} />
      {/* Soft frontal rim */}
      <pointLight position={[0, 1, 7]} color="#FFFFFF" intensity={2} distance={14} />
      {/* Gold under-glow */}
      <pointLight position={[0, -4, 2]} color="#C9A84C" intensity={3} distance={12} />
    </>
  );
}

/* ── Central glass orb with distortion ── */
function GlassOrb() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    ref.current.rotation.y = t * 0.07;
    ref.current.rotation.x = Math.sin(t * 0.05) * 0.06;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1.55, 64, 64]} />
      <MeshDistortMaterial
        color="#F5F0E8"
        roughness={0.08}
        metalness={0.04}
        distort={0.08}
        speed={1.5}
        transparent
        opacity={0.55}
        envMapIntensity={0.5}
      />
    </mesh>
  );
}

/* ── Inner gold scales of justice ── */
function GoldenScales() {
  const groupRef  = useRef<THREE.Group>(null!);
  const leftPan   = useRef<THREE.Group>(null!);
  const rightPan  = useRef<THREE.Group>(null!);
  const beamRef   = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    /* Gentle y-rotation of the whole scales */
    groupRef.current.rotation.y = Math.sin(t * 0.18) * 0.55;
    /* Pan oscillation */
    const sway = Math.sin(t * 0.45) * 0.18;
    leftPan.current.position.y  = -sway;
    rightPan.current.position.y =  sway;
    /* Very subtle beam tilt */
    beamRef.current.rotation.z  = Math.sin(t * 0.45) * 0.08;
  });

  return (
    <group ref={groupRef} position={[0, -0.08, 0.2]}>
      {/* Beam */}
      <mesh ref={beamRef} position={[0, 0.4, 0]}>
        <boxGeometry args={[2.0, 0.06, 0.06]} />
        <meshStandardMaterial color="#F0D78A" metalness={0.97} roughness={0.04} />
      </mesh>

      {/* Center ornament + pillar */}
      <mesh position={[0, 0.56, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#C9A84C" metalness={0.95} roughness={0.05} />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.04, 0.07, 0.9, 16]} />
        <meshStandardMaterial color="#A8893A" metalness={0.92} roughness={0.08} />
      </mesh>
      {/* Base */}
      <mesh position={[0, -0.38, 0]}>
        <cylinderGeometry args={[0.22, 0.28, 0.06, 32]} />
        <meshStandardMaterial color="#C9A84C" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Left pan & chain */}
      <group ref={leftPan} position={[-1.0, 0.28, 0]}>
        <mesh position={[0, -0.35, 0]}>
          <cylinderGeometry args={[0.30, 0.30, 0.055, 32]} />
          <meshStandardMaterial color="#DFC070" metalness={0.95} roughness={0.06}
            emissive="#C9A84C" emissiveIntensity={0.15} />
        </mesh>
        {/* Simple chain links */}
        {[-0.08, -0.16, -0.24].map((y, i) => (
          <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.035, 0.008, 8, 16]} />
            <meshStandardMaterial color="#C9A84C" metalness={1} roughness={0.03} />
          </mesh>
        ))}
      </group>

      {/* Right pan & chain */}
      <group ref={rightPan} position={[1.0, 0.28, 0]}>
        <mesh position={[0, -0.35, 0]}>
          <cylinderGeometry args={[0.30, 0.30, 0.055, 32]} />
          <meshStandardMaterial color="#DFC070" metalness={0.95} roughness={0.06}
            emissive="#C9A84C" emissiveIntensity={0.15} />
        </mesh>
        {[-0.08, -0.16, -0.24].map((y, i) => (
          <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.035, 0.008, 8, 16]} />
            <meshStandardMaterial color="#C9A84C" metalness={1} roughness={0.03} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ── Gold orbital ring ── */
function OrbitalRing() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    ref.current.rotation.x = t * 0.12;
    ref.current.rotation.y = t * 0.08;
  });
  return (
    <mesh ref={ref} rotation={[Math.PI / 6, 0, Math.PI / 4]}>
      <torusGeometry args={[1.95, 0.025, 16, 120]} />
      <meshStandardMaterial
        color="#F0D78A"
        metalness={1}
        roughness={0.03}
        emissive="#C9A84C"
        emissiveIntensity={0.35}
        transparent
        opacity={0.75}
      />
    </mesh>
  );
}

/* ── Second thinner ring ── */
function OrbitalRing2() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    ref.current.rotation.x = -t * 0.09;
    ref.current.rotation.z = t * 0.06;
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 5, Math.PI / 5, 0]}>
      <torusGeometry args={[2.2, 0.015, 12, 100]} />
      <meshStandardMaterial
        color="#A8893A"
        metalness={0.9}
        roughness={0.1}
        transparent
        opacity={0.45}
      />
    </mesh>
  );
}

/* ── Orbiting gold particles ── */
function GoldParticles({ count = 140 }: { count?: number }) {
  const pts = useRef<THREE.Points>(null!);

  const { pos, speed } = useMemo(() => {
    const pos   = new Float32Array(count * 3);
    const speed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const phi   = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const r     = 2.2 + Math.random() * 1.8;
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      speed[i]       = 0.2 + Math.random() * 0.5;
    }
    return { pos, speed };
  }, [count]);

  useFrame((state) => {
    const t   = state.clock.getElapsedTime();
    const arr = pts.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const s = speed[i];
      const phi   = Math.acos(((i / count) * 2 - 1) * 0.98);
      const theta = (i / count) * Math.PI * 2 + t * s * 0.14;
      const r     = 2.4 + Math.sin(t * s * 0.35 + i * 0.8) * 0.5;
      arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    pts.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pts}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pos, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#C9A84C"
        size={0.035}
        transparent
        opacity={0.75}
        sizeAttenuation
      />
    </points>
  );
}

/* ── Small satellite glass orbs ── */
function SatelliteOrb({ radius, speed, phase, color }: {
  radius: number; speed: number; phase: number; color: string;
}) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    ref.current.position.x = Math.cos(t * speed + phase) * radius;
    ref.current.position.z = Math.sin(t * speed + phase) * radius;
    ref.current.position.y = Math.sin(t * speed * 0.6 + phase) * (radius * 0.35);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.12, 20, 20]} />
      <meshStandardMaterial
        color={color}
        metalness={0.05}
        roughness={0.08}
        transparent
        opacity={0.65}
        emissive={color}
        emissiveIntensity={0.15}
      />
    </mesh>
  );
}

/* ── Scene content ── */
function SceneContent() {
  return (
    <>
      <Lights />

      {/* Main floating group */}
      <Float speed={1.0} rotationIntensity={0.15} floatIntensity={0.4}>
        <GlassOrb />
        <GoldenScales />
        <OrbitalRing />
        <OrbitalRing2 />
      </Float>

      <GoldParticles count={150} />

      <SatelliteOrb radius={2.8} speed={0.4}  phase={0}              color="#F5F0E8" />
      <SatelliteOrb radius={3.2} speed={0.28} phase={Math.PI * 0.7}  color="#C9A84C" />
      <SatelliteOrb radius={2.6} speed={0.55} phase={Math.PI * 1.4}  color="#4EA8DE" />
      <SatelliteOrb radius={3.5} speed={0.22} phase={Math.PI * 0.35} color="#F0D78A" />
    </>
  );
}

/* ── Exported canvas ── */
export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.4, 6.5], fov: 46 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
      dpr={[1, 1.5]}
    >
      <SceneContent />
    </Canvas>
  );
}
