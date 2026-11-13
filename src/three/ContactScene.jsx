import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sparkles } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import Scene3D from './Scene3D'
import Lights from './Lights'
import MouseRig from './MouseRig'

/** Animated holographic sphere: slow distort + wireframe shell + rotation. */
function HoloSphere() {
  const solid = useRef(null)
  const wire = useRef(null)
  useFrame((_, delta) => {
    if (solid.current) solid.current.rotation.y += delta * 0.12
    if (wire.current) {
      wire.current.rotation.y -= delta * 0.08
      wire.current.rotation.x += delta * 0.04
    }
  })
  return (
    <Float speed={1} rotationIntensity={0.3} floatIntensity={0.6}>
      <group scale={1.8}>
        <mesh ref={solid}>
          <icosahedronGeometry args={[1, 8]} />
          <MeshDistortMaterial
            color="#ff5a1f"
            emissive="#ff5a1f"
            emissiveIntensity={0.25}
            roughness={0.3}
            metalness={0.6}
            distort={0.35}
            speed={1.5}
            transparent
            opacity={0.55}
          />
        </mesh>
        <mesh ref={wire} scale={1.12}>
          <icosahedronGeometry args={[1, 2]} />
          <meshBasicMaterial color="#ffb38f" wireframe transparent opacity={0.18} />
        </mesh>
      </group>
    </Float>
  )
}

export default function ContactScene() {
  return (
    <Scene3D camera={{ position: [0, 0, 6.5], fov: 40 }}>
      <Lights intensity={0.9} />
      <MouseRig strength={0.35}>
        <HoloSphere />
        <Sparkles count={30} scale={9} size={2} speed={0.25} opacity={0.4} color="#ff9a6a" />
      </MouseRig>
      <EffectComposer disableNormalPass multisampling={0}>
        <Bloom intensity={0.8} luminanceThreshold={0.2} luminanceSmoothing={0.4} mipmapBlur />
      </EffectComposer>
    </Scene3D>
  )
}
