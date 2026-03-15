import { mn, P, AC, TL } from '../constants/theme'
import { fds } from '../utils/helpers'

export default function BodyChart({ data, dk = "kg", color = P, sx = "", milestones = [], targetWeight, height = 200, range = "month" }) {
  if (!data || data.length < 2) return (
    <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontSize: 13, fontFamily: mn }}>
      Trenger minst 2 punkt
    </div>
  )

  const v = data.map(d => d[dk])
  const dataMax = Math.max(...v)
  const dataMin = Math.min(...v)

  // Expand range to include milestones and target weight when showing kg
  let rangeMin = dataMin
  let rangeMax = dataMax
  if (dk === "kg") {
    if (targetWeight != null) {
      rangeMin = Math.min(rangeMin, targetWeight)
      rangeMax = Math.max(rangeMax, targetWeight)
    }
    milestones.forEach(m => {
      rangeMin = Math.min(rangeMin, m.target)
      rangeMax = Math.max(rangeMax, m.target)
    })
  }

  const rg = rangeMax - rangeMin || 1
  const pd = rg * 0.15
  const cMn = rangeMin - pd
  const cRg = rangeMax + pd - cMn

  const toY = val => 100 - ((val - cMn) / cRg) * 100

  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = toY(d[dk])
    return `${x},${y}`
  }).join(" ")

  const gId = `bf-${dk}-${data.length}`

  // Date label formatting based on range
  function formatLabel(d) {
    const dt = new Date(d.date)
    if (range === "week") return ["Sø", "Ma", "Ti", "On", "To", "Fr", "Lø"][dt.getDay()]
    if (range === "month") return dt.getDate() + "/" + (dt.getMonth() + 1)
    if (range === "quarter") return ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"][dt.getMonth()]
    return dt.getFullYear() + "-" + String(dt.getMonth() + 1).padStart(2, "0")
  }

  const labelPoints = data.length <= 6
    ? data
    : data.length <= 12
      ? [data[0], data[Math.floor(data.length / 3)], data[Math.floor(data.length * 2 / 3)], data[data.length - 1]]
      : [data[0], data[Math.floor(data.length / 2)], data[data.length - 1]]

  return (
    <div style={{ position: "relative", width: "100%", height, marginTop: 8 }}>
      {/* Y-axis labels */}
      <div style={{ position: "absolute", left: 0, top: 0, fontSize: 10, color: "#666", fontFamily: mn }}>
        {rangeMax.toFixed(1)}{sx}
      </div>
      <div style={{ position: "absolute", left: 0, bottom: 16, fontSize: 10, color: "#666", fontFamily: mn }}>
        {rangeMin.toFixed(1)}{sx}
      </div>

      <svg viewBox="-2 -5 104 115" style={{ width: "100%", height: "100%", overflow: "visible" }} preserveAspectRatio="none">
        <defs>
          <linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Milestone lines (dashed purple) - only for kg */}
        {dk === "kg" && milestones.map((m, i) => {
          const y = toY(m.target)
          if (y < -5 || y > 105) return null
          return (
            <line key={`ms-${i}`} x1="0" y1={y} x2="100" y2={y}
              stroke={P} strokeWidth="1" strokeDasharray="3,3"
              vectorEffect="non-scaling-stroke" opacity="0.5" />
          )
        })}

        {/* Target weight line (dashed green) - only for kg */}
        {dk === "kg" && targetWeight != null && (() => {
          const y = toY(targetWeight)
          if (y < -5 || y > 105) return null
          return (
            <line x1="0" y1={y} x2="100" y2={y}
              stroke={AC} strokeWidth="1.5" strokeDasharray="4,3"
              vectorEffect="non-scaling-stroke" opacity="0.7" />
          )
        })()}

        {/* Area fill */}
        <polygon points={`0,100 ${pts} 100,100`} fill={`url(#${gId})`} />

        {/* Line */}
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />

        {/* Data points */}
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 100
          const y = toY(d[dk])
          return <circle key={i} cx={x} cy={y} r="3" fill={color} stroke="#0a0a0f" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        })}
      </svg>

      {/* Milestone labels on the right */}
      {dk === "kg" && (milestones.length > 0 || targetWeight != null) && (
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 16, pointerEvents: "none" }}>
          {milestones.map((m, i) => {
            const pct = ((m.target - cMn) / cRg) * 100
            if (pct < 0 || pct > 100) return null
            return (
              <div key={`ml-${i}`} style={{
                position: "absolute", right: 0, bottom: `${pct}%`, transform: "translateY(50%)",
                fontSize: 8, fontFamily: mn, color: P, opacity: 0.7, whiteSpace: "nowrap"
              }}>{m.target}kg</div>
            )
          })}
          {targetWeight != null && (() => {
            const pct = ((targetWeight - cMn) / cRg) * 100
            if (pct < 0 || pct > 100) return null
            return (
              <div style={{
                position: "absolute", right: 0, bottom: `${pct}%`, transform: "translateY(50%)",
                fontSize: 8, fontFamily: mn, color: AC, opacity: 0.9, whiteSpace: "nowrap", fontWeight: 600
              }}>Mål</div>
            )
          })()}
        </div>
      )}

      {/* Date labels */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#555", fontFamily: mn }}>
        {labelPoints.map((d, i) => <span key={i}>{formatLabel(d)}</span>)}
      </div>
    </div>
  )
}
