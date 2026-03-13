import { mn } from '../constants/theme'
import { fds } from '../utils/helpers'

export default function Chart({ data, dk = "v", color = "#7c5cfc", sx = "" }) {
  if (!data || data.length < 2) return (
    <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontSize: 13, fontFamily: mn }}>
      Trenger minst 2 punkt
    </div>
  )

  const v = data.map(d => d[dk])
  const mx = Math.max(...v)
  const mmn = Math.min(...v)
  const rg = mx - mmn || 1
  const pd = rg * .3
  const cMn = mmn - pd
  const cRg = mx + pd - cMn

  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 100 - ((d[dk] - cMn) / cRg) * 100
    return `${x},${y}`
  }).join(" ")

  return (
    <div style={{ position: "relative", width: "100%", height: 120, marginTop: 8 }}>
      <div style={{ position: "absolute", left: 0, top: 0, fontSize: 10, color: "#666", fontFamily: mn }}>{mx.toFixed(1)}{sx}</div>
      <div style={{ position: "absolute", left: 0, bottom: 16, fontSize: 10, color: "#666", fontFamily: mn }}>{mmn.toFixed(1)}{sx}</div>
      <svg viewBox="-2 -5 104 115" style={{ width: "100%", height: "100%", overflow: "visible" }} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`f-${dk}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,100 ${pts} 100,100`} fill={`url(#f-${dk})`} />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 100
          const y = 100 - ((d[dk] - cMn) / cRg) * 100
          return <circle key={i} cx={x} cy={y} r="3" fill={color} stroke="#0a0a0f" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        })}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#555", fontFamily: mn }}>
        {(data.length <= 6 ? data : [data[0], data[Math.floor(data.length / 2)], data[data.length - 1]]).map((d, i) =>
          <span key={i}>{fds(d.date)}</span>
        )}
      </div>
    </div>
  )
}
