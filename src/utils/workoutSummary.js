import { EXERCISE_BY_ID } from '../constants/exercises'
import { ROUTINES } from '../constants/program'
import { lastPerformance, formatSets, metricOf, isNewRecord } from './progression'

const fmtNum = n => String(Math.round(n * 10) / 10).replace(".", ",")
const MONTHS = ["januar", "februar", "mars", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "desember"]

export function formatLongDate(ds) {
  const [y, m, d] = ds.split("-").map(Number)
  return `${d}. ${MONTHS[m - 1]} ${y}`
}

// Everything the summary slide, the share image and the Strava text need
export function buildSummary(session, sets, sessions, now = Date.now()) {
  const routine = ROUTINES[session.routine]
  const end = session.finished_at ? new Date(session.finished_at).getTime() : now
  const minutes = Math.max(1, Math.round((end - new Date(session.started_at).getTime()) / 60000))
  const mine = sets.filter(s => s.session_id === session.id)
  const before = sets.filter(s => s.session_id !== session.id && (sessions.find(x => x.id === s.session_id)?.started_at || "") < session.started_at)
  const earlierSessions = sessions.filter(s => s.id !== session.id && (s.started_at || "") < session.started_at)
  const plan = session.plan || { main: [], core: [] }
  const coreIds = new Set(plan.core.map(m => m.exerciseId))
  const ids = [...plan.main, ...plan.core].map(m => m.exerciseId)
  for (const s of mine) if (!ids.includes(s.exercise_id)) ids.push(s.exercise_id)

  const exercises = ids.map(id => {
    const ex = EXERCISE_BY_ID[id]
    if (!ex) return null
    const today = mine.filter(s => s.exercise_id === id).sort((a, b) => a.set_no - b.set_no)
    if (!today.length) return null
    const prev = lastPerformance(id, before, earlierSessions)
    let delta = null
    if (prev) {
      const d = metricOf(ex, today) - metricOf(ex, prev.sets)
      const repsD = today.reduce((a, s) => a + (s.reps || 0), 0) - prev.sets.reduce((a, s) => a + (s.reps || 0), 0)
      if (d > 0) delta = `+${fmtNum(d)} ${ex.kind === "weight" ? "kg" : ex.kind === "time" ? "sek" : d === 1 ? "rep" : "reps"}`
      else if (d === 0 && repsD > 0 && ex.kind !== "time") delta = `+${repsD} ${repsD === 1 ? "rep" : "reps"}`
    }
    const record = today.some(s => isNewRecord(ex, s, before))
    return { id, name: ex.name, line: formatSets(ex, today), delta, record, core: coreIds.has(id) }
  }).filter(Boolean)

  return {
    routineName: routine?.name || "Økt",
    subtitle: routine?.subtitle || "",
    date: session.date,
    dateLabel: formatLongDate(session.date),
    minutes,
    setCount: mine.length,
    repCount: mine.reduce((a, s) => a + (s.reps || 0), 0),
    improved: exercises.filter(e => e.delta).length,
    records: exercises.filter(e => e.record).length,
    exercises,
  }
}

export function stravaTitle(sum) {
  return `${sum.routineName} · ${sum.subtitle}`
}

export function stravaText(sum) {
  const lines = [`${stravaTitle(sum)} · ${sum.minutes} min · ${sum.setCount} sett`, ""]
  for (const e of sum.exercises) lines.push(`${e.name}: ${e.line}${e.delta ? ` (${e.delta})` : ""}${e.record ? " · ny rekord" : ""}`)
  if (sum.improved) lines.push("", `Fremgang på ${sum.improved} ${sum.improved === 1 ? "øvelse" : "øvelser"} siden sist.`)
  lines.push("", "Logget med Urge")
  return lines.join("\n")
}
