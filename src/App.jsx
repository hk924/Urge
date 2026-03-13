import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import { DEF_TRIGGERS, DEF_MILESTONES, DEF_COST, ST } from './constants/data'
import { ba, mn, TL, BG } from './constants/theme'
import { td, gmq } from './utils/helpers'

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
        if (session?.user) { sU(session.user); await loadData(session.user.id) }
        else sL(false)
      } catch (e) { console.error("Init:", e); if (mounted) sL(false) }
    }
    init()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (ev, session) => {
      if (!mounted) return
      if ((ev === "SIGNED_IN" || ev === "TOKEN_REFRESHED") && session?.user) {
        sU(session.user); await loadData(session.user.id); sAS("email"); sOTP("")
      }
      if (ev === "SIGNED_OUT") { sU(null); sP(null); sRes([]); sSml([]); sChk([]); sWgt([]); sWko([]) }
    })
    return () => { mounted = false; clearTimeout(timeout); subscription.unsubscribe() }
  }, [])

  async function loadData(uid) {
    try {
      const { data: prof, error: pe } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle()
      if (pe) console.error("Profile err:", pe)
      if (prof) sP({ goals: prof.goals, config: prof.config }); else sP(null)
      const [r, s, c, w, wo] = await Promise.all([
        supabase.from("resists").select("*").eq("user_id", uid).order("logged_at", { ascending: false }),
        supabase.from("smells").select("*").eq("user_id", uid).order("logged_at", { ascending: false }),
        supabase.from("checkins").select("*").eq("user_id", uid).order("date", { ascending: false }),
        supabase.from("weights").select("*").eq("user_id", uid).order("date", { ascending: false }),
        supabase.from("workouts").select("*").eq("user_id", uid).order("date", { ascending: false }),
      ])
      sRes(r.data || []); sSml(s.data || []); sChk(c.data || []); sWgt(w.data || []); sWko(wo.data || [])
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
    if (error) console.error("Save prof:", error)
    sP({ goals: pl.goals, config: pl.config })
  }

  async function addResist(tr) {
    const { data, error } = await supabase.from("resists").insert({ user_id: user.id, trigger_type: tr, date: td() }).select().single()
    if (error) { console.error("Resist err:", error); sErr("Kunne ikke lagre. Prøv igjen."); return false }
    if (data) sRes(p => [data, ...p])
    return true
  }

  async function addSmell(m) {
    const { data, error } = await supabase.from("smells").insert({ user_id: user.id, trigger_text: m.trigger, feeling: m.feeling, what: m.what, cost: m.cost ? parseFloat(m.cost) : 0, date: td() }).select().single()
    if (error) { console.error("Smell err:", error); sErr("Kunne ikke lagre."); return false }
    if (data) sSml(p => [data, ...p])
    return true
  }

  async function addCheckin(d, mood, mid) {
    await supabase.from("checkins").delete().eq("user_id", user.id).eq("date", d)
    const { data } = await supabase.from("checkins").insert({ user_id: user.id, mood, mood_id: mid, date: d }).select().single()
    if (data) sChk(p => [data, ...p.filter(c => c.date !== d)])
  }

  async function addWeight(kg, fat, mus) {
    await supabase.from("weights").delete().eq("user_id", user.id).eq("date", td())
    const { data } = await supabase.from("weights").insert({ user_id: user.id, kg, fat, muscle: mus, date: td() }).select().single()
    if (data) sWgt(p => [data, ...p.filter(w => w.date !== td())])
  }

  async function addWorkout(ty, dur) {
    const { data } = await supabase.from("workouts").insert({ user_id: user.id, type: ty, duration: dur, date: td() }).select().single()
    if (data) sWko(p => [data, ...p])
  }

  const tR = res.length
  const tS = sml.length
  const ms = tR * smellCost
  const nm = milestones.find(m => m.a > ms) || milestones[milestones.length - 1]
  const mp = nm ? Math.min((ms / nm.a) * 100, 100) : 100

  const curS = useCallback(() => {
    if (!sml.length && !res.length) return 0
    const sd = new Set(sml.map(s => s.date))
    let sk = 0
    const d = new Date()
    if (sd.has(td())) return 0
    for (let i = 0; i < 365; i++) {
      const ds = d.toISOString().split("T")[0]
      if (sd.has(ds)) break
      const hr = res.some(r => r.date === ds)
      const hc = chk.some(c => c.date === ds)
      if (i === 0 || hr || hc) sk++
      else { if (!res.some(r => r.date <= ds) && !chk.some(c => c.date <= ds)) break; sk++ }
      d.setDate(d.getDate() - 1)
    }
    return sk
  }, [sml, res, chk])()

  const besS = useCallback(() => {
    if (!sml.length) return curS
    const ad = [...res.map(r => r.date), ...chk.map(c => c.date), ...sml.map(s => s.date)].sort()
    if (!ad.length) return 0
    const sd = new Set(sml.map(s => s.date))
    let b = 0, c = 0
    const d = new Date(ad[0]), e = new Date()
    while (d <= e) { if (sd.has(d.toISOString().split("T")[0])) { b = Math.max(b, c); c = 0 } else c++; d.setDate(d.getDate() + 1) }
    return Math.max(b, c)
  }, [sml, res, chk, curS])()

  const tc = triggers.map(t => ({ ...t, rc: res.filter(r => r.trigger_type === t.id).length, sc: sml.filter(s => s.trigger_type === t.id).length }))

  useEffect(() => { if (goals) sHq(gmq(goals.goals || [], goals.whys || [], "")) }, [goals])

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
    />
  )

  // Settings
  if (showSet) {
    if (!eT.length && triggers.length) {
      sET([...triggers]); sEM([...milestones]); sECost(String(smellCost))
      sEG([...(goals?.goals || [])]); sEW([...(goals?.whys || [])]); sEC(goals?.customGoal || "")
    }
    return (
      <Settings
        goals={goals} cfg={cfg} triggers={triggers} milestones={milestones} smellCost={smellCost} user={user}
        eG={eG} setEG={sEG} eW={eW} setEW={sEW} eC={eC} setEC={sEC}
        eT={eT} setET={sET} nT={nT} setNT={sNT}
        eM={eM} setEM={sEM} nMA={nMA} setNMA={sNMA} nML={nML} setNML={sNML}
        eCost={eCost} setECost={sECost}
        setTab={setTab} setTab2={sSetTab} saveProf={saveProf}
        onClose={() => { sSS(false); sET([]) }}
        err={err} setErr={sErr}
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

  // Smell detail view
  if (sel) return (
    <Log sml={sml} sel={sel} setSel={sSel} sc={sc} setScreen={sSc} />
  )

  // Main screens
  if (sc === "home") return (
    <Home
      user={user} goals={goals} curS={curS} besS={besS}
      ms={ms} tR={tR} tS={tS} nm={nm} mp={mp} chk={chk}
      hq={hq} setHq={sHq} cd={cd} setCd={sCd}
      sdp={sdp} setSdp={sSdp}
      addCheckin={addCheckin} err={err} setErr={sErr}
      setScreen={sSc} sc={sc}
      onResist={() => sSrf(true)}
      onSmell={() => { sStl(ST[Math.floor(Math.random() * ST.length)]); sSsr(true) }}
      onOpenSettings={() => {
        sET([...triggers]); sEM([...milestones]); sECost(String(smellCost))
        sEG([...(goals?.goals || [])]); sEW([...(goals?.whys || [])]); sEC(goals?.customGoal || "")
        sSS(true)
      }}
    />
  )

  if (sc === "stats") return (
    <Stats curS={curS} besS={besS} tR={tR} tS={tS} ms={ms} smellCost={smellCost} milestones={milestones} tc={tc} sc={sc} setScreen={sSc} />
  )

  if (sc === "log") return (
    <Log sml={sml} sel={sel} setSel={sSel} sc={sc} setScreen={sSc} />
  )

  if (sc === "body") return (
    <Body
      wgt={wgt} wko={wko} bt={bt} setBt={sBt}
      wf={wf} setWf={sWf} wef={wef} setWef={sWef}
      wi={wi} setWi={sWi} woi={woi} setWoi={sWoi}
      addWeight={addWeight} addWorkout={addWorkout}
      sc={sc} setScreen={sSc}
    />
  )

  return null
}
