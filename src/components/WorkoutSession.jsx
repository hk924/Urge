import { useState, useEffect, useMemo, useRef } from 'react'
import { P, PL, AC, SM, BG2, BD, TX, TM, TL, mn, glass, bp, bgg, ba } from '../constants/theme'
import { EXERCISE_BY_ID } from '../constants/exercises'
import { ROUTINES, REST_SECONDS } from '../constants/program'
import { lastPerformance, suggest, formatSets, isNewRecord } from '../utils/progression'
import { buildSummary } from '../utils/workoutSummary'
import ShareSummary from './ShareSummary'
import { ExerciseImages, ExerciseSteps } from './ExerciseVisual'
import Confetti from './Confetti'

const fmtKg = n => String(Math.round(n * 10) / 10).replace(".", ",")
const mmss = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`

// Flatten the plan into a list of steps
function buildItems(plan) {
  return [
    ...plan.warmup.map((id, i) => ({ phase: "warmup", exerciseId: id, idx: i, of: plan.warmup.length })),
    ...plan.main.map((m, i) => ({ phase: "main", exerciseId: m.exerciseId, sets: m.sets, idx: i, of: plan.main.length })),
    ...plan.core.map((c, i) => ({ phase: "core", exerciseId: c.exerciseId, sets: c.sets, idx: i, of: plan.core.length })),
  ]
}

const PHASE_LABEL = { warmup: "Oppvarming", main: "Hoveddel", core: "Kjerne" }

function Stepper({ value, onChange, step, min = 0, unit, format = v => v }) {
  const btn = { width: 44, height: 44, borderRadius: 12, border: `1px solid ${BD}`, backgroundColor: BG2, color: TX, fontSize: 22, cursor: "pointer" }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button aria-label="Mindre" style={btn} onClick={() => onChange(Math.max(min, Math.round((value - step) * 10) / 10))}>−</button>
      <div style={{ minWidth: 64, textAlign: "center" }}>
        <div style={{ fontSize: 26, fontWeight: 700 }}>{format(value)}</div>
        <div style={{ fontSize: 10, fontFamily: mn, color: TL, textTransform: "uppercase" }}>{unit}</div>
      </div>
      <button aria-label="Mer" style={btn} onClick={() => onChange(Math.round((value + step) * 10) / 10)}>+</button>
    </div>
  )
}

function useCountdown(running, onDone) {
  const [left, setLeft] = useState(0)
  const doneRef = useRef(onDone)
  doneRef.current = onDone
  useEffect(() => {
    if (!running) return
    const t = setInterval(() => setLeft(l => {
      if (l <= 1) { clearInterval(t); setTimeout(() => doneRef.current?.(), 0); return 0 }
      return l - 1
    }), 1000)
    return () => clearInterval(t)
  }, [running])
  return [left, setLeft]
}

function RestOverlay({ seconds, onDone }) {
  const [left, setLeft] = useCountdown(true, onDone)
  useEffect(() => { setLeft(seconds) }, [])
  return (
    <div style={{ ...glass, textAlign: "center", marginTop: 16, border: `1px solid rgba(124,92,252,0.25)` }}>
      <div style={{ fontSize: 11, fontFamily: mn, color: P, textTransform: "uppercase", letterSpacing: "0.12em" }}>Pause</div>
      <div style={{ fontSize: 48, fontWeight: 700, margin: "6px 0" }}>{mmss(left)}</div>
      <div style={{ fontSize: 14, color: TM, lineHeight: 1.5, marginBottom: 14 }}>Pust rolig. Du skal kunne snakke hele økta.</div>
      <button onClick={onDone} style={{ ...bgg, padding: "12px 20px" }}>Hopp over pausen</button>
    </div>
  )
}

function EffortPicker({ onPick }) {
  const opts = [
    ["lett", "Lett", "Kunne tatt mange flere"],
    ["passe", "Passe", "Kjente det, men kunne snakke"],
    ["tungt", "Tungt", "Andpusten eller slet"],
  ]
  return (
    <div style={{ ...glass, marginTop: 16 }}>
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Hvordan kjentes det?</div>
      <div style={{ fontSize: 13, color: TM, marginBottom: 14 }}>Dette bestemmer forslaget til neste gang.</div>
      {opts.map(([id, label, desc]) =>
        <button key={id} onClick={() => onPick(id)} style={{
          display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", marginBottom: 8,
          borderRadius: 12, border: `1px solid ${id === "passe" ? "rgba(124,92,252,0.4)" : BD}`, backgroundColor: id === "passe" ? PL : BG2,
          color: TX, cursor: "pointer", textAlign: "left"
        }}>
          <span style={{ fontSize: 16, fontWeight: 600 }}>{label}</span>
          <span style={{ fontSize: 12, color: TM }}>{desc}</span>
        </button>
      )}
    </div>
  )
}

function WarmupStep({ ex, onNext }) {
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const [left, setLeft] = useCountdown(running, () => { setRunning(false); setDone(true) })
  useEffect(() => { setLeft(ex.seconds); setRunning(false); setDone(false) }, [ex.id])
  return (
    <>
      <ExerciseImages ex={ex} />
      <ExerciseSteps ex={ex} collapsible={false} />
      <div style={{ textAlign: "center", margin: "18px 0" }}>
        <div style={{ fontSize: 56, fontWeight: 700, color: done ? AC : TX }}>{mmss(left)}</div>
      </div>
      {!done
        ? <button style={bp} onClick={() => setRunning(r => !r)}>{running ? "Pause" : left < ex.seconds ? "Fortsett" : "Start"}</button>
        : <button style={bp} onClick={onNext}>Neste</button>}
      {!done && <button style={{ ...bgg, marginTop: 10 }} onClick={onNext}>Hopp over</button>}
    </>
  )
}

function StrengthStep({ ex, item, session, training, onNext }) {
  const { sets, sessions } = training
  const last = useMemo(() => lastPerformance(ex.id, sets, sessions, session.id), [ex.id, session.id])
  const sug = useMemo(() => suggest(ex, last), [ex.id, last])
  const today = sets.filter(s => s.session_id === session.id && s.exercise_id === ex.id).sort((a, b) => a.set_no - b.set_no)
  const [weight, setWeight] = useState(sug.weight ?? 0)
  const [reps, setReps] = useState(sug.reps ?? 0)
  const [secs, setSecs] = useState(sug.seconds ?? 0)
  const [resting, setResting] = useState(false)
  const [record, setRecord] = useState(false)
  const [busy, setBusy] = useState(false)
  const [timing, setTiming] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const allDone = today.length >= item.sets
  const asking = allDone && !resting

  useEffect(() => {
    if (!timing) return
    const t = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(t)
  }, [timing])

  async function log(values) {
    setBusy(true)
    const saved = await training.logSet(session.id, ex.id, today.length + 1, values)
    setBusy(false)
    if (!saved) return
    setRecord(isNewRecord(ex, saved, sets))
    if (today.length + 1 < item.sets) setResting(true)
  }

  async function pickEffort(e) {
    await training.setEffort(session.id, ex.id, e)
    onNext()
  }

  return (
    <>
      <ExerciseImages ex={ex} height={170} />
      <ExerciseSteps ex={ex} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
        <div style={{ ...glass, padding: 14, marginBottom: 0 }}>
          <div style={{ fontSize: 10, fontFamily: mn, color: TL, textTransform: "uppercase", marginBottom: 6 }}>Sist</div>
          <div style={{ fontSize: 14 }}>{last ? formatSets(ex, last.sets) : "Første gang"}</div>
        </div>
        <div style={{ ...glass, padding: 14, marginBottom: 0, border: "1px solid rgba(74,222,128,0.2)" }}>
          <div style={{ fontSize: 10, fontFamily: mn, color: AC, textTransform: "uppercase", marginBottom: 6 }}>I dag</div>
          <div style={{ fontSize: 14 }}>
            {ex.kind === "time" ? `${item.sets} × ${sug.seconds}s` : ex.kind === "reps" ? `${item.sets} × ${sug.reps} reps` : `${item.sets} × ${sug.reps} · ${fmtKg(sug.weight)} kg`}
          </div>
          <div style={{ fontSize: 11, color: AC, marginTop: 4 }}>{sug.note}</div>
        </div>
      </div>

      {today.length > 0 && <div style={{ marginTop: 16 }}>
        {today.map(s =>
          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
            <span style={{ width: 22, height: 22, borderRadius: 11, background: `linear-gradient(135deg, ${P}, ${AC})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
            </span>
            <span style={{ flex: 1, fontSize: 15 }}>Sett {s.set_no}</span>
            <span style={{ fontFamily: mn, fontSize: 13, color: TM }}>
              {ex.kind === "time" ? `${s.seconds}s` : ex.kind === "reps" ? `${s.reps} reps` : `${s.reps} × ${fmtKg(Number(s.weight_kg))} kg`}
            </span>
            <button onClick={() => training.deleteSet(s.id)} aria-label="Slett sett" style={{ background: "none", border: "none", color: TL, cursor: "pointer", fontSize: 18 }}>×</button>
          </div>
        )}
      </div>}

      {record && <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 12, backgroundColor: "rgba(74,222,128,0.1)", color: AC, fontSize: 14, fontWeight: 600 }}>Ny rekord på {ex.name.toLowerCase()}!</div>}

      {resting && <RestOverlay seconds={ex.kind === "weight" ? REST_SECONDS : 30} onDone={() => setResting(false)} />}

      {!resting && !allDone && <div style={{ ...glass, marginTop: 16 }}>
        <div style={{ fontSize: 11, fontFamily: mn, color: TL, textTransform: "uppercase", marginBottom: 14 }}>Sett {today.length + 1} av {item.sets}</div>
        {ex.kind === "time" ? <>
          <div style={{ textAlign: "center", fontSize: 48, fontWeight: 700, marginBottom: 6, color: timing && elapsed >= secs ? AC : TX }}>{mmss(timing || elapsed ? elapsed : secs)}</div>
          <div style={{ textAlign: "center", fontSize: 12, color: TM, marginBottom: 14 }}>Mål: {secs} sek</div>
          {!timing
            ? <button style={bp} onClick={() => { setElapsed(0); setTiming(true) }}>Start</button>
            : <button style={bp} disabled={busy} onClick={() => { setTiming(false); log({ seconds: elapsed }); setElapsed(0) }}>Ferdig</button>}
        </> : <>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, marginBottom: 16 }}>
            {ex.kind === "weight" && <Stepper value={weight} onChange={setWeight} step={ex.inc >= 2 ? 1 : 0.5} min={0.5} unit="kg per manual" format={fmtKg} />}
            <Stepper value={reps} onChange={setReps} step={1} min={1} unit="repetisjoner" />
          </div>
          <button style={bp} disabled={busy} onClick={() => log(ex.kind === "weight" ? { reps, weight_kg: weight } : { reps })}>Logg sett {today.length + 1}</button>
        </>}
      </div>}

      {asking && <EffortPicker onPick={pickEffort} />}
      {!asking && <button style={{ ...bgg, marginTop: 10 }} onClick={onNext}>Hopp over øvelsen</button>}
    </>
  )
}

