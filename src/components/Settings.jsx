import { useState, useEffect } from 'react'
import { P, PL, AC, SM, TM, TL, TX, BD, BG2, mn, sf, bp, bgg, ip, ba, glass } from '../constants/theme'
import { DEF_GOALS, WHY_OPTIONS, DEF_TRIGGERS, DEF_MILESTONES, DEF_COST } from '../constants/data'
import { supabase } from '../lib/supabase'
import { td, generateMilestones } from '../utils/helpers'
import TriggerIcon from './TriggerIcon'
import ErrToast from './ErrToast'

export default function Settings({
  goals, cfg, triggers, milestones, smellCost, user,
  eG, setEG, eW, setEW, eC, setEC,
  eT, setET, nT, setNT,
  eM, setEM, nMA, setNMA, nML, setNML,
  eCost, setECost,
  setTab, setTab2, saveProf, onClose,
  err, setErr,
  wthC, wthE, connectWithings, disconnectWithings,
  bodyGoals, saveBodyGoals, wgt
}) {
  const tog2 = (a, s, id) => { s(a.includes(id) ? a.filter(x => x !== id) : [...a, id]) }

  const [bgStartDate, setBgStartDate] = useState(bodyGoals?.start_date || td())
  const [bgTargetWeight, setBgTargetWeight] = useState(bodyGoals?.target_weight || "")
  const [bgHeightCm, setBgHeightCm] = useState(bodyGoals?.height_cm || "")
  const [bgMilestones, setBgMilestones] = useState(bodyGoals?.milestones || [])

  useEffect(() => {
    setBgStartDate(bodyGoals?.start_date || td())
    setBgTargetWeight(bodyGoals?.target_weight || "")
    setBgHeightCm(bodyGoals?.height_cm || "")
    setBgMilestones(bodyGoals?.milestones || [])
  }, [bodyGoals])

  function onTargetWeightChange(val) {
    setBgTargetWeight(val)
    const tw = parseFloat(val)
    if (!tw || tw <= 0) return
    const sw = bodyGoals?.start_weight || (wgt && wgt.length > 0 ? wgt[wgt.length - 1].kg : null)
    if (sw && tw < sw) setBgMilestones(generateMilestones(sw, tw))
  }

  return (
    <div style={{ ...ba, padding: 24, paddingBottom: 32 }} className="fade-in">
      <ErrToast err={err} setErr={setErr} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, marginBottom: 32 }}>
        <div style={{ fontSize: 22, fontWeight: 600 }}>Innstillinger</div>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 14, fontFamily: mn, color: TM, cursor: "pointer" }}>Lukk</button>
      </div>

      <div style={{ display: "flex", gap: 0, marginBottom: 24, backgroundColor: BG2, borderRadius: 14, border: `1px solid ${BD}`, overflow: "hidden", padding: 3 }}>
        {[["goals", "Mål"], ["triggers", "Triggere"], ["body", "Kropp"], ["milestones", "Miles."], ["other", "Annet"]].map(([id, l]) =>
          <button key={id} onClick={() => setTab2(id)} style={{
            flex: 1, padding: "10px 4px", border: "none", borderRadius: 11,
            background: setTab === id ? `linear-gradient(135deg, ${P}, #6344d0)` : "transparent",
            color: setTab === id ? "#fff" : TM, fontSize: 10, fontFamily: mn,
            cursor: "pointer", fontWeight: setTab === id ? 500 : 400
          }}>{l}</button>
        )}
      </div>

      {setTab === "goals" && (
        <>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Mine mål</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {DEF_GOALS.map(g =>
              <button key={g.id} onClick={() => tog2(eG, setEG, g.id)} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 12,
                border: eG.includes(g.id) ? `2px solid ${P}` : `1px solid ${BD}`,
                backgroundColor: eG.includes(g.id) ? PL : BG2, cursor: "pointer", textAlign: "left"
              }}>
                <span style={{ fontSize: 18 }}>{g.icon}</span>
                <span style={{ fontSize: 15, color: eG.includes(g.id) ? P : TX, fontWeight: eG.includes(g.id) ? 600 : 400 }}>{g.label}</span>
              </button>
            )}
          </div>
          <input type="text" placeholder="Eget mål..." value={eC} onChange={e => setEC(e.target.value)} style={{ ...ip, marginTop: 12 }} />
          <div style={{ fontSize: 16, fontWeight: 600, marginTop: 24, marginBottom: 16 }}>Mitt hvorfor</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {WHY_OPTIONS.map(w =>
              <button key={w.id} onClick={() => tog2(eW, setEW, w.id)} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 12,
                border: eW.includes(w.id) ? `2px solid ${P}` : `1px solid ${BD}`,
                backgroundColor: eW.includes(w.id) ? PL : BG2, cursor: "pointer", textAlign: "left"
              }}>
                <span style={{ fontSize: 18 }}>{w.icon}</span>
                <span style={{ fontSize: 15, color: eW.includes(w.id) ? P : TX, fontWeight: eW.includes(w.id) ? 600 : 400 }}>{w.label}</span>
              </button>
            )}
          </div>
          <button onClick={async () => {
            const g = { goals: eC ? [...eG, "custom:" + eC] : eG, whys: eW, customGoal: eC }
            const ok = await saveProf(g, cfg)
            if (ok) onClose()
          }} style={{ ...bp, marginTop: 24 }}>Lagre</button>
        </>
      )}

      {setTab === "triggers" && (
        <>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Fristelsestyper</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {eT.map(t =>
              <div key={t.id} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 12,
                border: `1px solid ${BD}`, backgroundColor: BG2
              }}>
                <TriggerIcon type={t.icon} size={18} color={TM} />
                <span style={{ fontSize: 15, flex: 1 }}>{t.label}</span>
                <button onClick={() => setET(eT.filter(x => x.id !== t.id))} style={{ background: "none", border: "none", color: SM, fontSize: 18, cursor: "pointer" }}>x</button>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <input type="text" placeholder="Ny trigger..." value={nT} onChange={e => setNT(e.target.value)} style={{ ...ip, flex: 1, marginBottom: 0 }} />
            <button onClick={() => {
              if (nT.trim()) { setET([...eT, { id: "c_" + Date.now(), label: nT.trim(), icon: "sparkle" }]); setNT("") }
            }} style={{ padding: "14px 20px", borderRadius: 12, border: "none", background: P, color: "#fff", fontSize: 14, fontFamily: sf, cursor: "pointer" }}>+</button>
          </div>
          <button onClick={async () => {
            const c = { ...(cfg || {}), triggers: eT, milestones: cfg?.milestones || DEF_MILESTONES, cost: cfg?.cost || DEF_COST }
            const ok = await saveProf(goals, c)
            if (ok) onClose()
          }} style={{ ...bp, marginTop: 24 }}>Lagre</button>
        </>
      )}

      {setTab === "body" && (
        <>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Kroppsmål</div>

          <div style={{ fontSize: 13, color: TM, marginBottom: 6 }}>Startdato</div>
          <input type="date" value={bgStartDate} onChange={e => setBgStartDate(e.target.value)} style={ip} />

          <div style={{ fontSize: 13, color: TM, marginBottom: 6, marginTop: 8 }}>Målvekt (kg)</div>
          <input type="number" step="0.1" placeholder="F.eks. 80" value={bgTargetWeight} onChange={e => onTargetWeightChange(e.target.value)} style={ip} />

          <div style={{ fontSize: 13, color: TM, marginBottom: 6, marginTop: 8 }}>Høyde (cm)</div>
          <input type="number" step="0.1" placeholder="F.eks. 180" value={bgHeightCm} onChange={e => setBgHeightCm(e.target.value)} style={ip} />

          {bgMilestones.length > 0 && (
            <>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 16, marginBottom: 10 }}>Delmål</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {bgMilestones.map((m, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                    borderRadius: 12, border: `1px solid ${BD}`, backgroundColor: BG2
                  }}>
                    <span style={{ fontSize: 14, fontFamily: mn, color: P, fontWeight: 500, minWidth: 60 }}>{m.target} kg</span>
                    <span style={{ fontSize: 14, flex: 1, color: TX }}>{m.label}</span>
                    <button onClick={() => setBgMilestones(bgMilestones.filter((_, j) => j !== i))} style={{
                      background: "none", border: "none", color: SM, fontSize: 16, cursor: "pointer"
                    }}>x</button>
                  </div>
                ))}
              </div>
            </>
          )}

          <button onClick={async () => {
            const sw = bodyGoals?.start_weight || (wgt && wgt.length > 0 ? wgt[wgt.length - 1].kg : null)
            const ok = await saveBodyGoals({
              start_date: bgStartDate,
              start_weight: sw || null,
              target_weight: bgTargetWeight ? parseFloat(bgTargetWeight) : null,
              height_cm: bgHeightCm ? parseFloat(bgHeightCm) : null,
              milestones: bgMilestones
            })
            if (ok) onClose()
          }} style={{ ...bp, marginTop: 24 }}>Lagre</button>
        </>
      )}

      {setTab === "milestones" && (
        <>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Spare-milestones</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[...eM].sort((a, b) => a.a - b.a).map((m, i) =>
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 12,
                border: `1px solid ${BD}`, backgroundColor: BG2
              }}>
                <span style={{ fontSize: 14, fontFamily: mn, color: AC, fontWeight: 500, minWidth: 60 }}>{m.a.toLocaleString("nb-NO")} kr</span>
                <span style={{ fontSize: 15, flex: 1 }}>{m.l}</span>
                <button onClick={() => setEM(eM.filter(x => x !== m))} style={{ background: "none", border: "none", color: SM, fontSize: 18, cursor: "pointer" }}>x</button>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <input type="number" placeholder="Beløp" value={nMA} onChange={e => setNMA(e.target.value)} style={{ ...ip, flex: 1, marginBottom: 0 }} />
            <input type="text" placeholder="Beskrivelse" value={nML} onChange={e => setNML(e.target.value)} style={{ ...ip, flex: 2, marginBottom: 0 }} />
          </div>
          <button onClick={() => {
            if (nMA && nML) { setEM([...eM, { a: parseInt(nMA), l: nML }]); setNMA(""); setNML("") }
          }} style={{ ...bgg, marginTop: 8, padding: "12px 20px", fontSize: 14 }}>+ Legg til</button>
          <button onClick={async () => {
            const c = { ...(cfg || {}), triggers: cfg?.triggers || DEF_TRIGGERS, milestones: [...eM].sort((a, b) => a.a - b.a), cost: cfg?.cost || DEF_COST }
            const ok = await saveProf(goals, c)
            if (ok) onClose()
          }} style={{ ...bp, marginTop: 24 }}>Lagre</button>
        </>
      )}

      {setTab === "other" && (
        <>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Snittpris per smell</div>
          <div style={{ fontSize: 14, color: TM, marginBottom: 12 }}>Brukes til å beregne penger spart.</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="number" value={eCost} onChange={e => setECost(e.target.value)} style={{ ...ip, flex: 1, marginBottom: 0 }} />
            <span style={{ fontSize: 14, color: TM }}>kr</span>
          </div>
          <button onClick={async () => {
            const c = { ...(cfg || {}), triggers: cfg?.triggers || DEF_TRIGGERS, milestones: cfg?.milestones || DEF_MILESTONES, cost: parseInt(eCost) || DEF_COST }
            const ok = await saveProf(goals, c)
            if (ok) onClose()
          }} style={{ ...bp, marginTop: 24 }}>Lagre</button>
          <div style={{ fontSize: 16, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>Tilkoblinger</div>
          <div style={glass}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>Withings</div>
                <div style={{ fontSize: 12, fontFamily: mn, color: wthC ? AC : TL, marginTop: 2 }}>{wthC ? "Tilkoblet" : "Ikke tilkoblet"}</div>
                {wthE && <div style={{ fontSize: 12, fontFamily: mn, color: "#dc2626", marginTop: 2 }}>{wthE}</div>}
              </div>
              {wthC ? (
                <button onClick={disconnectWithings} style={{
                  background: "none", border: `1px solid ${BD}`, borderRadius: 8, padding: "6px 12px",
                  fontSize: 11, fontFamily: mn, color: SM, cursor: "pointer"
                }}>Koble fra</button>
              ) : (
                <button onClick={connectWithings} style={{
                  background: "none", border: `1px solid ${P}`, borderRadius: 8, padding: "6px 12px",
                  fontSize: 11, fontFamily: mn, color: P, cursor: "pointer"
                }}>Koble til</button>
              )}
            </div>
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>Profil</div>
          <div style={glass}>
            <div style={{ fontSize: 14, color: TM }}>{user.user_metadata?.name || user.email}</div>
            <div style={{ fontSize: 13, fontFamily: mn, color: TL, marginTop: 4 }}>{user.email}</div>
          </div>
          <button onClick={async () => { await supabase.auth.signOut() }} style={{ ...bgg, marginTop: 12, color: SM }}>Logg ut</button>
        </>
      )}
    </div>
  )
}
