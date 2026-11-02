import { useState, useMemo } from 'react'
import { P, PL, AC, SM, BD, TX, TM, TL, mn, glass, bp, bgg, ba, stt } from '../constants/theme'
import { EXERCISE_BY_ID } from '../constants/exercises'
import { ROUTINES, BLOCK_WEEKS, buildPlan, nextRoutine, getBlock, getBlockWeek } from '../constants/program'
import { exerciseHistory, personalRecord, formatSets, metricUnit } from '../utils/progression'
import { td, fd } from '../utils/helpers'
import { ExerciseImages, ExerciseSteps } from './ExerciseVisual'
import Chart from './Chart'
import TabBar from './TabBar'

const fmt = n => String(Math.round(n * 10) / 10).replace(".", ",")

function ExerciseProgress({ ex, training, onBack }) {
  const hist = exerciseHistory(ex, training.sets, training.sessions)
  const pr = personalRecord(ex, training.sets)
  const unit = metricUnit(ex)
  const first = hist[0], last = hist[hist.length - 1]
  return (
    <div style={{ padding: "40px 20px 24px" }} className="fade-in">
      <button onClick={onBack} style={{ background: "none", border: "none", color: TM, fontFamily: mn, fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 16 }}>← Tilbake</button>
      <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 14 }}>{ex.name}</div>
      <ExerciseImages ex={ex} />
      <ExerciseSteps ex={ex} collapsible={false} />

      <div style={stt}>Fremgang</div>
      <div style={glass}>
        {hist.length >= 2 && <div style={{ fontSize: 14, color: AC, marginBottom: 6 }}>
          {last.v > first.v ? `+${fmt(last.v - first.v)} ${unit} siden første økt` : `${hist.length} økter logget`}
        </div>}
        <Chart data={hist.map(h => ({ date: h.date, v: h.v }))} sx={` ${unit}`} color={P} />
      </div>

      {pr && <div style={{ ...glass, border: "1px solid rgba(74,222,128,0.2)" }}>
        <div style={{ fontSize: 10, fontFamily: mn, color: AC, textTransform: "uppercase", marginBottom: 6 }}>Rekord</div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>
          {ex.kind === "weight" ? `${fmt(Number(pr.weight_kg))} kg × ${pr.reps}` : ex.kind === "reps" ? `${pr.reps} reps` : `${pr.seconds} sek`}
        </div>
      </div>}

      {hist.length > 0 && <>
        <div style={stt}>Historikk</div>
        <div style={glass}>
          {[...hist].reverse().map((h, i) =>
            <div key={h.sessionId} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < hist.length - 1 ? `1px solid rgba(255,255,255,0.05)` : "none" }}>
              <span style={{ fontSize: 13, fontFamily: mn, color: TL }}>{fd(h.date)}</span>
              <span style={{ fontSize: 14 }}>{formatSets(ex, h.sets)}</span>
            </div>
          )}
        </div>
      </>}
    </div>
  )
}

