// Colors
export const P = "#7c5cfc"
export const PL = "rgba(124,92,252,0.12)"
export const PM = "#a78bfa"
export const AC = "#4ade80"
export const SM = "#b07cc3"
export const SML = "rgba(176,124,195,0.12)"
export const BG = "#0a0a0f"
export const BG2 = "#111118"
export const BG3 = "#18181f"
export const BD = "#222230"
export const TX = "#e8e6e1"
export const TM = "#8888a0"
export const TL = "#555568"

// Fonts
export const mn = "'DM Mono',monospace"
export const sf = "'Source Serif 4',Georgia,serif"

// Shared styles
export const glass = {
  backgroundColor: "rgba(20,20,30,0.7)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  borderRadius: 20,
  padding: "20px",
  marginBottom: 12,
  border: "1px solid rgba(255,255,255,0.06)"
}

export const bp = {
  width: "100%",
  padding: "18px 24px",
  borderRadius: 14,
  border: "none",
  background: `linear-gradient(135deg, ${P} 0%, #6344d0 100%)`,
  color: "#fff",
  fontSize: 16,
  fontFamily: sf,
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: `0 4px 24px rgba(124,92,252,0.3)`
}

export const bsm = {
  ...bp,
  background: SML,
  color: SM,
  boxShadow: "none",
  border: `1px solid rgba(176,124,195,0.2)`
}

export const bgg = {
  ...bp,
  background: "transparent",
  color: TM,
  boxShadow: "none",
  border: `1px solid ${BD}`
}

export const stt = {
  fontSize: 13,
  fontFamily: mn,
  color: TL,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  marginBottom: 12,
  marginTop: 24
}

export const ip = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 12,
  border: `1px solid ${BD}`,
  backgroundColor: BG2,
  fontSize: 15,
  fontFamily: sf,
  color: TX,
  outline: "none",
  boxSizing: "border-box",
  marginBottom: 10
}

export const ba = {
  fontFamily: sf,
  color: TX,
  backgroundColor: BG,
  minHeight: "100vh",
  maxWidth: 430,
  margin: "0 auto",
  position: "relative",
  paddingBottom: 90
}
