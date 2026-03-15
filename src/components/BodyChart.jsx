import { mn, P } from '../constants/theme'

export default function BodyChart({ data, dk = "kg", color = P, sx = "", height = 200, range = "month" }) {
  if (!data || data.length < 2) return (
    <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontSize: 13, fontFamily: mn }}>
      Trenger minst 2 punkt
    </div>
  )

  const v = data.map(d => d[dk])
  const dataMax = Math.max(...v)
  const dataMin = Math.min(...v)

  const rg = dataMax - dataMin || 1
  const pd = rg * 0.15
  const cMn = dataMin - pd
  const cRg = dataMax + pd - cMn

  const toY = val => 100 - ((val - cMn) / cRg) * 100

  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = toY(d[dk])
    return `${x},${y}`
  }).join(" ")

  const gId = `bf-${dk}-${data.length}`

  function formatLabel(d) {
    const dt = new Date(d.date)
    if (range === "week") return ["S\u00f8", "Ma", "Ti", "On", "To", "Fr", "L\u00f8"][dt.getDay()]
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
      <div style={{ position: "absolute", left: 0, top: 0, fontSize: 10, color: "#666", fontFamily: mn }}>
        {dataMax.toFixed(1)}{sx}
      </div>
      <div style={{ position: "absolute", left: 0, bottom: 16, fontSize: 10, color: "#666", fontFamily: mn }}>
        {dataMin.toFixed(1)}{sx}
      </div>

      <svg viewBox="-2 -5 104 115" style={{ width: "100%", height: "100%", overflow: "visible" }} preserveAspectRatio="none">
        <defs>
          <linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        <polygon points={`0,100 ${pts} 100,100`} fill={`url(#${gId})`} />

        <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />

        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 100
          const y = toY(d[dk])
          return <circle key={i} cx={x} cy={y} r="1.8" fill={color} stroke="#0a0a0f" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        })}
      </svg>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#555", fontFamily: mn }}>
        {labelPoints.map((d, i) => <span key={i}>{formatLabel(d)}</span>)}
      </div>
    </div>
  )
}
