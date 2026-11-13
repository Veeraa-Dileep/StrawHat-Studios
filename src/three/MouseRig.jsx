import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'

/**
 * Subtle pointer-driven camera parallax. The camera eases toward a small
 * offset based on the normalized pointer, then the group looks at origin.
 * Damped in useFrame (no listeners) so it stays cheap and smooth.
 */
export default function MouseRig({ strength = 0.6, children }) {
  const group = useRef(null)
  const { camera, pointer } = useThree()

  useFrame((_, delta) => {
    const t = Math.min(1, delta * 3)
    camera.position.x += (pointer.x * strength - camera.position.x) * t
    camera.position.y += (pointer.y * strength - camera.position.y) * t
    camera.lookAt(0, 0, 0)
  })

  return <group ref={group}>{children}</group>
}
