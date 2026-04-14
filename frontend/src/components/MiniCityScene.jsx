import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrthographicCamera, OrbitControls, Edges } from '@react-three/drei';

function PalletRack({ position }) {
  return (
    <group position={position}>
      {/* Rack structure */}
      <mesh position={[0, 2, 0]} castShadow>
        <boxGeometry args={[4, 4, 1.2]} />
        <meshStandardMaterial color="#222" metalness={0.8} />
        <Edges color="#444" />
      </mesh>
      
      {/* 4 Shelves */}
      {[0.5, 1.5, 2.5, 3.5].map((y, i) => (
        <mesh key={`shelf-${i}`} position={[0, y, 0.1]} castShadow receiveShadow>
          <boxGeometry args={[3.8, 0.1, 1]} />
          <meshStandardMaterial color="#3a3a3a" />
        </mesh>
      ))}
      
      {/* Random colorful boxes on shelves */}
      <mesh position={[-1.2, 0.8, 0.1]} castShadow><boxGeometry args={[0.8, 0.5, 0.8]} /><meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.2} /></mesh>
      <mesh position={[1, 0.8, 0.1]} castShadow><boxGeometry args={[1, 0.5, 0.8]} /><meshStandardMaterial color="#555" /></mesh>
      
      <mesh position={[0, 1.8, 0.1]} castShadow><boxGeometry args={[1.5, 0.5, 0.8]} /><meshStandardMaterial color="#c084fc" emissive="#c084fc" emissiveIntensity={0.4} /></mesh>
      
      <mesh position={[-1.2, 2.8, 0.1]} castShadow><boxGeometry args={[0.6, 0.4, 0.6]} /><meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.3} /></mesh>
      <mesh position={[0.5, 2.8, 0.1]} castShadow><boxGeometry args={[0.8, 0.4, 0.6]} /><meshStandardMaterial color="#333" /></mesh>
      <mesh position={[1.4, 2.8, 0.1]} castShadow><boxGeometry args={[0.6, 0.4, 0.6]} /><meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.2} /></mesh>

      <mesh position={[-0.5, 3.8, 0.1]} castShadow><boxGeometry args={[1.8, 0.4, 0.8]} /><meshStandardMaterial color="#c084fc" emissive="#c084fc" emissiveIntensity={0.2} /></mesh>
    </group>
  );
}

function AGV({ position, axis = 'z', speed = 2, range = 4, delay = 0, color = "#c084fc" }) {
  const group = useRef();
  
  useFrame((state) => {
     const offset = Math.sin(state.clock.elapsedTime * speed + delay) * range;
     if (axis === 'z') group.current.position.z = position[2] + offset;
     if (axis === 'x') group.current.position.x = position[0] + offset;
  });
  
  return (
    <group ref={group} position={position}>
      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[1.2, 0.4, 1.5]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.1, 16]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={2} />
      </mesh>
      {/* Random parcel */}
      <mesh position={[0, 0.7, 0]} castShadow>
         <boxGeometry args={[0.8, 0.6, 0.8]} />
         <meshStandardMaterial color="#333" />
         <Edges color="#22d3ee" />
      </mesh>
    </group>
  );
}