function Summary({ session, training, onDone }) {
  const [cf, setCf] = useState(true)
  const summary = useMemo(() => buildSummary(session, training.sets, training.sessions), [session.id, session.finished_at])
  return (
    <div style={{ padding: "48px 20px 32px" }} className="fade-in">
      <Confetti active={cf} onDone={() => setCf(false)} />
      <div style={{ fontSize: 13, fontFamily: mn, color: AC, textTransform: "uppercase", letterSpacing: "0.12em" }}>Økt fullført</div>
      <div style={{ fontSize: 30, fontWeight: 700, margin: "8px 0 4px" }}>Bra jobba!</div>
      <div style={{ fontSize: 15, color: TM, marginBottom: 20 }}>
        {summary.minutes} min · {summary.setCount} sett{summary.improved ? ` · fremgang på ${summary.improved} ${summary.improved === 1 ? "øvelse" : "øvelser"}` : ""}
      </div>
      <ShareSummary summary={summary} />
      <button style={{ ...bgg, marginTop: 16 }} onClick={onDone}>Ferdig</button>
    </div>
  )
}

export default function WorkoutSession({ session, training, onExit }) {
  const items = useMemo(() => buildItems(session.plan), [session.id])
  const routine = ROUTINES[session.routine]

  // Resume: skip warm-up and finished exercises if sets already exist
  const [pos, setPos] = useState(() => {
    const mine = training.sets.filter(s => s.session_id === session.id)
    if (!mine.length) return 0
    const i = items.findIndex(it => it.phase !== "warmup" && mine.filter(s => s.exercise_id === it.exerciseId).length < it.sets)
    return i === -1 ? items.length : i
  })
  const [confirmExit, setConfirmExit] = useState(false)
  const [finished, setFinished] = useState(false)

  const item = items[pos]
  const ex = item && EXERCISE_BY_ID[item.exerciseId]
  const next = () => { window.scrollTo(0, 0); setPos(p => p + 1) }

  async function finish() {
    await training.finishSession(session.id)
    setFinished(true)
  }

  useEffect(() => { if (pos >= items.length && !finished) finish() }, [pos])

  if (finished || pos >= items.length) return (
    <div style={ba}><Summary session={session} training={training} onDone={onExit} /></div>
  )

  return (
    <div style={{ ...ba, paddingBottom: 40 }}>
      <div style={{ padding: "40px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontFamily: mn, color: TL, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {routine?.name} · {PHASE_LABEL[item.phase]} {item.idx + 1}/{item.of}
          </div>
          <button onClick={() => setConfirmExit(true)} style={{ background: "none", border: "none", color: TM, fontFamily: mn, fontSize: 13, cursor: "pointer" }}>Avslutt</button>
        </div>
        <div style={{ height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: 20 }}>
          <div style={{ height: "100%", width: `${(pos / items.length) * 100}%`, background: `linear-gradient(90deg, ${P}, ${AC})`, transition: "width 0.3s" }} />
        </div>

        {confirmExit && <div style={{ ...glass, border: `1px solid rgba(176,124,195,0.3)` }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Avslutte økta?</div>
          <div style={{ fontSize: 13, color: TM, marginBottom: 14 }}>Settene du har logget er lagret.</div>
          <button style={{ ...bp, marginBottom: 8 }} onClick={() => { setConfirmExit(false); finish() }}>Fullfør økta nå</button>
          <button style={{ ...bgg, marginBottom: 8 }} onClick={onExit}>Ta pause, fortsett senere</button>
          <button style={{ ...bgg, color: SM }} onClick={async () => { if (await training.deleteSession(session.id)) onExit() }}>Forkast økta</button>
          <button style={{ background: "none", border: "none", color: TM, width: "100%", marginTop: 10, cursor: "pointer", fontFamily: mn, fontSize: 13 }} onClick={() => setConfirmExit(false)}>Fortsett trening</button>
        </div>}

        <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 14 }}>{ex.name}</div>
        {item.phase === "warmup" && pos === 0 && <div style={{ fontSize: 14, color: TM, marginBottom: 14, lineHeight: 1.5 }}>Rolig start. Du skal kunne prate hele veien.</div>}

        {item.phase === "warmup"
          ? <WarmupStep key={pos} ex={ex} onNext={next} />
          : <StrengthStep key={pos} ex={ex} item={item} session={session} training={training} onNext={next} />}

        {item.phase === "warmup" && <button style={{ background: "none", border: "none", color: TL, width: "100%", marginTop: 14, cursor: "pointer", fontFamily: mn, fontSize: 12 }}
          onClick={() => setPos(items.findIndex(i => i.phase !== "warmup"))}>Hopp over oppvarmingen</button>}
      </div>
    </div>
  )
}
