import { useState } from 'react'
import { P, PL, TM, TL, SM, SML, mn, sf, bp, bgg, ip, ba, BG, TX, BD } from '../constants/theme'
import { td, fd, ago, agl } from '../utils/helpers'

export default function SmellFlow({ ssr, setSsr, ssf, setSsf, stl, sm, setSm, tR, ms, addSmell }) {
  const [sd, setSd] = useState(td())
  const [sdp, setSdp] = useState(false)

  if (ssr && !ssf) return (
    <div style={{
      ...ba, display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: 32, textAlign: "center",
      background: `radial-gradient(ellipse at 50% 30%, rgba(176,124,195,0.1) 0%, transparent 60%), ${BG}`
    }} className="fade-in">
      <div style={{
        width: 80, height: 80, borderRadius: 22, background: SML,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 32, border: `1px solid rgba(176,124,195,0.2)`
      }}>
        <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke={SM} strokeWidth="2">
          <path d="M18 15h-6l-4 4V15H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2z" />
        </svg>
      </div>
      <div style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>{stl}</div>
      <div style={{ fontSize: 17, fontWeight: 300, lineHeight: 1.6, color: TM, maxWidth: 300, marginBottom: 16 }}>
        {tR > 0 ? `Én smell endrer ikke kursen. Du har motstått ${tR} fristelser og spart ${ms.toLocaleString("nb-NO")} kr.` : "Alle starter et sted."}
      </div>
      <div style={{ fontSize: 15, maxWidth: 300, marginBottom: 48, color: "rgba(255,255,255,0.7)" }}>Vil du skrive et kort memo?</div>
      <button onClick={() => setSsf(true)} style={{ ...bp, marginBottom: 12, maxWidth: 300 }}>Ja, skriv memo</button>
      <button onClick={async () => { const ok = await addSmell({ trigger: "", feeling: "", what: "", cost: 0 }, sd); if (ok) setSsr(false) }} style={{ ...bgg, maxWidth: 300 }}>Hopp over</button>
    </div>
  )

  if (ssf) return (
    <div style={{ ...ba, padding: 24, paddingBottom: 32 }} className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32, marginTop: 16 }}>
        <div style={{ fontSize: 22, fontWeight: 600 }}>Smell-memo</div>
        <button onClick={() => { setSsf(false); setSsr(false) }} style={{ background: "none", border: "none", fontSize: 14, fontFamily: mn, color: TM, cursor: "pointer" }}>Lukk</button>
      </div>
      <div style={{ fontSize: 12, fontFamily: mn, color: TL, marginBottom: 6 }}>Hva trigget det?</div>
      <textarea style={{ ...ip, minHeight: 60, resize: "vertical" }} placeholder="F.eks. gikk forbi bakeriet..." value={sm.trigger} onChange={e => setSm({ ...sm, trigger: e.target.value })} />
      <div style={{ fontSize: 12, fontFamily: mn, color: TL, marginBottom: 6, marginTop: 8 }}>Hva følte du?</div>
      <textarea style={{ ...ip, minHeight: 60, resize: "vertical" }} placeholder="F.eks. stresset, lei meg..." value={sm.feeling} onChange={e => setSm({ ...sm, feeling: e.target.value })} />
      <div style={{ fontSize: 12, fontFamily: mn, color: TL, marginBottom: 6, marginTop: 8 }}>Hva ble det?</div>
      <textarea style={{ ...ip, minHeight: 60, resize: "vertical" }} placeholder="F.eks. Kvikk Lunsj og Cola..." value={sm.what} onChange={e => setSm({ ...sm, what: e.target.value })} />
      <div style={{ fontSize: 12, fontFamily: mn, color: TL, marginBottom: 6, marginTop: 8 }}>Hva kostet det? (kr)</div>
      <input type="number" style={ip} placeholder="F.eks. 65" value={sm.cost} onChange={e => setSm({ ...sm, cost: e.target.value })} />

      <div style={{ fontSize: 12, fontFamily: mn, color: TL, marginBottom: 6, marginTop: 8 }}>Dato</div>
      <button onClick={() => setSdp(!sdp)} style={{
        ...ip, textAlign: "left", cursor: "pointer", marginBottom: sdp ? 0 : 10,
        color: sd === td() ? TM : TX
      }}>{sd === td() ? "I dag" : fd(sd)}</button>
      {sdp && <div style={{ marginBottom: 10, border: `1px solid ${BD}`, borderRadius: 12, overflow: "hidden" }}>
        {[0, 1, 2, 3, 4, 5, 6].map(n =>
          <button key={n} onClick={() => { setSd(ago(n)); setSdp(false) }} style={{
            display: "block", width: "100%", padding: "12px 16px", textAlign: "left",
            background: sd === ago(n) ? PL : "none", border: "none",
            borderBottom: n < 6 ? `1px solid rgba(255,255,255,0.04)` : "none",
            fontSize: 15, fontFamily: sf, color: TX, cursor: "pointer"
          }}>{agl(n)}</button>
        )}
      </div>}

      <button onClick={async () => {
        const ok = await addSmell(sm, sd)
        if (!ok) return
        setSm({ trigger: "", feeling: "", what: "", cost: "" })
        setSd(td())
        setSsf(false)
        setSsr(false)
      }} style={{ ...bp, marginTop: 10 }}>Lagre memo</button>
    </div>
  )

  return null
}
