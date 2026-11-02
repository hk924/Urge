import { useState, useEffect } from 'react'
import { BG2, BD, TM, TL, TX, P, mn } from '../constants/theme'

// Start/end photos that alternate like a flip-book, plus numbered steps.
export function ExerciseImages({ ex, height = 190 }) {
  const [frame, setFrame] = useState(0)
  const imgs = ex?.images || []
  useEffect(() => {
    setFrame(0)
    if (imgs.length < 2) return
    const t = setInterval(() => setFrame(f => (f + 1) % imgs.length), 1400)
    return () => clearInterval(t)
  }, [ex?.id])

  if (!imgs.length) return (
    <div style={{ height: 80, borderRadius: 16, border: `1px dashed ${BD}`, display: "flex", alignItems: "center", justifyContent: "center", color: TL, fontFamily: mn, fontSize: 11 }}>
      Ingen illustrasjon
    </div>
  )
  return (
    <div style={{ position: "relative", height, borderRadius: 16, overflow: "hidden", backgroundColor: "#fff", border: `1px solid ${BD}` }}>
      {imgs.map((src, i) =>
        <img key={src} src={src} alt={`${ex.name} ${i === 0 ? "start" : "slutt"}`} loading="lazy"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", opacity: frame === i ? 1 : 0, transition: "opacity 0.35s" }} />
      )}
      {imgs.length > 1 && <div style={{ position: "absolute", bottom: 8, right: 10, display: "flex", gap: 4 }}>
        {imgs.map((_, i) => <div key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: frame === i ? P : "rgba(0,0,0,0.2)" }} />)}
      </div>}
    </div>
  )
}

export function ExerciseSteps({ ex, collapsible = true }) {
  const [open, setOpen] = useState(!collapsible)
  if (!ex?.steps?.length) return null
  return (
    <div style={{ marginTop: 12 }}>
      {collapsible && <button onClick={() => setOpen(o => !o)} style={{ background: "none", border: "none", padding: 0, color: TM, fontFamily: mn, fontSize: 12, cursor: "pointer" }}>
        {open ? "Skjul instruksjon" : "Vis instruksjon"}
      </button>}
      {open && <ol style={{ margin: "10px 0 0", padding: 0, listStyle: "none" }}>
        {ex.steps.map((s, i) =>
          <li key={i} style={{ display: "flex", gap: 10, marginBottom: 8, fontSize: 14, lineHeight: 1.45, color: TX }}>
            <span style={{ flexShrink: 0, width: 20, height: 20, borderRadius: 10, backgroundColor: BG2, border: `1px solid ${BD}`, color: TM, fontFamily: mn, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
            <span>{s}</span>
          </li>
        )}
      </ol>}
    </div>
  )
}
