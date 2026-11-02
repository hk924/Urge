// Streak rules:
// - A day is "active" if it has at least one resist or check-in AND no smell.
// - A smell day or an empty day breaks the streak.
// - Today is pending: if nothing is logged yet today, the streak shows the run
//   up to yesterday. A smell today resets it to 0.
// Dates are local "YYYY-MM-DD" strings (see td() in helpers).

function fmtDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function parseDate(ds) {
  const [y, m, d] = ds.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function daySets(sml, res, chk) {
  const smellDays = new Set(sml.map(s => s.date))
  const active = new Set()
  for (const x of [...res, ...chk]) if (!smellDays.has(x.date)) active.add(x.date)
  return { smellDays, active }
}

export function calcCurrentStreak(sml, res, chk) {
  const { smellDays, active } = daySets(sml, res, chk)
  const d = new Date()
  const today = fmtDate(d)
  if (smellDays.has(today)) return 0
  // Today pending: don't count it, but don't break on it either
  if (!active.has(today)) d.setDate(d.getDate() - 1)
  let sk = 0
  while (active.has(fmtDate(d))) {
    sk++
    d.setDate(d.getDate() - 1)
  }
  return sk
}

export function calcBestStreak(sml, res, chk, curS = 0) {
  const { active } = daySets(sml, res, chk)
  if (!active.size) return curS
  const days = [...active].sort()
  let best = 0, run = 0, prev = null
  for (const ds of days) {
    if (prev) {
      const next = parseDate(prev)
      next.setDate(next.getDate() + 1)
      run = fmtDate(next) === ds ? run + 1 : 1
    } else run = 1
    best = Math.max(best, run)
    prev = ds
  }
  return Math.max(best, curS)
}

export function calcMoneySaved(resistCount, smellCost) {
  return resistCount * smellCost
}
