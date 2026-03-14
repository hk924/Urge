import { P, AC, SM, TM, TL, TX, BD, mn, glass, ba } from '../constants/theme'
import { STREAK_LEVELS } from '../constants/data'
import TriggerIcon from './TriggerIcon'
import FlameIcon from './FlameIcon'
import TabBar from './TabBar'

function StreakBadgeSection({ curS, besS, weekData }) {
  const level = [...STREAK_LEVELS].reverse().find(l => curS >= l.min) || STREAK_LEVELS[0]
  const nextLevel = STREAK_LEVELS.find(l => l.min > curS)
  const isSlip = curS === 0
  const todayHasActivity = weekData.some(d => d.isToday && (d.hasResist || d.hasCheckin))

  const milestoneDefs = [
    { label: "7 dager", completed: besS >= 7, active: curS > 0 && curS < 7 },
    { label: "Aktiv", completed: todayHasActivity, active: false },
    { label: "30 dager", completed: besS >= 30, active: curS >= 7 && curS < 30 },
    { label: "100 dager", completed: besS >= 100, active: curS >= 30 && curS < 100 },
  ]

  return (
    <div style={{ ...glass, textAlign: "center", padding: "28px 20px 24px", marginBottom: 16 }}>
      {/* Diamond badge */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
        <div style={{
          width: 80, height: 80, position: "relative",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          {/* Outer diamond - glass */}
          <div style={{
            width: 72, height: 72,
            transform: "rotate(45deg)",
            background: "rgba(124,92,252,0.1)",
            border: "1px solid rgba(124,92,252,0.25)",
            borderRadius: 14,
            position: "absolute",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }} />
          {/* Middle diamond */}
          <div style={{
            width: 50, height: 50,
            transform: "rotate(45deg)",
            background: "rgba(124,92,252,0.2)",
            border: "1px solid rgba(124,92,252,0.35)",
            borderRadius: 10,
            position: "absolute",
          }} />
          {/* Inner diamond - golden */}
          <div style={{
            width: 30, height: 30,
            transform: "rotate(45deg)",
            background: "linear-gradient(135deg, #f5c842, #e6a817)",
            borderRadius: 7,
            position: "absolute",
            boxShadow: "0 2px 12px rgba(245,200,66,0.35)",
          }} />
        </div>
      </div>

      {/* Level pill */}
      <div style={{
        display: "inline-block",
        padding: "4px 14px",
        borderRadius: 20,
        background: isSlip ? "rgba(255,255,255,0.06)" : "rgba(124,92,252,0.15)",
        border: `1px solid ${isSlip ? "rgba(255,255,255,0.1)" : "rgba(124,92,252,0.3)"}`,
        fontSize: 11,
        fontFamily: mn,
        color: isSlip ? TM : P,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        marginBottom: 14,
      }}>
        {isSlip ? "Ny start" : level.label}
      </div>

      {/* Streak count */}
      {isSlip ? (
        <>
          <div style={{ fontSize: 24, fontWeight: 700, color: TX, marginBottom: 4 }}>En ny start</div>
          <div style={{ fontSize: 14, color: TM }}>Du klarer dette! Én dag om gangen.</div>
        </>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 8 }}>
            <span style={{ fontSize: 44, fontWeight: 700, color: TX }}>{curS}</span>
            <span style={{ fontSize: 16, color: TM }}>dager i strekk!</span>
          </div>
          <div style={{ fontSize: 13, color: TL, marginTop: 4 }}>
            {nextLevel ? `Fortsett slik for å nå ${nextLevel.label}` : "Du er på høyeste nivå!"}
          </div>
        </>
      )}

      {/* Week overview */}
      <div style={{
        display: "flex", justifyContent: "center", gap: 8,
        marginTop: 22, marginBottom: 20,
      }}>
        {weekData.map(d => {
          const active = d.hasResist || d.hasCheckin
          const smelled = d.hasSmell && !active
          return (
            <div key={d.date} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: active ? "rgba(74,222,128,0.12)" :
                  smelled ? "rgba(176,124,195,0.12)" : "transparent",
                border: d.isToday ? `2px solid ${P}` :
                  d.isFuture ? `1px dashed ${BD}` :
                  active ? `1px solid rgba(74,222,128,0.25)` :
                  smelled ? `1px solid rgba(176,124,195,0.25)` :
                  `1px solid ${BD}`,
                opacity: d.isFuture ? 0.4 : 1,
              }}>
                {active && <FlameIcon size={16} color={AC} />}
                {smelled && <FlameIcon size={16} color={SM} />}
              </div>
              <span style={{
                fontSize: 10, fontFamily: mn,
                color: d.isToday ? P : TL,
                fontWeight: d.isToday ? 600 : 400,
              }}>{d.day}</span>
            </div>
          )
        })}
      </div>

      {/* Milestone badges */}
      <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
        {milestoneDefs.map(m => (
          <div key={m.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: m.completed ? `linear-gradient(135deg, ${AC}, #22c55e)` :
                m.active ? `linear-gradient(135deg, ${P}, #6344d0)` : "transparent",
              border: m.completed ? "none" :
                m.active ? "none" : `1.5px dashed ${BD}`,
              boxShadow: m.completed ? "0 2px 8px rgba(74,222,128,0.25)" :
                m.active ? "0 2px 8px rgba(124,92,252,0.25)" : "none",
            }}>
              {m.completed ? (
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : m.active ? (
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />
              ) : (
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: BD }} />
              )}
            </div>
            <span style={{
              fontSize: 9, fontFamily: mn,
              color: m.completed ? AC : m.active ? P : TL,
            }}>{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Stats({ curS, besS, tR, tS, ms, smellCost, milestones, tc, weekData, sc, setScreen }) {
  return (
    <div style={ba} className="fade-in">
      <div style={{ padding: "48px 20px 24px" }}>
        <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 24 }}>Statistikk</div>

        <StreakBadgeSection curS={curS} besS={besS} weekData={weekData} />

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
          {[...tc].sort((a, b) => b.rc - a.rc).map((t, i) =>
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
