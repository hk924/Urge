import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'
import { td } from '../utils/helpers'

// Training data (sessions + sets) and mutations. Every set is saved immediately,
// so an interrupted workout can be resumed.
export function useTraining(user, setErr) {
  const [sessions, setSessions] = useState([])
  const [sets, setSets] = useState([])
  const [loaded, setLoaded] = useState(false)

  const load = useCallback(async () => {
    if (!user) return
    const [s, x] = await Promise.all([
      supabase.from("workout_sessions").select("*").eq("user_id", user.id).order("started_at", { ascending: false }).limit(500),
      supabase.from("workout_sets").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
    ])
    if (s.error || x.error) console.error("Training load:", s.error || x.error)
    setSessions(s.data || []); setSets(x.data || []); setLoaded(true)
  }, [user])

  useEffect(() => {
    if (user) load()
    else { setSessions([]); setSets([]); setLoaded(false) }
  }, [user, load])

  async function startSession(routine, block, plan) {
    const { data, error } = await supabase.from("workout_sessions")
      .insert({ user_id: user.id, routine, block, plan, date: td() }).select().single()
    if (error) { console.error("Start session:", error); setErr("Kunne ikke starte økta."); return null }
    setSessions(p => [data, ...p])
    return data
  }

  async function logSet(sessionId, exerciseId, setNo, values) {
    const { data, error } = await supabase.from("workout_sets")
      .insert({ user_id: user.id, session_id: sessionId, exercise_id: exerciseId, set_no: setNo, ...values }).select().single()
    if (error) { console.error("Log set:", error); setErr("Kunne ikke lagre settet."); return null }
    setSets(p => [...p, data])
    return data
  }

  async function deleteSet(id) {
    const { error } = await supabase.from("workout_sets").delete().eq("id", id)
    if (error) { console.error("Del set:", error); setErr("Kunne ikke slette."); return false }
    setSets(p => p.filter(s => s.id !== id))
    return true
  }

  async function setEffort(sessionId, exerciseId, effort) {
    const { error } = await supabase.from("workout_sets").update({ effort })
      .eq("session_id", sessionId).eq("exercise_id", exerciseId)
    if (error) { console.error("Effort:", error); setErr("Kunne ikke lagre."); return false }
    setSets(p => p.map(s => (s.session_id === sessionId && s.exercise_id === exerciseId ? { ...s, effort } : s)))
    return true
  }

  async function finishSession(id) {
    const finished_at = new Date().toISOString()
    const { error } = await supabase.from("workout_sessions").update({ finished_at }).eq("id", id)
    if (error) { console.error("Finish:", error); setErr("Kunne ikke lagre økta."); return false }
    setSessions(p => p.map(s => (s.id === id ? { ...s, finished_at } : s)))
    return true
  }

  async function deleteSession(id) {
    const { error } = await supabase.from("workout_sessions").delete().eq("id", id)
    if (error) { console.error("Del session:", error); setErr("Kunne ikke slette økta."); return false }
    setSessions(p => p.filter(s => s.id !== id))
    setSets(p => p.filter(s => s.session_id !== id))
    return true
  }

  return { sessions, sets, loaded, reload: load, startSession, logSet, deleteSet, setEffort, finishSession, deleteSession }
}
