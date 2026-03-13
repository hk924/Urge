import { useEffect, useRef } from 'react'

export default function Confetti({ active, onDone }) {
  const cr = useRef(null)
  const ar = useRef(null)

  useEffect(() => {
    if (!active || !cr.current) return
    const c = cr.current
    const x = c.getContext("2d")
    c.width = window.innerWidth
    c.height = window.innerHeight
    const cl = ["#7c5cfc", "#a78bfa", "#4ade80", "#fbbf24", "#f472b6", "#38bdf8"]
    const p = Array.from({ length: 60 }, () => ({
      x: Math.random() * c.width,
      y: -Math.random() * c.height,
      w: 4 + Math.random() * 6,
      h: 8 + Math.random() * 8,
      c: cl[Math.floor(Math.random() * cl.length)],
      vx: (Math.random() - .5) * 3,
      vy: 2 + Math.random() * 4,
      r: Math.random() * Math.PI * 2,
      vr: (Math.random() - .5) * .2,
      o: 1
    }))
    let f = 0
    function a() {
      x.clearRect(0, 0, c.width, c.height)
      f++
      p.forEach(i => {
        i.x += i.vx
        i.y += i.vy
        i.vy += .05
        i.r += i.vr
        if (f > 72) i.o = Math.max(0, 1 - (f - 72) / 48)
        x.save()
        x.translate(i.x, i.y)
        x.rotate(i.r)
        x.globalAlpha = i.o
        x.fillStyle = i.c
        x.fillRect(-i.w / 2, -i.h / 2, i.w, i.h)
        x.restore()
      })
      if (f < 120) ar.current = requestAnimationFrame(a)
      else { x.clearRect(0, 0, c.width, c.height); onDone && onDone() }
    }
    ar.current = requestAnimationFrame(a)
    return () => { ar.current && cancelAnimationFrame(ar.current) }
  }, [active, onDone])

  if (!active) return null
  return <canvas ref={cr} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 9999 }} />
}
