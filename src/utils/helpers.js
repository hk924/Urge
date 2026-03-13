import { DEF_GOALS, WHY_OPTIONS, GQ, FQ } from '../constants/data'

export function td() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function fd(iso) {
  const d = new Date(iso)
  return d.getDate() + ". " + ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"][d.getMonth()]
}

export function fds(iso) {
  const d = new Date(iso)
  return d.getDate() + "/" + (d.getMonth() + 1)
}

export function ago(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function agl(n) {
  return n === 0 ? "I dag" : n === 1 ? "I går" : n + " dager siden"
}

export function gmq(goals, whys, last) {
  const gL = (goals || []).map(g => {
    if (g.startsWith("custom:")) return g.slice(7)
    const o = DEF_GOALS.find(x => x.id === g)
    return o ? o.label.toLowerCase() : g
  })
  const wL = (whys || []).map(w => {
    const o = WHY_OPTIONS.find(x => x.id === w)
    return o ? o.label.toLowerCase() : w
  })
  const gs = gL.length > 0 ? gL[0] : "målet ditt"
  const ws = wL.length > 0 ? wL[Math.floor(Math.random() * wL.length)] : "deg selv"
  if (!goals?.length && !whys?.length) {
    let q
    do { q = FQ[Math.floor(Math.random() * FQ.length)] } while (q === last)
    return q
  }
  let q
  do { q = GQ[Math.floor(Math.random() * GQ.length)].q } while (q === last && GQ.length > 1)
  return q.replace("{goal}", gs).replace("{why}", ws)
}
