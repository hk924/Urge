import { useState, useEffect } from 'react'
import { AC, BD, TM, TL, mn, bp, bgg } from '../constants/theme'
import { drawSummaryCard, shareImage } from '../lib/shareCard'
import { stravaText } from '../utils/workoutSummary'

export default function ShareSummary({ summary }) {
  const [img, setImg] = useState(null)
  const [msg, setMsg] = useState("")

  useEffect(() => {
    let alive = true
    drawSummaryCard(summary).then(r => { if (alive) setImg(r) }).catch(e => console.error("Card:", e))
    return () => { alive = false }
  }, [summary.date, summary.setCount, summary.minutes])

  const flash = t => { setMsg(t); setTimeout(() => setMsg(""), 2500) }
  const text = stravaText(summary)

  async function share() {
    if (!img) return
    const r = await shareImage(img.blob, `urge-${summary.date}.png`, text)
    if (r === "downloaded") flash("Bildet er lastet ned")
  }

  async function copy() {
    try { await navigator.clipboard.writeText(text); flash("Teksten er kopiert") }
    catch { flash("Kunne ikke kopiere") }
  }

  return (
    <div>
      <div style={{ borderRadius: 18, overflow: "hidden", border: `1px solid ${BD}`, aspectRatio: "4 / 5", backgroundColor: "#0a0a0f" }}>
        {img
          ? <img src={img.url} alt={`Oppsummering av ${summary.routineName}`} style={{ width: "100%", height: "100%", display: "block" }} />
          : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: TL, fontFamily: mn, fontSize: 12 }}>Lager bilde...</div>}
      </div>
      <button style={{ ...bp, marginTop: 14 }} onClick={share} disabled={!img}>Del eller lagre bilde</button>
      <button style={{ ...bgg, marginTop: 8 }} onClick={copy}>Kopier tekst til Strava</button>
      {msg && <div style={{ textAlign: "center", color: AC, fontFamily: mn, fontSize: 12, marginTop: 10 }}>{msg}</div>}
      <div style={{ fontSize: 12, color: TM, lineHeight: 1.5, marginTop: 12 }}>
        I Strava: trykk + → Legg til aktivitet manuelt → velg Vekttrening. Lim inn teksten som beskrivelse og legg til bildet.
      </div>
    </div>
  )
}
