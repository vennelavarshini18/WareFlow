import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const SCALE = 100 / 15

const STATUS_COLORS = {
  moving:       { color: '#ffffff', emissive: '#003366', light: '#00FFFF' },
  collided:     { color: '#ffffff', emissive: '#330000', light: '#FF0000' },
  reached_goal: { color: '#ffffff', emissive: '#003300', light: '#00FF00' },
}

export default function Agent({ x, y, status }) {
  const groupRef = useRef()
  const headRef = useRef()
  const currentPos = useRef(new THREE.Vector3(x * SCALE, 0, y * SCALE))
  const prevPos = useRef(new THREE.Vector3(x * SCALE, 0, y * SCALE))
  const currentAngle = useRef(0)

  const targetPos = useMemo(
    () => new THREE.Vector3(x * SCALE, 0, y * SCALE),
    [x, y]
  )

  const colors = STATUS_COLORS[status] || STATUS_COLORS.moving

  useFrame(({ clock }) => {
    if (!groupRef.current) return

    const oldX = currentPos.current.x
    const oldZ = currentPos.current.z

    currentPos.current.lerp(targetPos, 0.15)
    groupRef.current.position.copy(currentPos.current)
    
    // Floating bounce effect
    groupRef.current.position.y = Math.sin(clock.elapsedTime * 3) * 0.3

    const dx = currentPos.current.x - oldX
    const dz = currentPos.current.z - oldZ
    if (Math.abs(dx) > 0.001 || Math.abs(dz) > 0.001) {
      const targetAngle = Math.atan2(dx, dz)
      currentAngle.current += (targetAngle - currentAngle.current) * 0.1
      groupRef.current.rotation.y = currentAngle.current

      // Lean into the movement
      groupRef.current.rotation.x = -0.1
    } else {
      // Stand up straight
      groupRef.current.rotation.x *= 0.95
    }

    // Slight head bob/turn
    if (headRef.current) {
      headRef.current.position.y = 2.4 + Math.sin(clock.elapsedTime * 4) * 0.05
      headRef.current.rotation.y = Math.sin(clock.elapsedTime * 2) * 0.1
    }

    prevPos.current.copy(currentPos.current)
  })

  return (
    <group ref={groupRef} position={[x * SCALE, 0, y * SCALE]} scale={1.8}>
      {/* ── ROBOT MASCOT (Hovering) ── */}
      <group position={[0, 1.5, 0]}>
        
        {/* Head */}
        <group ref={headRef} position={[0, 2.4, 0]}>
          <mesh castShadow position={[0, 0, 0]}>
            <sphereGeometry args={[1.5, 32, 32]} />
            <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.2} />
          </mesh>
          
          {/* Black Visor */}
          <mesh position={[0, 0.1, 0.4]}>
            <sphereGeometry args={[1.4, 32, 32]} />
            <meshStandardMaterial color="#0a0a0a" roughness={0.1} metalness={0.6} />
          </mesh>

          {/* Glowing Eyes */}
          <mesh position={[-0.5, 0.3, 1.65]} rotation={[0, -0.2, 0.1]}>
            <capsuleGeometry args={[0.15, 0.3, 16, 16]} />
            <meshStandardMaterial color={colors.light} emissive={colors.light} emissiveIntensity={3} />
          </mesh>
          <mesh position={[0.5, 0.3, 1.65]} rotation={[0, 0.2, -0.1]}>
            <capsuleGeometry args={[0.15, 0.3, 16, 16]} />
            <meshStandardMaterial color={colors.light} emissive={colors.light} emissiveIntensity={3} />
          </mesh>

          {/* Side Earpieces */}
          <mesh position={[-1.4, 0, 0]} rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.3, 0.4, 0.5, 16]} />
            <meshStandardMaterial color="#ffffff" roughness={0.2} />
          </mesh>
          <mesh position={[-1.7, 0, 0]} rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.2, 0.2, 0.2, 16]} />
            <meshStandardMaterial color={colors.light} emissive={colors.light} emissiveIntensity={1} />
          </mesh>
          <mesh position={[1.4, 0, 0]} rotation={[0, 0, -Math.PI/2]}>
            <cylinderGeometry args={[0.3, 0.4, 0.5, 16]} />
            <meshStandardMaterial color="#ffffff" roughness={0.2} />
          </mesh>
          <mesh position={[1.7, 0, 0]} rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.2, 0.2, 0.2, 16]} />
            <meshStandardMaterial color={colors.light} emissive={colors.light} emissiveIntensity={1} />
          </mesh>
        </group>

        {/* Torso */}
        <mesh position={[0, -0.3, 0]} castShadow>
          <cylinderGeometry args={[1.5, 0.8, 2.5, 32]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.2} />
        </mesh>
        {/* Soft bottom of torso */}
        <mesh position={[0, -1.55, 0]}>
          <sphereGeometry args={[0.8, 32, 16, 0, Math.PI*2, Math.PI/2, Math.PI/2]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.2} />
        </mesh>
        
        {/* Glowing Chest Diamond */}
        <mesh position={[0, 0.1, 1.4]} rotation={[0, 0, Math.PI/4]}>
          <boxGeometry args={[0.4, 0.4, 0.2]} />
          <meshStandardMaterial color={colors.light} emissive={colors.light} emissiveIntensity={3} />
        </mesh>
        
        {/* Glowing Belt Strip */}
        <mesh position={[0, -1.0, 0]}>
          <cylinderGeometry args={[1.05, 1.05, 0.15, 32]} />
          <meshStandardMaterial color={colors.light} emissive={colors.light} emissiveIntensity={2} />
        </mesh>
        
        {/* Floating Arms */}
        <mesh position={[-1.8, 0, 0]} rotation={[0, 0, -0.2]}>
          <capsuleGeometry args={[0.3, 1.2, 16, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.2} />
        </mesh>
        <mesh position={[1.8, 0, 0]} rotation={[0, 0, 0.2]}>
          <capsuleGeometry args={[0.3, 1.2, 16, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.2} />
        </mesh>

        {/* Underside hover glow */}
        <pointLight position={[0, -2.5, 0]} color={colors.light} intensity={3} distance={8} />
      </group>

      {/* ── PURPLE SHOPPING CART (Floating Ahead) ── */}
      <group position={[0, 0, 4.0]}>
        
        {/* Cart Basket */}
        <mesh position={[0, 2.5, 0.5]} castShadow>
          <boxGeometry args={[3.2, 1.8, 4.5]} />
          <meshStandardMaterial color="#8A2BE2" roughness={0.2} metalness={0.1} />
        </mesh>
        {/* Inner shadow/hollowing trick - just a slightly darker smaller box inside */}
        <mesh position={[0, 2.7, 0.5]}>
          <boxGeometry args={[3.0, 1.8, 4.3]} />
          <meshStandardMaterial color="#5e15a3" roughness={0.5} />
        </mesh>
        
        {/* Cart Frame (Silver lines) */}
        {/* Bottom rods */}
        <mesh position={[-1.2, 1.0, 0.5]} rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 4.0, 16]} />
          <meshStandardMaterial color="#dddddd" roughness={0.4} metalness={0.8} />
        </mesh>
        <mesh position={[1.2, 1.0, 0.5]} rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 4.0, 16]} />
          <meshStandardMaterial color="#dddddd" roughness={0.4} metalness={0.8} />
        </mesh>
        
        {/* Vertical frame supports */}
        <mesh position={[-1.2, 1.5, -1.0]}>
          <cylinderGeometry args={[0.12, 0.12, 1.5, 16]} />
          <meshStandardMaterial color="#dddddd" roughness={0.4} metalness={0.8} />
        </mesh>
        <mesh position={[1.2, 1.5, -1.0]}>
          <cylinderGeometry args={[0.12, 0.12, 1.5, 16]} />
          <meshStandardMaterial color="#dddddd" roughness={0.4} metalness={0.8} />
        </mesh>
        <mesh position={[-1.2, 1.5, 2.0]}>
          <cylinderGeometry args={[0.12, 0.12, 1.5, 16]} />
          <meshStandardMaterial color="#dddddd" roughness={0.4} metalness={0.8} />
        </mesh>
        <mesh position={[1.2, 1.5, 2.0]}>
          <cylinderGeometry args={[0.12, 0.12, 1.5, 16]} />
          <meshStandardMaterial color="#dddddd" roughness={0.4} metalness={0.8} />
        </mesh>
        
        {/* Cart Handle */}
        <mesh position={[-1.2, 3.8, -1.8]} rotation={[-0.4, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 1.5, 16]} />
          <meshStandardMaterial color="#dddddd" roughness={0.4} metalness={0.8} />
        </mesh>
        <mesh position={[1.2, 3.8, -1.8]} rotation={[-0.4, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 1.5, 16]} />
          <meshStandardMaterial color="#dddddd" roughness={0.4} metalness={0.8} />
        </mesh>
        <mesh position={[0, 4.3, -2.1]} rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.15, 0.15, 2.6, 16]} />
          <meshStandardMaterial color="#dddddd" roughness={0.3} metalness={0.9} />
        </mesh>

        {/* Wheels (Green edges, dark tires) */}
        {[
          [-1.2, 0.5, -1.0],
          [1.2, 0.5, -1.0],
          [-1.2, 0.5, 2.0],
          [1.2, 0.5, 2.0],
        ].map((pos, i) => (
          <group key={`wheel-${i}`} position={pos} rotation={[0, 0, Math.PI/2]}>
            {/* Tire */}
            <mesh castShadow>
              <cylinderGeometry args={[0.5, 0.5, 0.2, 24]} />
              <meshStandardMaterial color="#222222" roughness={0.9} />
            </mesh>
            {/* Green Hubcap */}
            <mesh position={[0, i % 2 === 0 ? -0.15 : 0.15, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 0.05, 24]} />
              <meshStandardMaterial color="#32CD32" roughness={0.5} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}
