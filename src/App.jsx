import { useState, useEffect, useMemo } from 'react'
import { supabase } from './lib/supabase'
import { getWithingsStatus, getWithingsAuthUrl, syncWithings, disconnectWithings } from './lib/withings'
import { DEF_TRIGGERS, DEF_MILESTONES, DEF_COST, ST } from './constants/data'
import { ba, mn, TL } from './constants/theme'
import { td, gmq } from './utils/helpers'
import { calcCurrentStreak, calcBestStreak } from './utils/streak'

import Auth from './components/Auth'
import Onboarding from './components/Onboarding'
import Home from './components/Home'
import ResistFlow from './components/ResistFlow'
import SmellFlow from './components/SmellFlow'
import Stats from './components/Stats'
import Log from './components/Log'
import Body from './components/Body'
import Settings from './components/Settings'

export default function App() {
  const [user, sU] = useState(null)
  const [authEmail, sAE] = useState("")
  const [authName, sAN] = useState("")
  const [authStep, sAS] = useState("email")
  const [otpCode, sOTP] = useState("")
  const [authMsg, sAM] = useState("")
  const [loading, sL] = useState(true)
  const [profile, sP] = useState(null)
  const [sc, sSc] = useState("home")
  const [err, sErr] = useState("")
  const [res, sRes] = useState([])
  const [sml, sSml] = useState([])
  const [chk, sChk] = useState([])
  const [wgt, sWgt] = useState([])
  const [wko, sWko] = useState([])
  const [srf, sSrf] = useState(false)
  const [rs, sRs] = useState("trigger")
  const [st2, sSt2] = useState(null)
  const [rq2, sRq2] = useState("")
  const [cf, sCf] = useState(false)
  const [ssr, sSsr] = useState(false)
  const [ssf, sSsf] = useState(false)
  const [sm, sSm] = useState({ trigger: "", feeling: "", what: "", cost: "" })
  const [stl, sStl] = useState("")
  const [sel, sSel] = useState(null)
  const [bt, sBt] = useState("vekt")
  const [wf, sWf] = useState(false)
  const [wef, sWef] = useState(false)
  const [wi, sWi] = useState({ kg: "", fat: "", muscle: "" })
  const [woi, sWoi] = useState({ type: "", duration: "" })
  const [cd, sCd] = useState(td())
  const [sdp, sSdp] = useState(false)
  const [lq, sLq] = useState("")
  const [hq, sHq] = useState("")
  const [obStep, sOb] = useState("goals")
  const [selG, sSG] = useState([])
  const [selW, sSW] = useState([])
  const [cGoal, sCG] = useState("")
  const [showSet, sSS] = useState(false)
  const [setTab, sSetTab] = useState("goals")
  const [eG, sEG] = useState([])
  const [eW, sEW] = useState([])
  const [eC, sEC] = useState("")
  const [eT, sET] = useState([])
  const [nT, sNT] = useState("")
  const [eM, sEM] = useState([])
  const [nMA, sNMA] = useState("")
  const [nML, sNML] = useState("")
  const [eCost, sECost] = useState("")
  const [wthC, sWthC] = useState(false)
  const [wthS, sWthS] = useState(false)
  const [wthE, sWthE] = useState("")
  const [wthLoaded, sWthLoaded] = useState(false)
  const [bodyGoals, sBodyGoals] = useState(null)

  const goals = profile?.goals || null
  const cfg = profile?.config || null
  const triggers = cfg?.triggers || DEF_TRIGGERS
  const milestones = cfg?.milestones || DEF_MILESTONES
  const smellCost = cfg?.cost || DEF_COST

  useEffect(() => {
    let mounted = true
    const timeout = setTimeout(() => { if (mounted && loading) { sL(false) } }, 8000)
    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (window.location.hash?.includes("access_token")) window.history.replaceState(null, "", window.location.pathname)
        if (!mounted) return
        if (session?.user) { await loadData(session.user.id); sU(session.user) }
        else sL(false)
      } catch (e) { console.error("Init:", e); if (mounted) sL(false) }
    }
    init()
    // Handle Withings OAuth redirect
    const urlParams = new URLSearchParams(window.location.search)
    const wthParam = urlParams.get("withings")
    if (wthParam) {
      window.history.replaceState(null, "", window.location.pathname)
      if (wthParam === "connected") { sWthC(true); sWthE("") }
      else if (wthParam === "error") { sWthE("Tilkobling til Withings feilet. Prøv igjen.") }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (ev, session) => {
      if (!mounted) return
      if ((ev === "SIGNED_IN" || ev === "TOKEN_REFRESHED") && session?.user) {
        await loadData(session.user.id); sU(session.user); sAS("email"); sOTP("")
      }
      if (ev === "SIGNED_OUT") { sU(null); sP(null); sRes([]); sSml([]); sChk([]); sWgt([]); sWko([]) }
    })
    return () => { mounted = false; clearTimeout(timeout); subscription.unsubscribe() }
  }, [])

  async function loadData(uid) {
    try {
      const [pf, r, s, c, w, wo] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
        supabase.from("resists").select("*").eq("user_id", uid).order("logged_at", { ascending: false }),
        supabase.from("smells").select("*").eq("user_id", uid).order("logged_at", { ascending: false }),
        supabase.from("checkins").select("*").eq("user_id", uid).order("date", { ascending: false }),
        supabase.from("weights").select("*").eq("user_id", uid).order("date", { ascending: false }),
        supabase.from("workouts").select("*").eq("user_id", uid).order("date", { ascending: false }),
      ])
      if (pf.error) console.error("Profile err:", pf.error)
      if (pf.data) sP({ goals: pf.data.goals, config: pf.data.config }); else sP(null)
      sRes(r.data || []); sSml(s.data || []); sChk(c.data || []); sWgt(w.data || []); sWko(wo.data || [])
      // Fetch body_goals separately so it doesn't block app loading
      try {
        const bg = await supabase.from("body_goals").select("*").eq("user_id", uid).maybeSingle()
        if (bg.error) console.error("Body goals err:", bg.error)
        sBodyGoals(bg.data || null)
      } catch (e) { console.error("Body goals load:", e) }
    } catch (e) { console.error("Load:", e) }
    sL(false)
  }

  async function sendOTP() {
    sAS("loading"); sAM("")
    const { error } = await supabase.auth.signInWithOtp({ email: authEmail, options: { data: { name: authName } } })
    if (error) { sAM(error.message); sAS("email") } else sAS("otp")
  }

  async function verifyOTP() {
    sAS("loading"); sAM("")
    const { data, error } = await supabase.auth.verifyOtp({ email: authEmail, token: otpCode, type: "email" })
    if (error) { sAM("Feil kode. Prøv igjen."); sAS("otp") }
  }

  async function saveProf(g, c) {
    const uid = user.id
    const pl = { id: uid, name: user.user_metadata?.name || authName || "", email: user.email, goals: g || goals, config: c || cfg }
    const { error } = await supabase.from("profiles").upsert(pl)
    if (error) {
      console.error("Save prof:", error)
      sErr("Kunne ikke lagre profil. Prøv igjen.")
      return false
    }
    sP({ goals: pl.goals, config: pl.config })
    return true
  }

  async function addResist(tr, note, date) {
    const { data, error } = await supabase.from("resists").insert({ user_id: user.id, trigger_type: tr, note: note || null, date: date || td() }).select().single()
    if (error) { console.error("Resist err:", error); sErr("Kunne ikke lagre. Prøv igjen."); return false }
    if (data) sRes(p => [data, ...p])
    return true
  }

  async function addSmell(m, date) {
    const { data, error } = await supabase.from("smells").insert({ user_id: user.id, trigger_text: m.trigger, feeling: m.feeling, what: m.what, cost: m.cost ? parseFloat(m.cost) : 0, date: date || td() }).select().single()
    if (error) { console.error("Smell err:", error); sErr("Kunne ikke lagre."); return false }
    if (data) sSml(p => [data, ...p])
    return true
  }

  async function addCheckin(d, mood, mid) {
    const { error: delErr } = await supabase.from("checkins").delete().eq("user_id", user.id).eq("date", d)
    if (delErr) { console.error("Checkin del err:", delErr); sErr("Kunne ikke lagre sjekk."); return }
    const { data, error } = await supabase.from("checkins").insert({ user_id: user.id, mood, mood_id: mid, date: d }).select().single()
    if (error) { console.error("Checkin err:", error); sErr("Kunne ikke lagre sjekk."); return }
    if (data) sChk(p => [data, ...p.filter(c => c.date !== d)])
  }

  async function addWeight(kg, fat, mus, date) {
    const d = date || td()
    const { error: delErr } = await supabase.from("weights").delete().eq("user_id", user.id).eq("date", d)
    if (delErr) { console.error("Weight del err:", delErr); sErr("Kunne ikke lagre vekt."); return }
    const { data, error } = await supabase.from("weights").insert({ user_id: user.id, kg, fat, muscle: mus, date: d }).select().single()
    if (error) { console.error("Weight err:", error); sErr("Kunne ikke lagre vekt."); return }
    if (data) sWgt(p => [data, ...p.filter(w => w.date !== d)])
  }

  async function addWorkout(ty, dur, date) {
    const { data, error } = await supabase.from("workouts").insert({ user_id: user.id, type: ty, duration: dur, date: date || td() }).select().single()
    if (error) { console.error("Workout err:", error); sErr("Kunne ikke lagre trening."); return }
    if (data) sWko(p => [data, ...p])
  }

  async function saveBodyGoals(data) {
    const payload = { ...data, user_id: user.id }
    let result
    if (bodyGoals?.id) {
      result = await supabase.from("body_goals").update(payload).eq("id", bodyGoals.id).select().single()
    } else {
      result = await supabase.from("body_goals").insert(payload).select().single()
    }
    if (result.error) { console.error("Save body_goals err:", result.error); sErr("Kunne ikke lagre kroppsmål."); return false }
    sBodyGoals(result.data)
    return true
  }

  async function connectWithings() {
    try {
      const url = await getWithingsAuthUrl()
      window.location.href = url
    } catch (e) { console.error("Withings auth:", e); sWthE("Kunne ikke starte tilkobling.") }
  }

  async function syncWithingsData() {
    sWthS(true); sWthE("")
    try {
      const result = await syncWithings()
      if (result.synced > 0) {
        await loadData(user.id)
        sWthE(`${result.synced} målinger synkronisert!`)
      } else {
        sWthE(result.message || "Ingen nye målinger")
      }
    } catch (e) {
      console.error("Withings sync:", e)
      sWthE(e.message || "Synkronisering feilet.")
      if (e.message?.includes("reconnect")) sWthC(false)
    }
    sWthS(false)
  }

  async function disconnectWithingsFlow() {
    try {
      await disconnectWithings()
      sWthC(false); sWthE("")
    } catch (e) { console.error("Withings disconnect:", e); sWthE("Kunne ikke koble fra.") }
  }

  async function delResist(id) {
    const { error } = await supabase.from("resists").delete().eq("id", id)
    if (error) { console.error("Del resist err:", error); sErr("Kunne ikke slette."); return false }
    sRes(p => p.filter(r => r.id !== id))
    return true
  }

  async function delSmell(id) {
    const { error } = await supabase.from("smells").delete().eq("id", id)
    if (error) { console.error("Del smell err:", error); sErr("Kunne ikke slette."); return false }
    sSml(p => p.filter(s => s.id !== id))
    return true
  }

  async function delCheckin(id) {
    const { error } = await supabase.from("checkins").delete().eq("id", id)
    if (error) { console.error("Del checkin err:", error); sErr("Kunne ikke slette."); return false }
    sChk(p => p.filter(c => c.id !== id))
    return true
  }

  async function delWeight(id) {
    const { error } = await supabase.from("weights").delete().eq("id", id)
    if (error) { console.error("Del weight err:", error); sErr("Kunne ikke slette."); return false }
    sWgt(p => p.filter(w => w.id !== id))
    return true
  }

  async function delWorkout(id) {
    const { error } = await supabase.from("workouts").delete().eq("id", id)
    if (error) { console.error("Del workout err:", error); sErr("Kunne ikke slette."); return false }
    sWko(p => p.filter(w => w.id !== id))
    return true
  }

  useEffect(() => {
    if ((sc === "body" || showSet) && user && !wthLoaded) {
      sWthLoaded(true)
      getWithingsStatus().then(c => sWthC(c)).catch(() => {})
    }
  }, [sc, showSet, user, wthLoaded])

  const tR = res.length
  const tS = sml.length
  const ms = tR * smellCost
  const nm = milestones.find(m => m.a > ms) || milestones[milestones.length - 1]
  const mp = nm ? Math.min((ms / nm.a) * 100, 100) : 100

  const curS = useMemo(() => calcCurrentStreak(sml, res, chk), [sml, res, chk])
  const besS = useMemo(() => calcBestStreak(sml, res, chk, curS), [sml, res, chk, curS])

  const tc = triggers.map(t => ({ ...t, rc: res.filter(r => r.trigger_type === t.id).length, sc: sml.filter(s => s.trigger_type === t.id).length }))

  const weekData = useMemo(() => {
    const today = new Date()
    const mon = new Date(today)
    mon.setDate(mon.getDate() - ((mon.getDay() + 6) % 7))
    mon.setHours(0, 0, 0, 0)
    const days = ["Ma", "Ti", "On", "To", "Fr", "Lø", "Sø"]
    return days.map((day, i) => {
      const d = new Date(mon)
      d.setDate(d.getDate() + i)
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      const isToday = ds === td()
      const isFuture = d > today
      const hasResist = res.some(r => r.date === ds)
      const hasCheckin = chk.some(c => c.date === ds)
      const hasSmell = sml.some(s => s.date === ds)
      return { day, date: ds, hasResist, hasCheckin, hasSmell, isToday, isFuture }
    })
  }, [res, sml, chk])

  useEffect(() => { if (goals) sHq(gmq(goals.goals || [], goals.whys || [], "")) }, [goals])

  function openSettings() {
    sET([...triggers]); sEM([...milestones]); sECost(String(smellCost))
    sEG([...(goals?.goals || [])]); sEW([...(goals?.whys || [])]); sEC(goals?.customGoal || "")
    sSetTab("goals")
    sSS(true)
  }

  function closeSettings() {
    sSS(false)
    sET([]); sEM([]); sEG([]); sEW([]); sEC(""); sECost("")
    sNT(""); sNMA(""); sNML("")
  }

  // Loading
  if (loading) return (
    <div style={{ ...ba, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <div style={{ fontSize: 14, fontFamily: mn, color: TL, animation: "pulse 1.5s infinite" }}>Laster...</div>
    </div>
  )

  // Auth
  if (!user) return (
    <Auth
      authEmail={authEmail} setAuthEmail={sAE}
      authName={authName} setAuthName={sAN}
      authStep={authStep} setAuthStep={sAS}
      otpCode={otpCode} setOtpCode={sOTP}
      authMsg={authMsg} setAuthMsg={sAM}
      sendOTP={sendOTP} verifyOTP={verifyOTP}
    />
  )

  // Onboarding
  if (user && !goals) return (
    <Onboarding
      obStep={obStep} setObStep={sOb}
      selG={selG} setSelG={sSG}
      selW={selW} setSelW={sSW}
      cGoal={cGoal} setCGoal={sCG}
      saveProf={saveProf} cfg={cfg}
      err={err} setErr={sErr}
    />
  )

  // Settings
  if (showSet) {
    return (
      <Settings
        goals={goals} cfg={cfg} triggers={triggers} milestones={milestones} smellCost={smellCost} user={user}
        eG={eG} setEG={sEG} eW={eW} setEW={sEW} eC={eC} setEC={sEC}
        eT={eT} setET={sET} nT={nT} setNT={sNT}
        eM={eM} setEM={sEM} nMA={nMA} setNMA={sNMA} nML={nML} setNML={sNML}
        eCost={eCost} setECost={sECost}
        setTab={setTab} setTab2={sSetTab} saveProf={saveProf}
        onClose={closeSettings}
        err={err} setErr={sErr}
        wthC={wthC} wthE={wthE} connectWithings={connectWithings} disconnectWithings={disconnectWithingsFlow}
        bodyGoals={bodyGoals} saveBodyGoals={saveBodyGoals} wgt={wgt}
      />
    )
  }

  // Resist flow
  if (srf) return (
    <ResistFlow
      rs={rs} setRs={sRs} st2={st2} setSt2={sSt2}
      cf={cf} setCf={sCf} rq2={rq2} setRq2={sRq2}
      lq={lq} setLq={sLq}
      triggers={triggers} goals={goals} addResist={addResist}
      curS={curS} ms={ms} nm={nm} mp={mp}
      err={err} setErr={sErr}
      onClose={() => { sSrf(false); sRs("trigger"); sSt2(null) }}
    />
  )

  // Smell flow
  if (ssr || ssf) return (
    <SmellFlow
      ssr={ssr} setSsr={sSsr} ssf={ssf} setSsf={sSsf}
      stl={stl} sm={sm} setSm={sSm}
      tR={tR} ms={ms} addSmell={addSmell}
    />
  )

  // Main screens
  if (sc === "home") return (
    <Home
      user={user} goals={goals} curS={curS} besS={besS}
      ms={ms} tR={tR} tS={tS} nm={nm} mp={mp} chk={chk}
      hq={hq} setHq={sHq} cd={cd} setCd={sCd}
      sdp={sdp} setSdp={sSdp}
      addCheckin={addCheckin} delCheckin={delCheckin} err={err} setErr={sErr}
      setScreen={sSc} sc={sc}
      onResist={() => sSrf(true)}
      onSmell={() => { sStl(ST[Math.floor(Math.random() * ST.length)]); sSsr(true) }}
      onOpenSettings={openSettings}
    />
  )

  if (sc === "stats") return (
    <Stats curS={curS} besS={besS} tR={tR} tS={tS} ms={ms} smellCost={smellCost} milestones={milestones} tc={tc} weekData={weekData} sc={sc} setScreen={sSc} />
  )

  if (sc === "log") return (
    <Log sml={sml} res={res} triggers={triggers} sel={sel} setSel={sSel} delResist={delResist} delSmell={delSmell} sc={sc} setScreen={sSc} />
  )

  if (sc === "body") return (
    <Body
      wgt={wgt} wi={wi} setWi={sWi}
      addWeight={addWeight} delWeight={delWeight}
      sc={sc} setScreen={sSc}
      bodyGoals={bodyGoals}
      wthC={wthC} wthS={wthS} wthE={wthE}
      connectWithings={connectWithings} syncWithings={syncWithingsData} disconnectWithings={disconnectWithingsFlow}
    />
  )

  return null
}
