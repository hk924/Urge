// Home training program: two ~30 min routines (A/B) alternating.
// Main exercises stay fixed for a 4-week block so progress is visible, then switch to
// their variant. Warm-up and core rotate every session to keep it fresh.

export const BLOCK_WEEKS = 4
export const REST_SECONDS = 60

export const ROUTINES = {
  A: {
    id: "A", name: "Økt A", subtitle: "Bein og skyv",
    slots: [
      { variants: ["goblet-squat", "sumo-squat"], sets: 3 },
      { variants: ["gulvpress", "hantelpress-benk"], sets: 3 },
      { variants: ["skulderpress", "arnold-press"], sets: 3 },
      { variants: ["splittbøy", "baklengs-utfall"], sets: 2 },
      { variants: ["sidehev", "fronthev"], sets: 2 },
    ],
  },
  B: {
    id: "B", name: "Økt B", subtitle: "Hofte og trekk",
    slots: [
      { variants: ["rumensk-markløft", "enbeins-markløft"], sets: 3 },
      { variants: ["foroverbøyd-roing", "enarms-roing"], sets: 3 },
      { variants: ["omvendt-flyes", "pullover-gulv"], sets: 2 },
      { variants: ["hammercurl", "bicepscurl"], sets: 2 },
      { variants: ["seteløft", "enbeins-seteløft"], sets: 2 },
    ],
  },
}

export const WARMUP_FIRST = "marsj"
export const WARMUP_POOL = ["armsirkler", "skulderruller", "hoftesirkler", "knebøy-uten-vekt", "katt-ku", "tåhev"]
// No plank-position exercises (planke, sideplanke, push-ups): advised against after heart surgery.
export const CORE_POOL = ["dead-bug", "hælberøring", "superman", "omvendt-crunch", "bird-dog", "russian-twist", "koffertbæring"]

function parseDate(ds) {
  const [y, m, d] = ds.split("-").map(Number)
  return new Date(y, m - 1, d)
}

// Rotate a pool by offset and take n items
export function rotate(pool, offset, n) {
  const out = []
  for (let i = 0; i < n; i++) out.push(pool[(offset + i) % pool.length])
  return out
}

// Block index (0 or 1) based on weeks since the first ever session
export function getBlock(firstDate, todayStr) {
  if (!firstDate) return 0
  const days = Math.round((parseDate(todayStr) - parseDate(firstDate)) / 86400000)
  return Math.floor(Math.max(0, days) / (BLOCK_WEEKS * 7)) % 2
}

// Week number (1..BLOCK_WEEKS) within the current block
export function getBlockWeek(firstDate, todayStr) {
  if (!firstDate) return 1
  const days = Math.round((parseDate(todayStr) - parseDate(firstDate)) / 86400000)
  return (Math.floor(Math.max(0, days) / 7) % BLOCK_WEEKS) + 1
}

// Alternate A/B based on the last finished session
export function nextRoutine(sessions) {
  const last = sessions.filter(s => s.finished_at).sort((a, b) => (b.started_at || "").localeCompare(a.started_at || ""))[0]
  return last?.routine === "A" ? "B" : "A"
}

// Build the concrete plan for a session
export function buildPlan(routineId, block, sessionCount) {
  const r = ROUTINES[routineId]
  return {
    warmup: [WARMUP_FIRST, ...rotate(WARMUP_POOL, sessionCount * 2, 4)],
    main: r.slots.map(s => ({ exerciseId: s.variants[block % s.variants.length], sets: s.sets })),
    core: rotate(CORE_POOL, sessionCount * 3, 3).map(id => ({ exerciseId: id, sets: 2 })),
  }
}
