let _webgl = null

/**
 * Detect real WebGL support via a throwaway context. Cached after first call.
 * Prefers webgl2, falls back to webgl/experimental-webgl.
 */
export function supportsWebGL() {
  if (_webgl !== null) return _webgl
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    _webgl = !!gl
    // Release the context immediately.
    if (gl && gl.getExtension) {
      const lose = gl.getExtension('WEBGL_lose_context')
      if (lose) lose.loseContext()
    }
  } catch {
    _webgl = false
  }
  return _webgl
}

/**
 * Single-source decision for whether to mount a real Three.js/R3F scene.
 * Guards on: WebGL, no reduced-motion, no Save-Data, adequate memory (when
 * exposed), and a desktop-class viewport. Everything else falls back to 2D.
 */
export function canRender3D() {
  if (typeof window === 'undefined') return false
  if (!supportsWebGL()) return false

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) return false

  const wide = window.matchMedia('(min-width: 1024px)').matches
  if (!wide) return false

  const conn = navigator.connection
  if (conn && conn.saveData) return false

  // deviceMemory is only exposed by some browsers; when present, require >= 4GB.
  const mem = navigator.deviceMemory
  if (typeof mem === 'number' && mem < 4) return false

  return true
}
