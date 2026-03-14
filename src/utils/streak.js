import { td } from './helpers'

function fmtDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function calcCurrentStreak(sml, res, chk) {
  if (!sml.length && !res.length) return 0
  const sd = new Set(sml.map(s => s.date))
  let sk = 0
  const d = new Date()
  if (sd.has(td())) return 0
  for (let i = 0; i < 365; i++) {
    const ds = fmtDate(d)
    if (sd.has(ds)) break
    const hr = res.some(r => r.date === ds)
    const hc = chk.some(c => c.date === ds)
    if (i === 0 || hr || hc) sk++
    else { if (!res.some(r => r.date <= ds) && !chk.some(c => c.date <= ds)) break; sk++ }
    d.setDate(d.getDate() - 1)
  }
  return sk
}

export function calcBestStreak(sml, res, chk, curS) {
  if (!sml.length) return curS
  const ad = [...res.map(r => r.date), ...chk.map(c => c.date), ...sml.map(s => s.date)].sort()
  if (!ad.length) return 0
  const sd = new Set(sml.map(s => s.date))
  let b = 0, c = 0
  const d = new Date(ad[0]), e = new Date()
  while (d <= e) {
    const ds = fmtDate(d)
    if (sd.has(ds)) { b = Math.max(b, c); c = 0 } else c++
    d.setDate(d.getDate() + 1)
  }
  return Math.max(b, c)
}

export function calcMoneySaved(resistCount, smellCost) {
  return resistCount * smellCost
}
