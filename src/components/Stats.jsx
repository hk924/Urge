import { P, AC, SM, TM, TL, TX, BD, mn, glass, ba } from '../constants/theme'
import TriggerIcon from './TriggerIcon'
import TabBar from './TabBar'

export default function Stats({ curS, besS, tR, tS, ms, smellCost, milestones, tc, sc, setScreen }) {
  return (
    <div style={ba} className="fade-in">
      <div style={{ padding: "48px 20px 24px" }}>
        <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 24 }}>Statistikk</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={glass}><div style={{ fontSize: 32, fontWeight: 700, color: P }}>{curS}</div><div style={{ fontSize: 11, fontFamily: mn, color: TL }}>Streak</div></div>
          <div style={glass}><div style={{ fontSize: 32, fontWeight: 700 }}>{besS}</div><div style={{ fontSize: 11, fontFamily: mn, color: TL }}>Beste</div></div>
          <div style={glass}><div style={{ fontSize: 32, fontWeight: 700, color: AC }}>{tR}</div><div style={{ fontSize: 11, fontFamily: mn, color: TL }}>Motstått</div></div>
          <div style={glass}><div style={{ fontSize: 32, fontWeight: 700, color: SM }}>{tS}</div><div style={{ fontSize: 11, fontFamily: mn, color: TL }}>Smell</div></div>
        </div>

        <div style={{
          ...glass, background: `linear-gradient(135deg, rgba(74,222,128,0.08), rgba(124,92,252,0.05))`,
          border: "1px solid rgba(74,222,128,0.1)", marginTop: 12
        }}>
          <div style={{ fontSize: 11, fontFamily: mn, color: AC, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 8 }}>Penger spart</div>
          <div style={{ fontSize: 40, fontWeight: 700, color: AC }}>{ms.toLocaleString("nb-NO")} kr</div>
          <div style={{ fontSize: 13, color: TM, marginTop: 8 }}>{tR} x {smellCost} kr</div>
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 10, fontFamily: mn, color: TL, marginBottom: 10, textTransform: "uppercase" }}>Milestones</div>
            {milestones.map((m, i) => {
              const r = ms >= m.a
              const p = Math.min((ms / m.a) * 100, 100)
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: r ? `linear-gradient(135deg, ${P}, ${AC})` : "transparent",
                    border: r ? "none" : `1px solid ${BD}`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                  }}>
                    {r && <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                      <span style={{ color: r ? AC : TX, fontWeight: r ? 600 : 400 }}>{m.l}</span>
                      <span style={{ fontFamily: mn, fontSize: 11, color: TL }}>{m.a.toLocaleString("nb-NO")} kr</span>
                    </div>
                    {!r && <div style={{ height: 3, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: p + "%", background: `linear-gradient(90deg, ${P}, ${AC})`, borderRadius: 2 }} />
                    </div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ ...glass, marginTop: 12 }}>
          <div style={{ fontSize: 11, fontFamily: mn, color: TL, textTransform: "uppercase", marginBottom: 16 }}>Triggere</div>
          {tc.sort((a, b) => b.rc - a.rc).map((t, i) =>
            <div key={t.id} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
              borderBottom: i < tc.length - 1 ? `1px solid rgba(255,255,255,0.04)` : "none"
            }}>
              <TriggerIcon type={t.icon} size={18} color={TM} />
              <span style={{ fontSize: 15, flex: 1 }}>{t.label}</span>
              <span style={{ fontSize: 11, fontFamily: mn, color: P, marginRight: 8 }}>{t.rc}</span>
              <span style={{ fontSize: 11, fontFamily: mn, color: SM }}>{t.sc}</span>
            </div>
          )}
        </div>
      </div>
      <TabBar screen={sc} setScreen={setScreen} />
    </div>
  )
}
