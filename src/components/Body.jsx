import { useState } from 'react'
import { P, PL, TM, TL, TX, BD, BG, BG2, BG3, mn, sf, bp, ip, glass, ba } from '../constants/theme'
import { WTS } from '../constants/data'
import { td, fd, ago, agl } from '../utils/helpers'
import Chart from './Chart'
import TabBar from './TabBar'

export default function Body({
  wgt, wko, bt, setBt, wf, setWf, wef, setWef,
  wi, setWi, woi, setWoi,
  addWeight, addWorkout, delWeight, delWorkout, sc, setScreen
}) {
  const [wd2, setWd2] = useState(td())
  const [wdp, setWdp] = useState(false)
  const [wkd, setWkd] = useState(td())
  const [wkdp, setWkdp] = useState(false)
  const [dWId, setDWId] = useState(null)
  const [dWkId, setDWkId] = useState(null)

  const lt = wgt.length > 0 ? wgt[0] : null
  const ft = wgt.length > 1 ? wgt[wgt.length - 1] : null
  const wd = lt && ft ? (ft.kg - lt.kg).toFixed(1) : null
  const cd2 = [...wgt].reverse()

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

  return (
    <div style={ba} className="fade-in">
      <div style={{ padding: "48px 20px 24px" }}>
        <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 24 }}>Kropp</div>
        <div style={{ display: "flex", marginBottom: 20, backgroundColor: BG2, borderRadius: 14, border: `1px solid ${BD}`, overflow: "hidden", padding: 3 }}>
          {[["vekt", "Vekt"], ["comp", "Smnsetn."], ["trening", "Trening"]].map(([id, l]) =>
            <button key={id} onClick={() => setBt(id)} style={{
              flex: 1, padding: "10px 8px", border: "none", borderRadius: 11,
              background: bt === id ? `linear-gradient(135deg, ${P}, #6344d0)` : "transparent",
              color: bt === id ? "#fff" : TM, fontSize: 12, fontFamily: mn,
              cursor: "pointer", fontWeight: bt === id ? 500 : 400
            }}>{l}</button>
          )}
        </div>

        {bt === "vekt" && (
          <div style={glass}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div style={{ fontSize: 11, fontFamily: mn, color: TL, textTransform: "uppercase" }}>Vekt</div>
              <button onClick={() => setWef(!wef)} style={{ background: "none", border: `1px solid ${BD}`, borderRadius: 8, padding: "6px 12px", fontSize: 11, fontFamily: mn, color: TM, cursor: "pointer" }}>+ Logg</button>
            </div>
            {lt ? (
              <>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                  <div style={{ fontSize: 40, fontWeight: 700, color: "#fff" }}>{lt.kg}</div>
                  <div style={{ fontSize: 16, color: TM }}>kg</div>
                  {wd && parseFloat(wd) > 0 && <div style={{ fontSize: 14, fontFamily: mn, color: "#4ade80", marginLeft: "auto" }}>{"\u2193"} {wd} kg</div>}
                </div>
                {ft && <div style={{ fontSize: 12, fontFamily: mn, color: TL }}>Siden {fd(ft.date)}</div>}
                <Chart data={cd2} dk="kg" color={P} />
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "20px 0", color: TL, fontSize: 14 }}>Ingen vekt logget</div>
            )}
            {wef && (
              <div style={{ marginTop: 16, padding: 16, backgroundColor: BG2, borderRadius: 12 }}>
                <input type="number" step="0.1" placeholder="Vekt (kg)" value={wi.kg} onChange={e => setWi({ ...wi, kg: e.target.value })} style={ip} />
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
            {wgt.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 11, fontFamily: mn, color: TL, textTransform: "uppercase", marginBottom: 8 }}>Historikk</div>
                {wgt.slice(0, 10).map((w, i) =>
                  <div key={w.id} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0",
                    borderBottom: i < Math.min(wgt.length, 10) - 1 ? `1px solid rgba(255,255,255,0.04)` : "none"
                  }}>
                    <div>
                      <span style={{ fontSize: 15, fontWeight: 500 }}>{w.kg} kg</span>
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
          </div>
        )}

        {bt === "comp" && (
          <>
            {cd2.some(d => d.fat) && (
              <div style={glass}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ fontSize: 11, fontFamily: mn, color: TL, textTransform: "uppercase" }}>Fettprosent</div>
                  {lt && lt.fat && <div style={{ fontSize: 14, fontFamily: mn, color: "#38bdf8", fontWeight: 500 }}>{lt.fat}%</div>}
                </div>
                <Chart data={cd2.filter(d => d.fat)} dk="fat" color="#38bdf8" sx="%" />
              </div>
            )}
            {cd2.some(d => d.muscle) && (
              <div style={glass}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ fontSize: 11, fontFamily: mn, color: TL, textTransform: "uppercase" }}>Muskelmasse</div>
                  {lt && lt.muscle && <div style={{ fontSize: 14, fontFamily: mn, color: "#f472b6", fontWeight: 500 }}>{lt.muscle}%</div>}
                </div>
                <Chart data={cd2.filter(d => d.muscle)} dk="muscle" color="#f472b6" sx="%" />
              </div>
            )}
            <div style={glass}>
              <button onClick={() => setWef(!wef)} style={{
                width: "100%", background: "none", border: `1px solid ${BD}`, borderRadius: 10,
                padding: "14px 16px", fontSize: 14, fontFamily: sf, color: TM, cursor: "pointer", textAlign: "center"
              }}>+ Logg vekt, fett og muskelmasse</button>
              {wef && (
                <div style={{ marginTop: 12, padding: 16, backgroundColor: BG2, borderRadius: 12 }}>
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
            </div>
            {!cd2.some(d => d.fat) && !cd2.some(d => d.muscle) && (
              <div style={{ textAlign: "center", padding: 20, color: TL, fontSize: 14 }}>Logg vekt med fett/muskelmasse for grafer</div>
            )}
          </>
        )}

        {bt === "trening" && (
          <div style={glass}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontFamily: mn, color: TL, textTransform: "uppercase" }}>Treningslogg</div>
              <button onClick={() => setWf(!wf)} style={{ background: "none", border: `1px solid ${BD}`, borderRadius: 8, padding: "6px 12px", fontSize: 11, fontFamily: mn, color: TM, cursor: "pointer" }}>+ Logg</button>
            </div>
            {wf && (
              <div style={{ marginBottom: 16, padding: 16, backgroundColor: BG2, borderRadius: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                  {WTS.map(t =>
                    <button key={t} onClick={() => setWoi({ ...woi, type: t })} style={{
                      padding: "12px 4px", borderRadius: 10,
                      border: woi.type === t ? `2px solid ${P}` : `1px solid ${BD}`,
                      backgroundColor: woi.type === t ? PL : BG3, fontSize: 14,
                      cursor: "pointer", fontFamily: sf, color: woi.type === t ? P : TX,
                      fontWeight: woi.type === t ? 600 : 400
                    }}>{t}</button>
                  )}
                </div>
                <input type="text" placeholder="Varighet (f.eks. 45 min)" value={woi.duration} onChange={e => setWoi({ ...woi, duration: e.target.value })} style={ip} />
                {datePicker(wkd, setWkd, wkdp, setWkdp)}
                <button onClick={async () => {
                  if (!woi.type || !woi.duration) return
                  await addWorkout(woi.type, woi.duration, wkd)
                  setWoi({ type: "", duration: "" })
                  setWkd(td())
                  setWf(false)
                }} style={{ ...bp, padding: "12px 24px", fontSize: 14 }}>Lagre</button>
              </div>
            )}
            {wko.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: TL, fontSize: 14 }}>Ingen trening logget</div>
            ) : wko.slice(0, 10).map((w, i) =>
              <div key={w.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0",
                borderBottom: i < Math.min(wko.length, 10) - 1 ? `1px solid rgba(255,255,255,0.04)` : "none"
              }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 500 }}>{w.type}</div>
                  <div style={{ fontSize: 12, fontFamily: mn, color: TL }}>{w.date === td() ? "I dag" : fd(w.date)}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontSize: 14, fontFamily: mn, color: TM }}>{w.duration}</div>
                  <button onClick={async () => {
                    if (dWkId === w.id) {
                      await delWorkout(w.id)
                      setDWkId(null)
                    } else setDWkId(w.id)
                  }} style={{
                    background: "none", border: "none", fontSize: 12, fontFamily: mn, cursor: "pointer",
                    color: dWkId === w.id ? "#dc2626" : TL, padding: "4px 8px"
                  }}>{dWkId === w.id ? "Bekreft?" : "\u2715"}</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <TabBar screen={sc} setScreen={setScreen} />
    </div>
  )
}
