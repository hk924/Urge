// Draws the workout summary as a 1080x1350 (4:5) PNG for Strava/Instagram.
import { P, AC, BG, TX, TM, TL } from '../constants/theme'

const W = 1080, H = 1350, PAD = 84
const SERIF = "'Source Serif 4', Georgia, serif"
const MONO = "'DM Mono', monospace"

function ellipsize(ctx, text, max) {
  if (ctx.measureText(text).width <= max) return text
  let t = text
  while (t.length > 1 && ctx.measureText(t + "…").width > max) t = t.slice(0, -1)
  return t + "…"
}

function pill(ctx, x, y, text, color, bg) {
  ctx.font = `500 26px ${MONO}`
  const w = ctx.measureText(text).width + 32
  ctx.fillStyle = bg
  ctx.beginPath(); ctx.roundRect(x - w, y - 22, w, 44, 22); ctx.fill()
  ctx.fillStyle = color
  ctx.textAlign = "center"; ctx.fillText(text, x - w / 2, y + 9); ctx.textAlign = "left"
  return w
}

export async function drawSummaryCard(sum) {
  try { await document.fonts?.ready } catch { /* fonts optional */ }
  const c = document.createElement("canvas")
  c.width = W; c.height = H
  const ctx = c.getContext("2d")

  // Background with a soft purple glow
  ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H)
  const g = ctx.createRadialGradient(160, 120, 0, 160, 120, 900)
  g.addColorStop(0, "rgba(124,92,252,0.28)"); g.addColorStop(1, "rgba(124,92,252,0)")
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)

  // Header
  ctx.textBaseline = "alphabetic"
  ctx.font = `500 26px ${MONO}`; ctx.fillStyle = TM
  ctx.fillText("URGE · TRENING", PAD, PAD + 20)
  ctx.textAlign = "right"; ctx.fillText(sum.dateLabel.toUpperCase(), W - PAD, PAD + 20); ctx.textAlign = "left"

  ctx.font = `700 112px ${SERIF}`; ctx.fillStyle = TX
  ctx.fillText(sum.routineName, PAD, PAD + 170)
  ctx.font = `400 44px ${SERIF}`; ctx.fillStyle = TM
  ctx.fillText(sum.subtitle, PAD, PAD + 232)

  // Stats row
  const stats = [[`${sum.minutes}`, "min"], [`${sum.setCount}`, "sett"], [`${sum.repCount}`, "reps"]]
  const colW = (W - PAD * 2) / 3
  stats.forEach(([v, l], i) => {
    const x = PAD + i * colW
    ctx.font = `700 76px ${SERIF}`; ctx.fillStyle = i === 0 ? P : TX
    ctx.fillText(v, x, PAD + 360)
    ctx.font = `500 24px ${MONO}`; ctx.fillStyle = TL
    ctx.fillText(l.toUpperCase(), x, PAD + 400)
  })

  // Divider
  let y = PAD + 452
  ctx.fillStyle = "rgba(255,255,255,0.08)"; ctx.fillRect(PAD, y, W - PAD * 2, 2)
  y += 30

  // Main exercises: one row each
  const main = sum.exercises.filter(e => !e.core).slice(0, 6)
  const core = sum.exercises.filter(e => e.core)
  const footTop = H - PAD - 64
  const coreH = core.length ? 110 : 0
  const rowH = Math.min(104, Math.floor((footTop - y - coreH - 10) / Math.max(main.length, 1)))
  for (const e of main) {
    let right = W - PAD
    if (e.record) right -= pill(ctx, right, y + 40, "REKORD", BG, AC) + 12
    if (e.delta) right -= pill(ctx, right, y + 40, e.delta, AC, "rgba(74,222,128,0.14)") + 12
    ctx.font = `600 38px ${SERIF}`; ctx.fillStyle = TX
    ctx.fillText(ellipsize(ctx, e.name, right - PAD - 16), PAD, y + 38)
    ctx.font = `400 26px ${MONO}`; ctx.fillStyle = TM
    ctx.fillText(ellipsize(ctx, e.line, right - PAD - 16), PAD, y + 76)
    y += rowH
  }

  // Core: one compact line
  if (core.length) {
    y = footTop - coreH
    ctx.font = `500 24px ${MONO}`; ctx.fillStyle = TL
    ctx.fillText("KJERNE", PAD, y + 30)
    ctx.font = `400 32px ${SERIF}`; ctx.fillStyle = TM
    ctx.fillText(ellipsize(ctx, core.map(e => e.name).join(" · "), W - PAD * 2), PAD, y + 74)
  }

  if (!sum.exercises.length) {
    ctx.font = `400 34px ${SERIF}`; ctx.fillStyle = TM
    ctx.fillText("Ingen sett logget denne gangen.", PAD, y + 40)
  }

  // Footer
  ctx.fillStyle = "rgba(255,255,255,0.08)"; ctx.fillRect(PAD, H - PAD - 64, W - PAD * 2, 2)
  ctx.font = `500 26px ${MONO}`
  ctx.fillStyle = sum.improved ? AC : TL
  const foot = sum.improved
    ? `FREMGANG PÅ ${sum.improved} ${sum.improved === 1 ? "ØVELSE" : "ØVELSER"}${sum.records ? ` · ${sum.records} ${sum.records === 1 ? "REKORD" : "REKORDER"}` : ""}`
    : "ÉN ØKT NÆRMERE"
  ctx.fillText(foot, PAD, H - PAD)
  ctx.textAlign = "right"; ctx.fillStyle = TL; ctx.fillText("URGE", W - PAD, H - PAD); ctx.textAlign = "left"

  return new Promise(res => c.toBlob(b => res({ blob: b, url: c.toDataURL("image/png") }), "image/png"))
}

// Native share sheet when available (iOS/Android), otherwise download
export async function shareImage(blob, filename, text) {
  const file = new File([blob], filename, { type: "image/png" })
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], text }); return "shared" }
    catch (e) { if (e?.name === "AbortError") return "cancelled" }
  }
  const a = document.createElement("a")
  a.href = URL.createObjectURL(blob); a.download = filename
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 5000)
  return "downloaded"
}
