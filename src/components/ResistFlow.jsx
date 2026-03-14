import { useState } from 'react'
import { P, PL, TM, TL, TX, AC, BD, BG, BG2, mn, sf, bp, ip, ba, glass } from '../constants/theme'
import { CONF } from '../constants/data'
import { td, fd, ago, agl, gmq } from '../utils/helpers'
import TriggerIcon from './TriggerIcon'
import Confetti from './Confetti'
import ErrToast from './ErrToast'

export default function ResistFlow({
  rs, setRs, st2, setSt2, cf, setCf, rq2, setRq2, lq, setLq,
  triggers, goals, addResist, curS, ms, nm, mp,
  err, setErr, onClose
}) {
  const [note, setNote] = useState("")
  const [rd, setRd] = useState(td())
  const [rdp, setRdp] = useState(false)

  if (rs === "trigger") return (
    <div style={{ ...ba, padding: 24, paddingBottom: 32 }} className="fade-in">
      <ErrToast err={err} setErr={setErr} />
      <Confetti active={cf} onDone={() => setCf(false)} />
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 40, marginTop: 16 }}>
        <div style={{ fontSize: 22, fontWeight: 600 }}>Bra jobba!</div>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 14, fontFamily: mn, color: TM, cursor: "pointer" }}>Lukk</button>
      </div>
      <div style={{ fontSize: 16, color: TM, marginBottom: 16 }}>Hva slags fristelse var det?</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {triggers.map(t =>
          <button key={t.id} onClick={() => setSt2(t.id)} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 20,
            border: st2 === t.id ? `2px solid ${P}` : `1px solid ${BD}`,
            backgroundColor: st2 === t.id ? PL : BG2, cursor: "pointer"
          }}>
            <TriggerIcon type={t.icon} size={16} color={st2 === t.id ? P : TM} />
            <span style={{ fontSize: 14, fontFamily: sf, color: st2 === t.id ? P : TX, fontWeight: st2 === t.id ? 600 : 400 }}>{t.label}</span>
          </button>
        )}
      </div>

      <div style={{ fontSize: 12, fontFamily: mn, color: TL, marginBottom: 6 }}>Situasjon (valgfritt)</div>
      <textarea
        style={{ ...ip, minHeight: 60, resize: "vertical" }}
        placeholder="Fortell kjapt om situasjonen..."
        value={note}
        onChange={e => setNote(e.target.value)}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, marginBottom: 4 }}>
        <div style={{ fontSize: 12, fontFamily: mn, color: TL }}>Dato</div>
        <button onClick={() => setRdp(!rdp)} style={{ background: "none", border: "none", fontSize: 12, fontFamily: mn, color: P, cursor: "pointer" }}>{rd === td() ? "I dag" : fd(rd)} &#9662;</button>
      </div>
      {rdp && <div style={glass}>
        {[0, 1, 2, 3, 4, 5, 6].map(n =>
          <button key={n} onClick={() => { setRd(ago(n)); setRdp(false) }} style={{
            display: "block", width: "100%", padding: "12px 16px", textAlign: "left",
            background: rd === ago(n) ? PL : "none", border: "none",
            borderBottom: n < 6 ? "1px solid rgba(255,255,255,0.04)" : "none",
            fontSize: 15, fontFamily: sf, color: TX, cursor: "pointer",
            borderRadius: rd === ago(n) ? 8 : 0
          }}>{agl(n)}</button>
        )}
      </div>}

      <button onClick={async () => {
        if (!st2) return
        const ok = await addResist(st2, note, rd)
        if (!ok) return
        const q = gmq(goals?.goals || [], goals?.whys || [], lq)
        setRq2(q)
        setLq(q)
        if (Math.random() < CONF) setCf(true)
        setRs("reward")
      }} style={{ ...bp, marginTop: 20, opacity: st2 ? 1 : .4 }}>Registrer</button>
    </div>
  )

  if (rs === "reward") return (
    <div style={{
      ...ba, display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: 32, textAlign: "center",
      background: `radial-gradient(ellipse at 50% 30%, rgba(124,92,252,0.2) 0%, transparent 60%), ${BG}`
    }} className="fade-in">
      <Confetti active={cf} onDone={() => setCf(false)} />
      <div style={{
        width: 88, height: 88, borderRadius: 24,
        background: `linear-gradient(135deg, ${P}, ${AC})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 32, boxShadow: `0 8px 40px rgba(124,92,252,0.4)`
      }}>
        <svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <div style={{ fontSize: 13, fontFamily: mn, color: P, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 16 }}>Fristelse motstått</div>
      <div style={{ fontSize: 64, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{curS}</div>
      <div style={{ fontSize: 15, fontWeight: 300, color: TM, marginBottom: 32 }}>dager i strekk</div>
      <div style={{ fontSize: 20, fontWeight: 300, lineHeight: 1.6, maxWidth: 300, marginBottom: 32, fontStyle: "italic", color: "rgba(255,255,255,0.8)" }}>"{rq2}"</div>
      <div style={{
        ...glass, width: "100%", maxWidth: 300, textAlign: "center",
        background: `linear-gradient(135deg, rgba(124,92,252,0.15), rgba(74,222,128,0.08))`,
        border: "1px solid rgba(124,92,252,0.2)"
      }}>
        <div style={{ fontSize: 11, fontFamily: mn, color: P, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 4 }}>Spart totalt</div>
        <div style={{ fontSize: 32, fontWeight: 700, color: AC }}>{ms.toLocaleString("nb-NO")} kr</div>
        <div style={{ fontSize: 13, color: TM, marginTop: 8 }}>Neste: {nm?.l || "Alle nådd!"}</div>
        <div style={{ height: 6, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden", marginTop: 8 }}>
          <div style={{ height: "100%", width: mp + "%", background: `linear-gradient(90deg, ${P}, ${AC})`, borderRadius: 3 }} />
        </div>
      </div>
      <button onClick={onClose} style={{ ...bp, marginTop: 32, maxWidth: 300 }}>Tilbake</button>
    </div>
  )

  return null
}