function ConveyorBelt({ position, length = 10 }) {
  const boxes = useRef();

  useFrame((state) => {
    // Move boxes along the conveyor belt uniformly
    const time = state.clock.elapsedTime * 2;
    boxes.current.children.forEach((box, i) => {
      const zOffset = ((time + i * 2) % length) - length / 2;
      box.position.z = zOffset;
    });
  });

  return (
    <group position={position}>
      {/* Belt Structure */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 1.2, length]} />
        <meshStandardMaterial color="#1a1a1a" />
        <Edges color="#333" />
      </mesh>
      
      {/* Moving Boxes Container */}
      <group ref={boxes} position={[0, 1.4, 0]}>
        {[...Array(5)].map((_, i) => (
          <mesh key={i} castShadow>
            <boxGeometry args={[0.8, 0.6, 0.8]} />
            <meshStandardMaterial color={i % 2 === 0 ? "#22d3ee" : "#c084fc"} emissive={i % 2 === 0 ? "#22d3ee" : "#c084fc"} emissiveIntensity={0.2} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function FlyingDrone({ position, orbitSpeed = 1, radius = 5, offset = 0 }) {
  const group = useRef();
  
  useFrame((state) => {
    const t = state.clock.elapsedTime * orbitSpeed + offset;
    group.current.position.x = position[0] + Math.cos(t) * radius;
    group.current.position.z = position[2] + Math.sin(t) * radius;
    group.current.position.y = position[1] + Math.sin(t * 4) * 0.5; // Hovering bounce
    group.current.rotation.y = -t; // Face direction of travel
  });

  return (
    <group ref={group} position={position}>
       {/* Drone Body */}
       <mesh position={[0, 0, 0]} castShadow>
         <boxGeometry args={[0.8, 0.2, 0.8]} />
         <meshStandardMaterial color="#111" />
       </mesh>
       {/* High-tech glowing core */}
       <mesh position={[0, -0.1, 0]}>
         <sphereGeometry args={[0.2, 16, 16]} />
         <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={2} />
       </mesh>
       {/* Rotors */}
       <mesh position={[0.5, 0.1, 0.5]}><boxGeometry args={[0.4, 0.05, 0.1]} /><meshStandardMaterial color="#c084fc" /></mesh>
       <mesh position={[-0.5, 0.1, 0.5]}><boxGeometry args={[0.4, 0.05, 0.1]} /><meshStandardMaterial color="#c084fc" /></mesh>
       <mesh position={[0.5, 0.1, -0.5]}><boxGeometry args={[0.4, 0.05, 0.1]} /><meshStandardMaterial color="#c084fc" /></mesh>
       <mesh position={[-0.5, 0.1, -0.5]}><boxGeometry args={[0.4, 0.05, 0.1]} /><meshStandardMaterial color="#c084fc" /></mesh>
    </group>
  );
}

function ControlMezzanine({ position }) {
  return (
    <group position={position}>
      {/* Elevated Platform */}
      <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[6, 0.2, 4]} />
        <meshStandardMaterial color="#222" />
        <Edges color="#22d3ee" opacity={0.5} transparent />
      </mesh>
      
      {/* Pillars */}
      <mesh position={[2.8, 1.25, 1.8]} castShadow><boxGeometry args={[0.2, 2.5, 0.2]} /><meshStandardMaterial color="#111" /></mesh>
      <mesh position={[-2.8, 1.25, 1.8]} castShadow><boxGeometry args={[0.2, 2.5, 0.2]} /><meshStandardMaterial color="#111" /></mesh>
      <mesh position={[2.8, 1.25, -1.8]} castShadow><boxGeometry args={[0.2, 2.5, 0.2]} /><meshStandardMaterial color="#111" /></mesh>
      <mesh position={[-2.8, 1.25, -1.8]} castShadow><boxGeometry args={[0.2, 2.5, 0.2]} /><meshStandardMaterial color="#111" /></mesh>
      
      {/* Big Dispatch Screens */}
      <group position={[0, 3.5, -1.9]}>
        <mesh>
          <boxGeometry args={[3, 1.5, 0.1]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0, 0, 0.06]}>
          <boxGeometry args={[2.8, 1.3, 0.01]} />
          <meshStandardMaterial color="#c084fc" emissive="#c084fc" emissiveIntensity={0.8} />
        </mesh>
      </group>
      
      {/* Desks */}
      <mesh position={[0, 3, -1]} castShadow>
        <boxGeometry args={[4, 0.8, 0.8]} />
        <meshStandardMaterial color="#111" />
      </mesh>
    </group>
  );
}

function WarehouseLayout() {
  const group = useRef();
  
  // Entire floor slowly bobs
  useFrame((state) => {
     group.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
  });

  return (
    <group ref={group} rotation={[0, -Math.PI / 4, 0]}>
      {/* Massive Floor Base */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[26, 1, 26]} />
        <meshStandardMaterial color="#111" />
        <Edges color="#22d3ee" opacity={0.3} transparent />
      </mesh>

      {/* Vast Industrial Grid */}
      <gridHelper args={[26, 26, '#333', '#151515']} position={[0, 0.01, 0]} />

      {/* Left Storage Sector (Aisles) */}
      <PalletRack position={[-8, 0, -8]} />
      <PalletRack position={[-8, 0, -3]} />
      <PalletRack position={[-8, 0, 2]} />
      <PalletRack position={[-8, 0, 7]} />

      <PalletRack position={[-3, 0, -8]} />
      <PalletRack position={[-3, 0, -3]} />
      <PalletRack position={[-3, 0, 2]} />
      <PalletRack position={[-3, 0, 7]} />

      {/* Central AGV Highway */}
      {/* AGVs moving up and down the main aisles */}
      <AGV position={[-5.5, 0, 0]} axis="z" speed={1.5} range={8} delay={0} color="#c084fc" />
      <AGV position={[-0.5, 0, 0]} axis="z" speed={2} range={8} delay={3} color="#22d3ee" />
      <AGV position={[4.5, 0, -4]} axis="x" speed={1} range={6} delay={1.5} color="#10b981" />

      {/* Right Processing Sector */}
      <ConveyorBelt position={[8, 0, 0]} length={18} />
      
      {/* Raised Fleet Control Mezzanine */}
      <ControlMezzanine position={[3, 0, 8]} />

      {/* Multiple Drop-off / Dispatch Zones */}
      <group position={[10, 0.05, 10]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2, 2.5, 32]} />
          <meshBasicMaterial color="#c084fc" transparent opacity={0.8} />
        </mesh>
        <mesh position={[0, 3, 0]}>
           <cylinderGeometry args={[2.5, 2.5, 6, 32]} />
           <meshBasicMaterial color="#c084fc" transparent opacity={0.15} />
        </mesh>
      </group>
      
      <group position={[2, 0.05, -10]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 2, 32]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.8} />
        </mesh>
        <mesh position={[0, 2, 0]}>
           <cylinderGeometry args={[2, 2, 4, 32]} />
           <meshBasicMaterial color="#22d3ee" transparent opacity={0.15} />
        </mesh>
      </group>

      {/* Aerial Elements */}
      <FlyingDrone position={[0, 8, 0]} orbitSpeed={0.5} radius={10} offset={0} />
      <FlyingDrone position={[0, 10, 0]} orbitSpeed={0.8} radius={6} offset={Math.PI} />

      {/* High Warehouse Walls (Background) */}
      <mesh position={[0, 2, -13.5]} castShadow receiveShadow>
         <boxGeometry args={[26, 5, 1]} />
         <meshStandardMaterial color="#1a1a1a" />
         <Edges color="#333" />
      </mesh>
      <mesh position={[-13.5, 2, 0]} castShadow receiveShadow>
         <boxGeometry args={[1, 5, 26]} />
         <meshStandardMaterial color="#1a1a1a" />
         <Edges color="#333" />
      </mesh>
      
    </group>
  );
}

export default function MiniCityScene() {
  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas shadows>
        {/* Soft Ambient Setting */}
        <ambientLight intensity={0.4} />
        
        {/* Main Ceiling Light Bank */}
        <directionalLight 
          position={[20, 40, 20]} 
          intensity={1.2} 
          color="#ffffff" 
          castShadow 
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={100}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
          shadow-bias={-0.0001}
        />
        
        {/* Thematic Fill Lights matching CustomerForm (Cyan & Purple) */}
        <directionalLight position={[-20, 20, -20]} intensity={1.5} color="#22d3ee" />
        <directionalLight position={[20, 5, 20]} intensity={1} color="#c084fc" />
        
        {/* Adjusted Camera for larger scene */}
        <OrthographicCamera makeDefault position={[-40, 40, 40]} zoom={20} near={-200} far={200} />
        
        <OrbitControls 
          enableZoom={true} 
          enablePan={false}
          autoRotate={true}
          autoRotateSpeed={0.4}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.5}
          maxZoom={30}
          minZoom={8}
        />
        
        <WarehouseLayout />
      </Canvas>
    </div>
  );
}
