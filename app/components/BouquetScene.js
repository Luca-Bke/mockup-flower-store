'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

/* ─── colour palettes ─────────────────────────────────────────────── */
const PALETTES = {
  'rot/weiß':     ['#e53935', '#c62828', '#ffffff', '#ef9a9a', '#b71c1c'],
  'weiß/grün':    ['#ffffff', '#f5f5f5', '#a5d6a7', '#66bb6a', '#e8f5e9'],
  'rosa/pink':    ['#f48fb1', '#e91e8c', '#f06292', '#fce4ec', '#ec407a'],
  'gelb/orange':  ['#ffd54f', '#ffb300', '#ff7043', '#ff8f00', '#ffe082'],
  'bunt':         ['#e53935', '#8e24aa', '#fdd835', '#00897b', '#f06292'],
};

/* ─── single flower: stem + petals + centre ──────────────────────── */
function Flower({ position, color, scale = 1, tilt = 0 }) {
  const group = useRef();

  const petalColor = useMemo(() => new THREE.Color(color), [color]);
  const stemColor  = new THREE.Color('#3a7d44');
  const centreColor = new THREE.Color('#fdd835');

  return (
    <group ref={group} position={position} rotation={[tilt, Math.random() * Math.PI * 2, 0]} scale={scale}>
      {/* stem */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.03, 0.04, 0.6, 6]} />
        <meshStandardMaterial color={stemColor} roughness={0.9} />
      </mesh>
      {/* petals (6 ellipsoids rotated around Y) */}
      {[...Array(6)].map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 0.22, 0, Math.sin(angle) * 0.22]}
            rotation={[0, angle, Math.PI / 6]}
          >
            <sphereGeometry args={[0.13, 8, 6]} />
            <meshStandardMaterial color={petalColor} roughness={0.5} />
          </mesh>
        );
      })}
      {/* centre */}
      <mesh position={[0, 0.04, 0]}>
        <sphereGeometry args={[0.1, 10, 8]} />
        <meshStandardMaterial color={centreColor} roughness={0.4} emissive={centreColor} emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

/* ─── leaves ─────────────────────────────────────────────────────── */
function Leaf({ position, rotation }) {
  return (
    <mesh position={position} rotation={rotation}>
      <sphereGeometry args={[0.12, 6, 4]} />
      <meshStandardMaterial color="#4caf50" roughness={0.8} />
    </mesh>
  );
}

/* ─── vase ───────────────────────────────────────────────────────── */
function Vase() {
  return (
    <mesh position={[0, -1.05, 0]}>
      <cylinderGeometry args={[0.28, 0.22, 0.55, 20, 1, true]} />
      <meshPhysicalMaterial
        color="#cfe8f7"
        roughness={0.05}
        transmission={0.7}
        thickness={0.3}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

/* ─── main bouquet ──────────────────────────────────────────────────
   shape   : 'round' | 'tall'
   palette : colour key
   size    : 'S' | 'M' | 'L' | 'XL'
*/
function Bouquet({ shape, palette, size }) {
  const groupRef = useRef();

  /* slow auto-rotation + gentle float */
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = clock.getElapsedTime() * 0.3;
    groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.8) * 0.04;
  });

  const colors = PALETTES[palette] ?? PALETTES['rosa/pink'];
  const sizeScale = { S: 0.7, M: 0.9, L: 1.0, XL: 1.15 }[size] ?? 1.0;

  /* generate flower positions */
  const flowers = useMemo(() => {
    const list = [];
    const isRound = shape === 'round';
    const count   = isRound ? 22 : 18;

    for (let i = 0; i < count; i++) {
      const t     = i / count;
      const layer = Math.floor(t * 3); // 0=inner 1=mid 2=outer
      const angle = t * Math.PI * 2 * (isRound ? 3.2 : 2.8) + layer * 0.4;

      let r, y;
      if (isRound) {
        r = 0.12 + layer * 0.22;
        y = 0.3  - layer * 0.18;          // dome shape
      } else {
        r = 0.1  + layer * 0.18;
        y = 0.6  - layer * 0.28;          // taller shape
      }

      const scl = 0.55 + Math.random() * 0.2;
      const tilt = isRound
        ? -0.1 - layer * 0.25
        : -0.05 - layer * 0.18;

      list.push({
        x: Math.cos(angle) * r,
        y,
        z: Math.sin(angle) * r,
        color: colors[i % colors.length],
        scale: scl,
        tilt,
      });
    }
    return list;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shape, palette, size]);

  /* generate leaf positions */
  const leaves = useMemo(() => {
    const list = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const r = 0.42 + Math.random() * 0.12;
      list.push({
        x: Math.cos(angle) * r,
        y: -0.05 + Math.random() * 0.15,
        z: Math.sin(angle) * r,
        rx: -0.5 + Math.random() * 0.3,
        ry: angle,
        rz: 0,
      });
    }
    return list;
  }, []);

  return (
    <group ref={groupRef} scale={sizeScale}>
      {/* flowers */}
      {flowers.map((f, i) => (
        <Flower
          key={`${shape}-${palette}-${size}-${i}`}
          position={[f.x, f.y, f.z]}
          color={f.color}
          scale={f.scale}
          tilt={f.tilt}
        />
      ))}
      {/* leaves */}
      {leaves.map((l, i) => (
        <Leaf
          key={i}
          position={[l.x, l.y, l.z]}
          rotation={[l.rx, l.ry, l.rz]}
        />
      ))}
      {/* vase */}
      <Vase />
    </group>
  );
}

/* ─── exported Canvas wrapper ────────────────────────────────────── */
export default function BouquetScene({ shape, palette, size }) {
  return (
    <Canvas
      camera={{ position: [0, 0.6, 2.8], fov: 42 }}
      gl={{ antialias: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={1.2} />
      <directionalLight position={[3, 5, 3]} intensity={1.5} castShadow />
      <directionalLight position={[-3, 2, -2]} intensity={0.6} />
      <pointLight position={[0, 3, 0]} intensity={0.5} color="#fce4ef" />

      <Bouquet shape={shape} palette={palette} size={size} />

      {/* subtle platform */}
      <mesh position={[0, -1.38, 0]} receiveShadow>
        <cylinderGeometry args={[0.7, 0.7, 0.06, 40]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.7} />
      </mesh>

      <Environment preset="studio" />
      <OrbitControls
        enableZoom={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.8}
        enablePan={false}
      />
    </Canvas>
  );
}
