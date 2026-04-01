'use client'

import { useRef, useState, useEffect, Suspense, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Text, OrbitControls, Float, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { oceanCreatures, type OceanCreature } from './data'

// 3D Letter Orb that floats in a spiral
function LetterOrb({
  creature,
  index,
  totalCount,
  isSelected,
  onSelect,
}: {
  creature: OceanCreature
  index: number
  totalCount: number
  isSelected: boolean
  onSelect: (creature: OceanCreature) => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const targetPosition = useRef(new THREE.Vector3())
  const [hovered, setHovered] = useState(false)

  // Spiral distribution in 3D space
  const angle = (index / totalCount) * Math.PI * 6 // 3 full spirals
  const radius = 4 + index * 0.12
  const yPos = (index / totalCount) * 6 - 3 // spread vertically from -3 to 3

  useFrame((state) => {
    if (!meshRef.current) return
    const time = state.clock.getElapsedTime()

    // Target position in spiral
    const targetX = Math.cos(angle + time * 0.08) * radius
    const targetY = yPos + Math.sin(time * 0.6 + index) * 0.25
    const targetZ = Math.sin(angle + time * 0.08) * radius

    targetPosition.current.set(targetX, targetY, targetZ)

    // Smooth lerp to target
    meshRef.current.position.lerp(targetPosition.current, 0.04)

    // Scale pulse when selected
    const targetScale = isSelected ? 1.4 : hovered ? 1.2 : 1
    meshRef.current.scale.setScalar(
      THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1)
    )
  })

  const baseColor = isSelected ? '#ffd93d' : hovered ? '#00b4d8' : '#ffffff'
  const emissiveColor = isSelected ? '#ff6b6b' : hovered ? '#00b4d8' : '#0077b6'

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onSelect(creature) }}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default' }}
        position={[Math.cos(angle) * radius, yPos, Math.sin(angle) * radius]}
      >
        {/* Outer glow sphere */}
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={emissiveColor}
          emissiveIntensity={isSelected ? 0.8 : hovered ? 0.5 : 0.2}
          transparent
          opacity={0.85}
          roughness={0.1}
          metalness={0.3}
        />
        {/* Inner bright core */}
        <mesh scale={[0.6, 0.6, 0.6]}>
          <sphereGeometry args={[0.55, 16, 16]} />
          <meshStandardMaterial
            color={isSelected ? '#ffd93d' : '#e0f7fa'}
            emissive={isSelected ? '#ffd93d' : '#00b4d8'}
            emissiveIntensity={0.6}
            transparent
            opacity={0.5}
          />
        </mesh>
        {/* Letter */}
        <Text
          position={[0, 0, 0.58]}
          fontSize={0.42}
          color={isSelected ? '#0a1628' : '#0a1628'}
          font="https://fonts.gstatic.com/s/quicksand/v15/7cHtv4Uyi5K0OeZ7bohU8H0JmBUhfrE.woff2"
          anchorX="center"
          anchorY="middle"
        >
          {creature.letter}
        </Text>
      </mesh>
    </Float>
  )
}

// Bubble particles
function Bubbles() {
  const count = 60
  const positions = new Float32Array(count * 3)
  const speeds = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 16
    positions[i * 3 + 1] = (Math.random() - 0.5) * 12
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 4
    speeds[i] = 0.005 + Math.random() * 0.015
  }

  const pointsRef = useRef<THREE.Points>(null)

  useFrame(() => {
    if (!pointsRef.current) return
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += speeds[i]
      if (pos[i * 3 + 1] > 8) {
        pos[i * 3 + 1] = -6
        pos[i * 3] = (Math.random() - 0.5) * 16
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#90e0ef"
        size={0.08}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}

// Camera animator — lerps camera when letter is selected
function CameraAnimator({ selectedCreature }: { selectedCreature: OceanCreature | null }) {
  const { camera } = useThree()
  const targetPos = useRef(new THREE.Vector3(0, 0, 10))
  const targetLook = useRef(new THREE.Vector3(0, 0, 0))

  useFrame(() => {
    if (selectedCreature) {
      const idx = oceanCreatures.indexOf(selectedCreature)
      const angle = (idx / oceanCreatures.length) * Math.PI * 6
      const radius = 4 + idx * 0.12
      const yPos = (idx / oceanCreatures.length) * 6 - 3

      targetPos.current.set(
        Math.cos(angle) * (radius + 2),
        yPos,
        Math.sin(angle) * (radius + 2) + 2
      )
      targetLook.current.set(
        Math.cos(angle) * radius,
        yPos,
        Math.sin(angle) * radius
      )
    } else {
      targetPos.current.set(0, 0, 10)
      targetLook.current.set(0, 0, 0)
    }

    camera.position.lerp(targetPos.current, 0.04)
    const currentLook = new THREE.Vector3()
    camera.getWorldDirection(currentLook)
    const newLook = new THREE.Vector3().lerpVectors(
      camera.position.clone().add(currentLook),
      targetLook.current,
      0.04
    )
    camera.lookAt(newLook)
  })

  return null
}

// Ocean floor
function OceanFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]}>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial
        color="#1a5c6b"
        transparent
        opacity={0.7}
      />
    </mesh>
  )
}

// Light rays
function LightRays() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.getElapsedTime() * 0.03
    }
  })
  return (
    <mesh ref={ref} position={[0, 6, -5]} rotation={[0, 0, 0]}>
      <cylinderGeometry args={[0.1, 3, 12, 8, 1, true]} />
      <meshBasicMaterial
        color="#00b4d8"
        transparent
        opacity={0.04}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

export function OceanScene({
  selectedCreature,
  onSelectCreature,
}: {
  selectedCreature: OceanCreature | null
  onSelectCreature: (creature: OceanCreature | null) => void
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 65 }}
      style={{ background: 'linear-gradient(180deg, #0d3b66 0%, #0a1628 60%, #061218 100%)' }}
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} color="#90e0ef" />
      <pointLight position={[0, 4, 2]} intensity={0.8} color="#00b4d8" />
      <pointLight position={[-4, -2, 4]} intensity={0.4} color="#0077b6" />

      <Sparkles count={40} scale={12} size={2} speed={0.3} color="#00b4d8" />

      <Bubbles />
      <LightRays />
      <OceanFloor />

      {oceanCreatures.map((creature, i) => (
        <LetterOrb
          key={creature.letter}
          creature={creature}
          index={i}
          totalCount={oceanCreatures.length}
          isSelected={selectedCreature?.letter === creature.letter}
          onSelect={onSelectCreature}
        />
      ))}

      <CameraAnimator selectedCreature={selectedCreature} />

      <OrbitControls
        enableZoom
        enablePan={false}
        minDistance={5}
        maxDistance={14}
        minPolarAngle={Math.PI * 0.2}
        maxPolarAngle={Math.PI * 0.75}
        autoRotate={!selectedCreature}
        autoRotateSpeed={0.4}
      />
    </Canvas>
  )
}
