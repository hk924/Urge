// Progression helpers: what did I do last time, what should I do today, records.
// Rule of thumb (double progression): add reps until all sets hit repMax, then add weight.
// "Tungt" (couldn't hold a conversation) holds or lowers the load.

// Sets from the most recent session (other than excludeSessionId) that contains this exercise
export function lastPerformance(exerciseId, sets, sessions, excludeSessionId = null) {
  const byTime = [...sessions]
    .filter(s => s.id !== excludeSessionId)
    .sort((a, b) => (b.started_at || "").localeCompare(a.started_at || ""))
  for (const s of byTime) {
    const ss = sets.filter(x => x.session_id === s.id && x.exercise_id === exerciseId).sort((a, b) => a.set_no - b.set_no)
    if (ss.length) return { session: s, sets: ss, effort: ss.find(x => x.effort)?.effort || null }
  }
  return null
}

const roundKg = n => Math.round(n * 2) / 2

export function suggest(ex, last) {
  if (ex.kind === "time") {
    if (!last) return { seconds: ex.seconds, note: "Start rolig" }
    const best = Math.max(...last.sets.map(s => s.seconds || 0))
    if (last.effort === "tungt") return { seconds: best, note: "Samme som sist" }
    return { seconds: Math.min(best + 5, 90), note: "+5 sek" }
  }

  if (!last) {
    return ex.kind === "weight"
      ? { weight: ex.start, reps: ex.repMin, note: "Start lett. Du skal kunne snakke." }
      : { reps: ex.repMin, note: "Start rolig" }
  }

  const reps = last.sets.map(s => s.reps || 0)
  const minReps = Math.min(...reps)

  if (ex.kind === "reps") {
    if (last.effort === "tungt") return { reps: minReps, note: "Samme som sist" }
    return { reps: Math.min(minReps + 1, ex.repMax + 5), note: "+1 rep" }
  }

  const weight = Math.max(...last.sets.map(s => Number(s.weight_kg) || 0))
  if (last.effort === "tungt") {
    if (minReps < ex.repMin) return { weight: Math.max(roundKg(weight - ex.inc), 1), reps: ex.repMin, note: "Litt lettere i dag" }
    return { weight, reps: minReps, note: "Samme som sist" }
  }
  if (minReps >= ex.repMax) {
    return { weight: roundKg(weight + ex.inc), reps: ex.repMin, note: `+${ex.inc} kg! Du klarte ${ex.repMax} i alle sett` }
  }
  return { weight, reps: Math.min(minReps + 1, ex.repMax), note: "+1 rep" }
}

// Metric to track over time for an exercise
export function metricOf(ex, sessionSets) {
  if (!sessionSets.length) return 0
  if (ex.kind === "time") return Math.max(...sessionSets.map(s => s.seconds || 0))
  if (ex.kind === "reps") return Math.max(...sessionSets.map(s => s.reps || 0))
  return Math.max(...sessionSets.map(s => Number(s.weight_kg) || 0))
}

export function metricUnit(ex) {
  return ex.kind === "time" ? "sek" : ex.kind === "reps" ? "reps" : "kg"
}

// History of one exercise: [{date, sessionId, sets, v}] oldest first
export function exerciseHistory(ex, sets, sessions) {
  const sorted = [...sessions].sort((a, b) => (a.started_at || "").localeCompare(b.started_at || ""))
  const out = []
  for (const s of sorted) {
    const ss = sets.filter(x => x.session_id === s.id && x.exercise_id === ex.id).sort((a, b) => a.set_no - b.set_no)
    if (ss.length) out.push({ date: s.date, sessionId: s.id, sets: ss, v: metricOf(ex, ss) })
  }
  return out
}

// Best single set: heaviest weight (ties: most reps), most reps, or longest hold
export function personalRecord(ex, sets) {
  const ss = sets.filter(x => x.exercise_id === ex.id)
  if (!ss.length) return null
  const score = s => ex.kind === "weight" ? (Number(s.weight_kg) || 0) * 1000 + (s.reps || 0)
    : ex.kind === "reps" ? (s.reps || 0) : (s.seconds || 0)
  return ss.reduce((best, s) => (score(s) > score(best) ? s : best))
}

// Is this set a new record compared with everything before it?
export function isNewRecord(ex, set, previousSets) {
  const prev = personalRecord(ex, previousSets.filter(s => s.id !== set.id))
  if (!prev) return false
  const score = s => ex.kind === "weight" ? (Number(s.weight_kg) || 0) * 1000 + (s.reps || 0)
    : ex.kind === "reps" ? (s.reps || 0) : (s.seconds || 0)
  return score(set) > score(prev)
}

export function formatSets(ex, sets) {
  if (!sets?.length) return ""
  if (ex.kind === "time") return sets.map(s => `${s.seconds}s`).join(" · ")
  const reps = sets.map(s => s.reps).join("/")
  if (ex.kind === "reps") return `${sets.length} sett: ${reps} reps`
  const w = Math.max(...sets.map(s => Number(s.weight_kg) || 0))
  return `${sets.length} × ${reps} · ${String(w).replace(".", ",")} kg`
}
