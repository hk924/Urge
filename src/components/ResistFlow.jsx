import { P, PL, TM, TL, TX, AC, BD, BG, BG2, mn, sf, bp, ba, glass } from '../constants/theme'
import { CONF } from '../constants/data'
import { gmq } from '../utils/helpers'
import TriggerIcon from './TriggerIcon'
import Confetti from './Confetti'
import ErrToast from './ErrToast'

export default function ResistFlow({
  rs, setRs, st2, setSt2, cf, setCf, rq2, setRq2, lq, setLq,
  triggers, goals, addResist, curS, ms, nm, mp,
  err, setErr, onClose
}) {
  if (rs === "trigger") return (
    <div style={{ ...ba, padding: 24, paddingBottom: 32 }} className="fade-in">
      <ErrToast err={err} setErr={setErr} />
      <Confetti active={cf} onDone={() => setCf(false)} />
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 40, marginTop: 16 }}>
        <div style={{ fontSize: 22, fontWeight: 600 }}>Bra jobba!</div>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 14, fontFamily: mn, color: TM, cursor: "pointer" }}>Lukk</button>
      </div>
      <div style={{ fontSize: 16, color: TM, marginBottom: 24 }}>Hva slags fristelse var det?</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {triggers.map(t =>
          <button key={t.id} onClick={() => setSt2(t.id)} style={{
            display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", borderRadius: 14,
            border: st2 === t.id ? `2px solid ${P}` : `1px solid ${BD}`,
            backgroundColor: st2 === t.id ? PL : BG2, cursor: "pointer", textAlign: "left"
          }}>
            <TriggerIcon type={t.icon} size={22} color={st2 === t.id ? P : TM} />
            <span style={{ fontSize: 16, fontFamily: sf, color: st2 === t.id ? P : TX, fontWeight: st2 === t.id ? 600 : 400 }}>{t.label}</span>
          </button>
        )}
      </div>
      <button onClick={async () => {
        if (!st2) return
        const ok = await addResist(st2)
        if (!ok) return
        const q = gmq(goals?.goals || [], goals?.whys || [], lq)
        setRq2(q)
        setLq(q)
        if (Math.random() < CONF) setCf(true)
        setRs("reward")
      }} style={{ ...bp, marginTop: 32, opacity: st2 ? 1 : .4 }}>Registrer</button>
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
