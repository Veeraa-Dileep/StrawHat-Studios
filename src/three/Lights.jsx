/**
 * Soft three-point-ish lighting reused by scenes.
 * Warm key from upper-right, cool rim from lower-left, gentle ambient fill.
 * Accent color matches the brand (--accent #FF5A1F).
 */
export default function Lights({ intensity = 1 }) {
  return (
    <>
      <ambientLight intensity={0.5 * intensity} />
      <directionalLight position={[4, 5, 3]} intensity={2.2 * intensity} color="#fff3ec" />
      <pointLight position={[-5, -3, 2]} intensity={2.5 * intensity} color="#4f7cff" />
      <pointLight position={[3, -2, 4]} intensity={2 * intensity} color="#ff5a1f" />
    </>
  )
}
