import { P, PL, PM, AC, SM, TM, TL, TX, BD, BG, BG2, mn, sf, bp, bsm, bgg, stt, glass, ba } from '../constants/theme'
import { DEF_GOALS, MO, ST } from '../constants/data'
import { td, fd, ago, agl } from '../utils/helpers'
import { gmq } from '../utils/helpers'
import TabBar from './TabBar'
import ErrToast from './ErrToast'

export default function Home({
  user, goals, curS, besS, ms, tR, tS, nm, mp, chk,
  hq, setHq, cd, setCd, sdp, setSdp,
  addCheckin, delCheckin, err, setErr, setScreen,
  onResist, onSmell, onOpenSettings, sc
}) {
  const rc = chk.slice(0, 5)
  const gL = (goals?.goals || []).map(g => {
    if (g.startsWith("custom:")) return g.slice(7)
    const o = DEF_GOALS.find(x => x.id === g)
    return o ? o.label : g
  })

  return (
    <div style={{ ...ba, background: `radial-gradient(ellipse at 50% 0%, rgba(124,92,252,0.08) 0%, transparent 40%), ${BG}` }}>
      <div style={{ padding: "48px 20px 24px" }} className="fade-in">
        <ErrToast err={err} setErr={setErr} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 13, fontFamily: mn, color: TL, letterSpacing: "0.15em", textTransform: "uppercase" }}>{fd(td())}</div>
          <button onClick={onOpenSettings} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={TL} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </button>
        </div>
        <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.2, marginBottom: 24 }}>Hei, {user.user_metadata?.name || user.email?.split("@")[0]}</div>

        <div style={{
          ...glass, background: `linear-gradient(135deg, rgba(124,92,252,0.12) 0%, rgba(74,222,128,0.06) 100%)`,
          border: "1px solid rgba(124,92,252,0.15)", padding: "22px", marginBottom: 16
        }}>
          <div style={{ fontSize: 17, fontWeight: 300, lineHeight: 1.6, fontStyle: "italic", marginBottom: 14, color: "rgba(255,255,255,0.85)" }}>"{hq}"</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {gL.slice(0, 2).map((g, i) =>
                <span key={i} style={{ fontSize: 10, fontFamily: mn, padding: "3px 8px", borderRadius: 20, backgroundColor: "rgba(124,92,252,0.15)", color: PM }}>{g}</span>
              )}
            </div>
            <button onClick={() => setHq(gmq(goals?.goals || [], goals?.whys || [], hq))} style={{ background: "none", border: "none", color: TL, fontSize: 10, fontFamily: mn, cursor: "pointer" }}>Nytt</button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div style={{ ...glass, textAlign: "center", padding: "24px 16px", background: `linear-gradient(180deg, rgba(124,92,252,0.1) 0%, transparent 100%)`, border: "1px solid rgba(124,92,252,0.12)" }}>
            <div style={{ fontSize: 11, fontFamily: mn, color: P, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>Streak</div>
            <div style={{ fontSize: 48, fontWeight: 700, lineHeight: 1, color: "#fff" }}>{curS}</div>
            <div style={{ fontSize: 12, color: TM, marginTop: 4 }}>dager</div>
            {besS > 0 && <div style={{ marginTop: 10, fontSize: 10, fontFamily: mn, color: TL }}>Beste: {besS}</div>}
          </div>
          <div style={{ ...glass, textAlign: "center", padding: "24px 16px", background: `linear-gradient(180deg, rgba(74,222,128,0.08) 0%, transparent 100%)`, border: "1px solid rgba(74,222,128,0.1)" }}>
            <div style={{ fontSize: 11, fontFamily: mn, color: AC, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>Spart</div>
            <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1, color: AC }}>{ms.toLocaleString("nb-NO")}</div>
            <div style={{ fontSize: 12, color: TM, marginTop: 4 }}>kroner</div>
            {nm && ms < nm.a && <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 10, fontFamily: mn, color: TL, marginBottom: 4 }}>{nm.l}</div>
              <div style={{ height: 4, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: mp + "%", background: `linear-gradient(90deg, ${P}, ${AC})`, borderRadius: 2 }} />
              </div>
            </div>}
          </div>
        </div>

        <button onClick={onResist} style={{ ...bp, marginBottom: 10 }}>Jeg motstod en fristelse</button>
        <button onClick={onSmell} style={bsm}>Jeg gikk på en smell</button>

        <div style={{ ...stt, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Kveldssjekk</span>
          <button onClick={() => setSdp(!sdp)} style={{ background: "none", border: "none", fontSize: 12, fontFamily: mn, color: P, cursor: "pointer", textTransform: "none" }}>{cd === td() ? "I dag" : fd(cd)} &#9662;</button>
        </div>

        {sdp && <div style={glass}>
          {[0, 1, 2, 3, 4, 5, 6].map(n =>
            <button key={n} onClick={() => { setCd(ago(n)); setSdp(false) }} style={{
              display: "block", width: "100%", padding: "12px 16px", textAlign: "left",
              background: cd === ago(n) ? PL : "none", border: "none",
              borderBottom: n < 6 ? `1px solid rgba(255,255,255,0.04)` : "none",
              fontSize: 15, fontFamily: sf, color: TX, cursor: "pointer",
              borderRadius: cd === ago(n) ? 8 : 0
            }}>{agl(n)}</button>
          )}
        </div>}

        <div style={glass}>
          {chk.find(c => c.date === cd) ? (
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <div style={{ fontSize: 15, color: P, fontWeight: 500 }}>{chk.find(c => c.date === cd).mood}</div>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 13, color: TL, fontFamily: mn }}>{cd === td() ? "Sees i morgen." : "Logget " + fd(cd)}</span>
                <button onClick={() => delCheckin(chk.find(c => c.date === cd).id)} style={{ background: "none", border: "none", fontSize: 12, fontFamily: mn, color: TM, cursor: "pointer", textDecoration: "underline" }}>Angre</button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 16, marginBottom: 4 }}>Hvordan ble dagen?</div>
              <div style={{ fontSize: 13, color: TM, marginBottom: 16 }}>{cd === td() ? "Kveldspuls" : fd(cd)}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {MO.map(m =>
                  <button key={m.id} onClick={() => addCheckin(cd, m.label, m.id)} style={{
                    padding: "14px 16px", borderRadius: 12, border: `1px solid ${BD}`,
                    backgroundColor: m.bg, fontSize: 15, fontFamily: sf, color: m.color,
                    cursor: "pointer", textAlign: "left", fontWeight: 500
                  }}>{m.label}</button>
                )}
              </div>
            </>
          )}
        </div>

        {rc.length > 0 && <div style={{ ...glass, padding: "16px 18px" }}>
          <div style={{ fontSize: 11, fontFamily: mn, color: TL, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>Siste dager</div>
          {rc.map((c, i) =>
            <div key={c.id || i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < rc.length - 1 ? `1px solid rgba(255,255,255,0.04)` : "none" }}>
              <span style={{ fontSize: 13, fontFamily: mn, color: TL }}>{fd(c.date)}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: c.mood_id === "good" ? P : c.mood_id === "smell" ? SM : TM }}>{c.mood}</span>
            </div>
          )}
        </div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
          <div style={glass}><div style={{ fontSize: 28, fontWeight: 700, color: P }}>{tR}</div><div style={{ fontSize: 11, fontFamily: mn, color: TL, marginTop: 4 }}>Motstått</div></div>
          <div style={glass}><div style={{ fontSize: 28, fontWeight: 700, color: SM }}>{tS}</div><div style={{ fontSize: 11, fontFamily: mn, color: TL, marginTop: 4 }}>Smell</div></div>
        </div>
      </div>
      <TabBar screen={sc} setScreen={setScreen} />
    </div>
  )
}