function SessionDetail({ session, training, onBack }) {
  const [confirm, setConfirm] = useState(false)
  const mine = training.sets.filter(s => s.session_id === session.id)
  const exIds = [...new Set(mine.map(s => s.exercise_id))]
  return (
    <div style={{ padding: "40px 20px 24px" }} className="fade-in">
      <button onClick={onBack} style={{ background: "none", border: "none", color: TM, fontFamily: mn, fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 16 }}>← Tilbake</button>
      <div style={{ fontSize: 26, fontWeight: 700 }}>{ROUTINES[session.routine]?.name}</div>
      <div style={{ fontSize: 13, fontFamily: mn, color: TL, marginBottom: 20 }}>{fd(session.date)} · {mine.length} sett</div>
      <div style={glass}>
        {exIds.map((id, i) => {
          const ex = EXERCISE_BY_ID[id]
          if (!ex) return null
          const ss = mine.filter(s => s.exercise_id === id).sort((a, b) => a.set_no - b.set_no)
          return (
            <div key={id} style={{ padding: "10px 0", borderBottom: i < exIds.length - 1 ? `1px solid rgba(255,255,255,0.05)` : "none" }}>
              <div style={{ fontSize: 15 }}>{ex.name}</div>
              <div style={{ fontSize: 12, fontFamily: mn, color: TL }}>{formatSets(ex, ss)}{ss[0]?.effort ? ` · ${ss[0].effort}` : ""}</div>
            </div>
          )
        })}
        {!exIds.length && <div style={{ color: TM, fontSize: 14 }}>Ingen sett logget.</div>}
      </div>
      {!confirm
        ? <button style={{ ...bgg, color: SM }} onClick={() => setConfirm(true)}>Slett økta</button>
        : <button style={{ ...bgg, color: SM, borderColor: SM }} onClick={async () => { if (await training.deleteSession(session.id)) onBack() }}>Trykk igjen for å slette</button>}
    </div>
  )
}

