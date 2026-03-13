import { P, PL, TM, TL, TX, SM, BD, BG, BG2, mn, sf, bp, bgg, ip, ba } from '../constants/theme'
import { DEF_GOALS, WHY_OPTIONS } from '../constants/data'
import ErrToast from './ErrToast'

export default function Onboarding({ obStep, setObStep, selG, setSelG, selW, setSelW, cGoal, setCGoal, saveProf, cfg, err, setErr }) {
  const tog = (a, s, id) => { s(a.includes(id) ? a.filter(x => x !== id) : [...a, id]) }

  return (
    <div style={{ ...ba, padding: 24, paddingBottom: 32, background: `radial-gradient(ellipse at 50% 0%, rgba(124,92,252,0.1) 0%, transparent 50%), ${BG}` }} className="fade-in">
      <ErrToast err={err} setErr={setErr} />
      {obStep === "goals" ? (
        <>
          <div style={{ marginTop: 48, marginBottom: 8 }}>
            <div style={{ fontSize: 12, fontFamily: mn, color: P, letterSpacing: "0.15em", textTransform: "uppercase" }}>Steg 1 av 2</div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 600, marginBottom: 8 }}>Hva jobber du mot?</div>
          <div style={{ fontSize: 15, color: TM, marginBottom: 28, lineHeight: 1.5 }}>Velg målene som betyr mest.</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {DEF_GOALS.map(g =>
              <button key={g.id} onClick={() => tog(selG, setSelG, g.id)} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: 14,
                border: selG.includes(g.id) ? `2px solid ${P}` : `1px solid ${BD}`,
                backgroundColor: selG.includes(g.id) ? PL : BG2, cursor: "pointer", textAlign: "left"
              }}>
                <span style={{ fontSize: 20, width: 28, textAlign: "center" }}>{g.icon}</span>
                <span style={{ fontSize: 16, fontFamily: sf, color: selG.includes(g.id) ? P : TX, fontWeight: selG.includes(g.id) ? 600 : 400 }}>{g.label}</span>
              </button>
            )}
          </div>
          <div style={{ fontSize: 12, fontFamily: mn, color: TL, marginBottom: 6, marginTop: 20 }}>Eller skriv ditt eget</div>
          <input type="text" placeholder="F.eks. veie under 80 kg" value={cGoal} onChange={e => setCGoal(e.target.value)} style={ip} />
          <button onClick={() => { if (selG.length || cGoal) setObStep("whys") }} disabled={!selG.length && !cGoal} style={{ ...bp, marginTop: 16, opacity: selG.length || cGoal ? 1 : .4 }}>Neste</button>
        </>
      ) : obStep === "whys" ? (
        <>
          <div style={{ marginTop: 48, marginBottom: 8 }}>
            <div style={{ fontSize: 12, fontFamily: mn, color: P, letterSpacing: "0.15em", textTransform: "uppercase" }}>Steg 2 av 2</div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 600, marginBottom: 8 }}>Hvorfor gjør du dette?</div>
          <div style={{ fontSize: 15, color: TM, marginBottom: 28, lineHeight: 1.5 }}>Ditt "hvorfor" holder deg på sporet.</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {WHY_OPTIONS.map(w =>
              <button key={w.id} onClick={() => tog(selW, setSelW, w.id)} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: 14,
                border: selW.includes(w.id) ? `2px solid ${P}` : `1px solid ${BD}`,
                backgroundColor: selW.includes(w.id) ? PL : BG2, cursor: "pointer", textAlign: "left"
              }}>
                <span style={{ fontSize: 20, width: 28, textAlign: "center" }}>{w.icon}</span>
                <span style={{ fontSize: 16, fontFamily: sf, color: selW.includes(w.id) ? P : TX, fontWeight: selW.includes(w.id) ? 600 : 400 }}>{w.label}</span>
              </button>
            )}
          </div>
          <button onClick={async () => {
            if (!selW.length) return
            const g = { goals: cGoal ? [...selG, "custom:" + cGoal] : selG, whys: selW, customGoal: cGoal }
            await saveProf(g, cfg)
          }} disabled={!selW.length} style={{ ...bp, marginTop: 28, opacity: selW.length ? 1 : .4 }}>Start reisen</button>
          <button onClick={() => setObStep("goals")} style={{ ...bgg, marginTop: 10 }}>Tilbake</button>
        </>
      ) : null}
    </div>
  )
}
