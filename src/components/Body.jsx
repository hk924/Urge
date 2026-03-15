import { useState, useMemo } from 'react'
import { P, PL, AC, TM, TL, TX, BD, BG, BG2, BG3, mn, sf, bp, ip, glass, ba } from '../constants/theme'
import { td, fd, ago, agl } from '../utils/helpers'
import BodyChart from './BodyChart'
import TabBar from './TabBar'

export default function Body({
  wgt, wi, setWi,
  addWeight, delWeight, sc, setScreen,
  bodyGoals,
  wthC, wthS, wthE, connectWithings, syncWithings, disconnectWithings
}) {
  const [range, setRange] = useState("month")
  const [metric, setMetric] = useState("kg")
  const [wef, setWef] = useState(false)
  const [wd2, setWd2] = useState(td())
  const [wdp, setWdp] = useState(false)
  const [dWId, setDWId] = useState(null)

  const lt = wgt.length > 0 ? wgt[0] : null
  const milestones = bodyGoals?.milestones || []
  const targetWeight = bodyGoals?.target_weight
  const heightCm = bodyGoals?.height_cm

  // Filter data by range
  const filteredWgt = useMemo(() => {
    if (range === "all") return [...wgt].reverse()
    const now = new Date()
    let cutoff
    if (range === "week") { cutoff = new Date(now); cutoff.setDate(cutoff.getDate() - 7) }
    else if (range === "month") { cutoff = new Date(now); cutoff.setMonth(cutoff.getMonth() - 1) }
    else if (range === "quarter") { cutoff = new Date(now); cutoff.setMonth(cutoff.getMonth() - 3) }
    const iso = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, '0')}-${String(cutoff.getDate()).padStart(2, '0')}`
    return [...wgt].filter(w => w.date >= iso).reverse()
  }, [wgt, range])

  // Period change calculation
  const periodChange = useMemo(() => {
    if (filteredWgt.length < 2) return null
    const first = filteredWgt[0].kg
    const last = filteredWgt[filteredWgt.length - 1].kg
    return (last - first).toFixed(1)
  }, [filteredWgt])

  // Check data availability for metrics
  const hasFat = wgt.some(w => w.fat)
  const hasMuscle = wgt.some(w => w.muscle)
  const hasBMI = !!heightCm && wgt.length > 0

  // Prepare chart data for current metric
  const chartData = useMemo(() => {
    if (metric === "bmi") {
      if (!heightCm) return []
      const hm = heightCm / 100
      return filteredWgt.map(w => ({ ...w, bmi: +(w.kg / (hm * hm)).toFixed(1) }))
    }
    if (metric === "fat") return filteredWgt.filter(w => w.fat)
    if (metric === "muscle") return filteredWgt.filter(w => w.muscle)
    return filteredWgt
  }, [filteredWgt, metric, heightCm])

  const rangeLabel = range === "week" ? "DENNE UKA" : range === "month" ? "DENNE MND" : range === "quarter" ? "DETTE KV." : "TOTALT"

  const datePicker = (val, setVal, open, setOpen) => (
    <>
      <div style={{ fontSize: 12, fontFamily: mn, color: TL, marginBottom: 6, marginTop: 8 }}>Dato</div>
      <button onClick={() => setOpen(!open)} style={{
        ...ip, textAlign: "left", cursor: "pointer", marginBottom: open ? 0 : 10,
        color: val === td() ? TM : TX
      }}>{val === td() ? "I dag" : fd(val)}</button>
      {open && <div style={{ marginBottom: 10, border: `1px solid ${BD}`, borderRadius: 12, overflow: "hidden" }}>
        {[0, 1, 2, 3, 4, 5, 6].map(n =>
          <button key={n} onClick={() => { setVal(ago(n)); setOpen(false) }} style={{
            display: "block", width: "100%", padding: "12px 16px", textAlign: "left",
            background: val === ago(n) ? PL : "none", border: "none",
            borderBottom: n < 6 ? `1px solid rgba(255,255,255,0.04)` : "none",
            fontSize: 15, fontFamily: sf, color: TX, cursor: "pointer"
          }}>{agl(n)}</button>
        )}
      </div>}
    </>
  )

  const metricColor = metric === "fat" ? "#38bdf8" : metric === "muscle" ? "#f472b6" : metric === "bmi" ? "#fbbf24" : P
  const metricSuffix = metric === "fat" || metric === "muscle" ? "%" : metric === "bmi" ? "" : ""

  return (
    <div style={ba} className="fade-in">
      <div style={{ padding: "48px 20px 24px" }}>
        <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 20 }}>Kropp</div>

        {/* Range picker */}
        <div style={{ display: "flex", marginBottom: 16, backgroundColor: BG2, borderRadius: 14, border: `1px solid ${BD}`, overflow: "hidden", padding: 3 }}>
          {[["week", "Uke"], ["month", "Måned"], ["quarter", "Kvartal"], ["all", "Alt"]].map(([id, l]) =>
            <button key={id} onClick={() => setRange(id)} style={{
              flex: 1, padding: "10px 8px", border: "none", borderRadius: 11,
              background: range === id ? `linear-gradient(135deg, ${P}, #6344d0)` : "transparent",
              color: range === id ? "#fff" : TM, fontSize: 12, fontFamily: mn,
              cursor: "pointer", fontWeight: range === id ? 500 : 400
            }}>{l}</button>
          )}
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
          <div style={{ ...glass, padding: "14px 12px", marginBottom: 0, textAlign: "center" }}>
            <div style={{ fontSize: 10, fontFamily: mn, color: TL, textTransform: "uppercase", marginBottom: 4 }}>KG NÅ</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>{lt ? lt.kg : "–"}</div>
          </div>
          <div style={{ ...glass, padding: "14px 12px", marginBottom: 0, textAlign: "center" }}>
            <div style={{ fontSize: 10, fontFamily: mn, color: TL, textTransform: "uppercase", marginBottom: 4 }}>{rangeLabel}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: periodChange && parseFloat(periodChange) < 0 ? AC : periodChange && parseFloat(periodChange) > 0 ? "#dc2626" : "#fff" }}>
              {periodChange ? (parseFloat(periodChange) > 0 ? "+" : "") + periodChange : "–"}
            </div>
          </div>
          <div style={{ ...glass, padding: "14px 12px", marginBottom: 0, textAlign: "center" }}>
            <div style={{ fontSize: 10, fontFamily: mn, color: TL, textTransform: "uppercase", marginBottom: 4 }}>MÅLVEKT</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: AC }}>{targetWeight || "–"}</div>
          </div>
        </div>

        {/* Metric toggle */}
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          {[
            { id: "kg", label: "Vekt", enabled: true },
            { id: "fat", label: "Fett %", enabled: hasFat },
            { id: "muscle", label: "Muskler %", enabled: hasMuscle },
            { id: "bmi", label: "BMI", enabled: hasBMI },
          ].map(m => (
            <button key={m.id} onClick={() => m.enabled && setMetric(m.id)} style={{
              flex: 1, padding: "8px 4px", borderRadius: 10,
              border: metric === m.id ? `2px solid ${metricColor}` : `1px solid ${BD}`,
              backgroundColor: metric === m.id ? PL : "transparent",
              fontSize: 11, fontFamily: mn, cursor: m.enabled ? "pointer" : "default",
              color: metric === m.id ? "#fff" : TM,
              opacity: m.enabled ? 1 : 0.4
            }}>{m.label}</button>
          ))}
        </div>

        {/* Chart */}
        <div style={glass}>
          <BodyChart
            data={chartData}
            dk={metric}
            color={metricColor}
            sx={metricSuffix}
            height={200}
            range={range}
          />
        </div>

        {/* Milestones section */}
        {milestones.length > 0 && (
          <div style={glass}>
            <div style={{ fontSize: 11, fontFamily: mn, color: TL, textTransform: "uppercase", marginBottom: 16 }}>Delmål</div>
            <div style={{ position: "relative", paddingLeft: 20 }}>
              {/* Vertical line behind all items */}
              <div style={{
                position: "absolute", left: 9, top: 10, bottom: 10, width: 2,
                backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 1
              }} />
              {/* Green progress fill over the vertical line */}
              {(() => {
                const reachedCount = milestones.filter(m => lt && lt.kg <= m.target).length
                if (reachedCount === 0) return null
                const pct = (reachedCount / milestones.length) * 100
                return (
                  <div style={{
                    position: "absolute", left: 9, top: 10, width: 2, borderRadius: 1,
                    height: `calc(${pct}% - ${pct < 100 ? 10 : 20}px)`,
                    background: `linear-gradient(to bottom, ${AC}, ${P})`
                  }} />
                )
              })()}

              {milestones.map((m, i) => {
                const isLast = i === milestones.length - 1
                const reached = lt && lt.kg <= m.target
                const isNext = !reached && (i === 0 || (lt && lt.kg <= milestones[i - 1]?.target))
                const remaining = lt ? (lt.kg - m.target).toFixed(1) : null

                const dotSize = 20
                const dotColor = reached ? AC : isNext ? P : TL

                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    paddingBottom: isLast ? 0 : 18, position: "relative"
                  }}>
                    {/* Dot on the vertical line */}
                    <div style={{
                      width: dotSize, height: dotSize, borderRadius: dotSize / 2,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      marginLeft: -20 + (10 - dotSize / 2),
                      flexShrink: 0, zIndex: 1,
                      backgroundColor: reached ? AC : isNext ? P : "rgba(255,255,255,0.06)",
                      border: reached || isNext ? "none" : `1.5px solid ${BD}`
                    }}>
                      {reached ? (
                        <span style={{ fontSize: 11, color: "#0a0a0f", fontWeight: 700 }}>{isLast ? "\u2605" : "\u2713"}</span>
                      ) : (
                        <span style={{ fontSize: 9, fontFamily: mn, color: isNext ? "#fff" : TL, fontWeight: 600 }}>{i + 1}</span>
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 14, fontWeight: reached ? 600 : 400,
                        color: reached ? AC : isNext ? TX : TM
                      }}>{m.label}</div>
                      <div style={{ fontSize: 11, fontFamily: mn, color: reached ? AC : TL, marginTop: 1 }}>
                        {reached ? "Nådd!" : remaining && parseFloat(remaining) > 0 ? `${remaining} kg igjen` : ""}
                      </div>
                    </div>

                    {/* Target weight */}
                    <div style={{ fontSize: 13, fontFamily: mn, color: reached ? AC : TL, fontWeight: 500, flexShrink: 0 }}>
                      {m.target} kg
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Weight history */}
        {wgt.length > 0 && (
          <div style={glass}>
            <div style={{ fontSize: 11, fontFamily: mn, color: TL, textTransform: "uppercase", marginBottom: 8 }}>Historikk</div>
            {wgt.slice(0, 10).map((w, i) =>
              <div key={w.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0",
                borderBottom: i < Math.min(wgt.length, 10) - 1 ? `1px solid rgba(255,255,255,0.04)` : "none"
              }}>
                <div>
                  <span style={{ fontSize: 15, fontWeight: 500 }}>{w.kg} kg</span>
                  {w.fat && <span style={{ fontSize: 11, fontFamily: mn, color: "#38bdf8", marginLeft: 8 }}>{w.fat}%</span>}
                  {w.muscle && <span style={{ fontSize: 11, fontFamily: mn, color: "#f472b6", marginLeft: 6 }}>{w.muscle}%</span>}
                  {w.source === "withings" && <span style={{ fontSize: 9, fontFamily: mn, color: AC, marginLeft: 6, verticalAlign: "middle" }}>W</span>}
                  <span style={{ fontSize: 12, fontFamily: mn, color: TL, marginLeft: 10 }}>{w.date === td() ? "I dag" : fd(w.date)}</span>
                </div>
                <button onClick={async () => {
                  if (dWId === w.id) {
                    await delWeight(w.id)
                    setDWId(null)
                  } else setDWId(w.id)
                }} style={{
                  background: "none", border: "none", fontSize: 12, fontFamily: mn, cursor: "pointer",
                  color: dWId === w.id ? "#dc2626" : TL, padding: "4px 8px"
                }}>{dWId === w.id ? "Bekreft?" : "\u2715"}</button>
              </div>
            )}
          </div>
        )}

        {/* Log weight button + form */}
        <button onClick={() => setWef(!wef)} style={{
          width: "100%", background: "none", border: `1px solid ${BD}`, borderRadius: 14,
          padding: "14px 16px", fontSize: 14, fontFamily: sf, color: TM, cursor: "pointer",
          textAlign: "center", marginBottom: 12
        }}>{wef ? "Skjul skjema" : "+ Logg vekt"}</button>

        {wef && (
          <div style={{ ...glass, padding: 16 }}>
            <input type="number" step="0.1" placeholder="Vekt (kg)" value={wi.kg} onChange={e => setWi({ ...wi, kg: e.target.value })} style={ip} />
            <input type="number" step="0.1" placeholder="Fettprosent (%)" value={wi.fat} onChange={e => setWi({ ...wi, fat: e.target.value })} style={ip} />
            <input type="number" step="0.1" placeholder="Muskelmasse (%)" value={wi.muscle} onChange={e => setWi({ ...wi, muscle: e.target.value })} style={ip} />
            {datePicker(wd2, setWd2, wdp, setWdp)}
            <button onClick={async () => {
              if (!wi.kg) return
              await addWeight(parseFloat(wi.kg), wi.fat ? parseFloat(wi.fat) : null, wi.muscle ? parseFloat(wi.muscle) : null, wd2)
              setWi({ kg: "", fat: "", muscle: "" })
              setWd2(td())
              setWef(false)
            }} style={{ ...bp, padding: "12px 24px", fontSize: 14 }}>Lagre</button>
          </div>
        )}

        {/* Withings section */}
        <div style={{ ...glass }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontFamily: mn, color: TL, textTransform: "uppercase", marginBottom: 4 }}>Withings</div>
              <div style={{ fontSize: 13, fontFamily: mn, color: wthC ? AC : TM }}>{wthC ? "Tilkoblet" : "Ikke tilkoblet"}</div>
              {wthE && <div style={{ fontSize: 12, fontFamily: mn, color: wthE.includes("synkronisert") ? AC : "#dc2626", marginTop: 4 }}>{wthE}</div>}
            </div>
            {wthC ? (
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={syncWithings} disabled={wthS} style={{
                  background: "none", border: `1px solid ${BD}`, borderRadius: 8, padding: "6px 10px",
                  fontSize: 11, fontFamily: mn, color: wthS ? TL : P, cursor: wthS ? "default" : "pointer", opacity: wthS ? 0.6 : 1
                }}>{wthS ? "Synkr..." : "Synkroniser"}</button>
                <button onClick={disconnectWithings} style={{
                  background: "none", border: `1px solid ${BD}`, borderRadius: 8, padding: "6px 10px",
                  fontSize: 11, fontFamily: mn, color: TL, cursor: "pointer"
                }}>Koble fra</button>
              </div>
            ) : (
              <button onClick={connectWithings} style={{
                background: "none", border: `1px solid ${P}`, borderRadius: 8, padding: "6px 12px",
                fontSize: 11, fontFamily: mn, color: P, cursor: "pointer"
              }}>Koble til</button>
            )}
          </div>
        </div>
      </div>
      <TabBar screen={sc} setScreen={setScreen} />
    </div>
  )
}