export default function Training({ training, onStart, onResume, sc, setScreen }) {
  const { sessions, sets, loaded } = training
  const [view, setView] = useState(null) // { type: 'exercise', id } | { type: 'session', id }
  const [pick, setPick] = useState(null)
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  const today = td()
  const firstDate = useMemo(() => sessions.length ? sessions.map(s => s.date).sort()[0] : null, [sessions])
  const block = getBlock(firstDate, today)
  const week = getBlockWeek(firstDate, today)
  const active = sessions.find(s => !s.finished_at)
  const suggested = nextRoutine(sessions)
  const routineId = pick || suggested
  const routine = ROUTINES[routineId]
  const finished = sessions.filter(s => s.finished_at)
  const plan = buildPlan(routineId, block, finished.length)

  const tracked = useMemo(() => {
    const ids = []
    for (const r of Object.values(ROUTINES)) for (const s of r.slots) ids.push(s.variants[block])
    return ids.map(id => EXERCISE_BY_ID[id])
  }, [block])

  if (view?.type === "exercise") return (
    <div style={ba}><ExerciseProgress ex={EXERCISE_BY_ID[view.id]} training={training} onBack={() => setView(null)} /><TabBar screen={sc} setScreen={setScreen} /></div>
  )
  if (view?.type === "session") {
    const s = sessions.find(x => x.id === view.id)
    if (s) return <div style={ba}><SessionDetail session={s} training={training} onBack={() => setView(null)} /><TabBar screen={sc} setScreen={setScreen} /></div>
  }

  return (
    <div style={ba} className="fade-in">
      <div style={{ padding: "48px 20px 24px" }}>
        <div style={{ fontSize: 26, fontWeight: 700 }}>Trening</div>
        <div style={{ fontSize: 12, fontFamily: mn, color: TL, marginTop: 4, marginBottom: 20 }}>
          Blokk {block + 1} · uke {week} av {BLOCK_WEEKS} · {finished.length} økter totalt
        </div>

        {!loaded && <div style={{ color: TL, fontFamily: mn, fontSize: 13 }}>Laster...</div>}

        {loaded && active && <div style={{ ...glass, border: "1px solid rgba(124,92,252,0.3)", background: PL }}>
          <div style={{ fontSize: 11, fontFamily: mn, color: P, textTransform: "uppercase", marginBottom: 6 }}>Økt i gang</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 14 }}>{ROUTINES[active.routine]?.name} · {fd(active.date)}</div>
          <button style={{ ...bp, marginBottom: 8 }} onClick={() => onResume(active)}>Fortsett økta</button>
          {!confirmDiscard
            ? <button style={{ ...bgg, color: SM }} onClick={() => setConfirmDiscard(true)}>Forkast</button>
            : <button style={{ ...bgg, color: SM, borderColor: SM }} onClick={() => { training.deleteSession(active.id); setConfirmDiscard(false) }}>Trykk igjen for å forkaste</button>}
        </div>}

        {loaded && !active && <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            {Object.values(ROUTINES).map(r =>
              <button key={r.id} onClick={() => setPick(r.id)} style={{
                ...glass, marginBottom: 0, textAlign: "left", cursor: "pointer", color: TX,
                border: `1px solid ${routineId === r.id ? "rgba(124,92,252,0.5)" : "rgba(255,255,255,0.06)"}`,
                background: routineId === r.id ? PL : glass.backgroundColor
              }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{r.name}</div>
                <div style={{ fontSize: 13, color: TM }}>{r.subtitle}</div>
                {r.id === suggested && <div style={{ fontSize: 10, fontFamily: mn, color: AC, marginTop: 6, textTransform: "uppercase" }}>Neste</div>}
              </button>
            )}
          </div>
          <div style={glass}>
            <div style={{ fontSize: 11, fontFamily: mn, color: TL, textTransform: "uppercase", marginBottom: 10 }}>{routine.name} · ca. 30 min</div>
            <div style={{ fontSize: 13, color: TM, marginBottom: 8 }}>5 min oppvarming</div>
            {plan.main.map(m =>
              <div key={m.exerciseId} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 15 }}>
                <span>{EXERCISE_BY_ID[m.exerciseId].name}</span><span style={{ fontFamily: mn, fontSize: 12, color: TL }}>{m.sets} sett</span>
              </div>
            )}
            <div style={{ fontSize: 13, color: TM, marginTop: 8 }}>Kjerne: {plan.core.map(c => EXERCISE_BY_ID[c.exerciseId].name).join(", ")}</div>
            <button style={{ ...bp, marginTop: 16 }} onClick={() => onStart(routineId, block, plan)}>Start {routine.name}</button>
          </div>
        </>}

        <div style={stt}>Fremgang</div>
        <div style={glass}>
          {tracked.map((ex, i) => {
            const hist = exerciseHistory(ex, sets, sessions)
            const lastH = hist[hist.length - 1]
            const gain = hist.length >= 2 ? lastH.v - hist[0].v : 0
            return (
              <button key={ex.id} onClick={() => setView({ type: "exercise", id: ex.id })} style={{
                display: "flex", width: "100%", alignItems: "center", gap: 10, padding: "10px 0", background: "none", border: "none", color: TX, cursor: "pointer", textAlign: "left",
                borderBottom: i < tracked.length - 1 ? `1px solid rgba(255,255,255,0.05)` : "none"
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15 }}>{ex.name}</div>
                  <div style={{ fontSize: 12, fontFamily: mn, color: TL }}>{lastH ? formatSets(ex, lastH.sets) : "Ikke trent ennå"}</div>
                </div>
                {gain > 0 && <span style={{ fontSize: 12, fontFamily: mn, color: AC }}>+{fmt(gain)} {metricUnit(ex)}</span>}
                <span style={{ color: TL }}>›</span>
              </button>
            )
          })}
        </div>

        {finished.length > 0 && <>
          <div style={stt}>Historikk</div>
          <div style={glass}>
            {finished.slice(0, 15).map((s, i, arr) =>
              <button key={s.id} onClick={() => setView({ type: "session", id: s.id })} style={{
                display: "flex", width: "100%", justifyContent: "space-between", padding: "10px 0", background: "none", border: "none", color: TX, cursor: "pointer",
                borderBottom: i < arr.length - 1 ? `1px solid rgba(255,255,255,0.05)` : "none"
              }}>
                <span style={{ fontSize: 15 }}>{ROUTINES[s.routine]?.name}</span>
                <span style={{ fontSize: 12, fontFamily: mn, color: TL }}>{fd(s.date)} · {sets.filter(x => x.session_id === s.id).length} sett</span>
              </button>
            )}
          </div>
        </>}
      </div>
      <TabBar screen={sc} setScreen={setScreen} />
    </div>
  )
}
