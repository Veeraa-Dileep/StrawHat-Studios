import { Suspense, cloneElement, useMemo, useRef, useEffect, useState, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { Environment, useGLTF } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { RapierRigidBody, RigidBody, Physics } from '@react-three/rapier'
import { Vector3 } from 'three'
import { DoubleSide, MeshPhysicalMaterial } from 'three'
import { lerp, Raf, addEventListener, scoped, vevet } from 'vevet'
import Scene3D from './Scene3D'

const MODEL_URL = '/models/model.glb'

// ---- Glass material (port of repo material.tsx; `dispersion` dropped — unsupported on three 0.160) ----
const glassMaterial = new MeshPhysicalMaterial({
  color: 0xf2f0eb,
  emissive: 0xff5a1f,
  emissiveIntensity: 0.05,
  reflectivity: 0.2,
  roughness: 0.1,
  metalness: 0.1,
  transparent: true,
  opacity: 0.7,
  transmission: 1,
  thickness: 0.6,
  ior: 1.4,
  side: DoubleSide,
})

// ---- Stable callback (port of useEvent) ----
function useEvent(callback) {
  const ref = useRef(callback)
  useEffect(() => {
    ref.current = callback
  }, [callback])
  return useCallback((...args) => ref.current?.(...args), [])
}

// ---- vevet-based smoothed vec3 driver (port of useAnimatableVec3) ----
function useAnimatableVec3(onUpdate, easeProp = 0.1, frictionProp = easeProp * 2.5) {
  const target = useRef(new Vector3(0, 0, 0))
  const current = useRef(new Vector3(0, 0, 0))
  const cb = useRef(onUpdate)
  cb.current = onUpdate

  useMemo(() => {
    const raf = new Raf()
    raf.play()
    raf.on('frame', () => {
      const ease = raf.lerpFactor(easeProp)
      const friction = raf.lerpFactor(frictionProp)
      target.current.x = lerp(target.current.x, 0, friction)
      target.current.y = lerp(target.current.y, 0, friction)
      target.current.z = lerp(target.current.z, 0, friction)
      current.current.x = lerp(current.current.x, target.current.x, ease)
      current.current.y = lerp(current.current.y, target.current.y, ease)
      current.current.z = lerp(current.current.z, target.current.z, ease)
      cb.current(current.current)
    })
    return () => raf.destroy()
  }, [easeProp, frictionProp])

  const iterateTarget = (v) => {
    target.current.x += v.x
    target.current.y += v.y
    target.current.z += v.z
  }
  return { iterateTarget }
}

// ---- Mouse-move delta (port of useMouseMoveDelta) ----
function useMouseMoveDelta(onUpdate) {
  const prev = useRef(new Vector3(NaN, NaN, 0))
  useMemo(() => {
    const off = addEventListener(window, 'mousemove', (evt) => {
      const x = scoped(evt.clientX, vevet.width / 2, vevet.width)
      const y = scoped(evt.clientY, vevet.height / 2, vevet.height)
      if (Number.isNaN(prev.current.x)) {
        prev.current.set(x, y, 0)
        return
      }
      const dx = x - prev.current.x
      const dy = y - prev.current.y
      prev.current.set(x, y, 0)
      onUpdate(new Vector3(dx, dy, 0))
    })
    return () => off()
  }, [onUpdate])
}

// ---- Device orientation (port of useDeviceOrientationDelta / useDeviceOrientationGranted) ----
let orientationGranted = false
let orientationListeners = []

function useDeviceOrientationGranted() {
  const [value, setValue] = useState(orientationGranted)
  const [needsPermission, setNeedsPermission] = useState(false)
  const request = useEvent(() => {
    if (!needsPermission) return
    window.DeviceOrientationEvent.requestPermission()
      .then((result) => {
        orientationGranted = result === 'granted'
        if (orientationGranted) orientationListeners.forEach((l) => l(orientationGranted))
      })
      .catch(() => setNeedsPermission(false))
  })
  useEffect(() => {
    const hasRequest =
      'DeviceOrientationEvent' in window &&
      typeof window.DeviceOrientationEvent.requestPermission === 'function'
    if (!hasRequest) {
      setValue(true)
      return undefined
    }
    if (orientationGranted) {
      setValue(true)
      setNeedsPermission(false)
      return undefined
    }
    setValue(false)
    setNeedsPermission(true)
    const listener = (next) => {
      setNeedsPermission(false)
      setValue(next)
    }
    orientationListeners.push(listener)
    return () => {
      orientationListeners = orientationListeners.filter((l) => l !== listener)
    }
  }, [])
  return { granted: value, needsPermission, request }
}

function useDeviceOrientationDelta(onUpdate) {
  const { granted } = useDeviceOrientationGranted()
  const prev = useRef({ alpha: 0, beta: 0, gamma: 0 })
  const handle = useEvent((evt) => {
    const a = evt.alpha || 0
    const g = evt.gamma || 0
    const b = evt.beta || 0
    const alphaDiff = a - prev.current.alpha
    const betaDiff = b - prev.current.beta
    const gammaDiff = g - prev.current.gamma
    prev.current = { alpha: a, beta: b, gamma: g }
    onUpdate({ alpha: alphaDiff, gamma: gammaDiff, beta: betaDiff })
  })
  useEffect(() => {
    if (!granted) return undefined
    window.addEventListener('deviceorientation', handle)
    return () => window.removeEventListener('deviceorientation', handle)
  }, [granted, handle])
}

// ---- Each glass shard: a Rapier body pulled toward origin (port of ModelRigidBody) ----
function GlassRigidBody({ children }) {
  const ref = useRef(null)
  const vec = useMemo(() => new Vector3(), [])
  useFrame(() => {
    const body = ref.current
    if (!body) return
    body.applyImpulse(vec.copy(body.translation()).negate().multiplyScalar(0.02), true)
  })
  return (
    <RigidBody
      ref={ref}
      lockRotations
      linearDamping={1}
      angularDamping={1}
      friction={1}
      restitution={0.5}
    >
      {cloneElement(children, { material: glassMaterial })}
    </RigidBody>
  )
}

// ---- Glass ball: render every mesh in the glb as a physics shard ----
function GlassBall() {
  const { nodes } = useGLTF(MODEL_URL)
  const meshes = useMemo(
    () => Object.values(nodes).filter((n) => n && n.geometry),
    [nodes]
  )
  return (
    <>
      {meshes.map((mesh, i) => (
        <GlassRigidBody key={mesh.uuid || i}>
          <mesh geometry={mesh.geometry} />
        </GlassRigidBody>
      ))}
    </>
  )
}

// ---- Pointer attractor (port of Pointer: outer invisible collider + inner visible grey) ----
function Pointer() {
  const bodyRef = useRef(null)
  const parallax = 1.5
  const { iterateTarget } = useAnimatableVec3(({ x, y }) => {
    bodyRef.current?.setNextKinematicTranslation(
      new Vector3(x * parallax, -y * parallax, 0)
    )
  })
  useMouseMoveDelta((v) => iterateTarget(v))
  useDeviceOrientationDelta(({ gamma, beta }) => {
    const strength = 0.05
    iterateTarget(new Vector3(gamma * strength, beta * strength, 0))
  })
  return (
    <RigidBody ref={bodyRef} type="kinematicPosition">
      <group>
        <mesh>
          <sphereGeometry args={[0.75, 32, 32]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color={0xff5a1f} emissive={0xff5a1f} emissiveIntensity={0.35} metalness={0} roughness={0.5} />
        </mesh>
      </group>
    </RigidBody>
  )
}

// ---- Scene: group reacts to mouse/screen/orientation via smoothed rotation+position ----
function GlassScene() {
  const groupRef = useRef(null)
  const rotation = Math.PI * 0.6

  const { iterateTarget: iteratePositionTarget } = useAnimatableVec3(({ x, y }) => {
    if (groupRef.current) groupRef.current.position.set(x, -y, 0)
  }, 0.02, 0.1)
  const { iterateTarget: iterateRotationTarget } = useAnimatableVec3(({ x, y, z }) => {
    if (groupRef.current)
      groupRef.current.rotation.set(y * rotation, x * rotation, z * rotation)
  }, 0.02, 0.1)

  useMouseMoveDelta((v) => {
    iteratePositionTarget(v)
    iterateRotationTarget(v)
  })
  useDeviceOrientationDelta(({ gamma, beta }) => {
    const rotationStrength = 0.05
    const rotationVector = new Vector3(gamma * rotationStrength, beta * rotationStrength, 0)
    const positionStrength = 0.075
    const positionVector = new Vector3(gamma * positionStrength, beta * positionStrength, 0)
    iterateRotationTarget(rotationVector)
    iteratePositionTarget(positionVector)
  })

  return (
    <>
      <Environment files="/env/warehouse.hdr" environmentIntensity={1} />
      <Physics gravity={[0, 0, 0]} colliders="hull">
        <group ref={groupRef} scale={1}>
          <Pointer />
          <GlassBall />
        </group>
      </Physics>
    </>
  )
}

export default function GlassBallScene() {
  return (
    <Scene3D camera={{ position: [0, 0, 5], fov: 60 }} style={{ pointerEvents: 'none' }}>
      <Suspense fallback={null}>
        <GlassScene />
      </Suspense>
      <EffectComposer disableNormalPass multisampling={0}>
        <Bloom intensity={0.1} luminanceThreshold={0.5} luminanceSmoothing={0.5} mipmapBlur />
      </EffectComposer>
    </Scene3D>
  )
}

useGLTF.preload(MODEL_URL)
