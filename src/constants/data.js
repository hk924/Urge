export const CONF = 0.3

export const ST = [
  "Det er helt greit.",
  "Skjer den beste.",
  "Ikke la dette stoppe deg.",
  "Én dårlig beslutning er ikke en dårlig uke.",
  "Du er fortsatt på rett vei.",
  "Pust ut. Start på nytt.",
  "Det definerer ikke deg.",
  "Morgendagen er en ny sjanse."
]

export const GQ = [
  { q: "Hvert nei bringer deg nærmere {goal}." },
  { q: "Du gjør dette for {why}. Hold kursen." },
  { q: "{goal} krever små valg hver dag. Dette var et av dem." },
  { q: "Du valgte {why} over en kortvarig fristelse." },
  { q: "Hver motstått fristelse er et skritt mot {goal}." },
  { q: "Kroppen din bygger seg mot {goal} akkurat nå." },
  { q: "Du viser {why} hva prioritering betyr." },
  { q: "Disiplin i dag. {goal} i morgen." },
  { q: "Den følelsen av kontroll? Den tar deg til {goal}." }
]

export const FQ = [
  "Du valgte deg selv i dag.",
  "Én fristelse motstått er én seier.",
  "Bare fortsett.",
  "Sterkere enn fristelsen.",
  "Seire legger seg opp.",
  "Disiplin er frihet.",
  "Ikke perfeksjon. Retning."
]

export const DEF_GOALS = [
  { id: "weight", label: "Gå ned i vekt", icon: "\u2193" },
  { id: "bp", label: "Bedre blodtrykk", icon: "\u2665" },
  { id: "run", label: "Løpe halvmaraton", icon: "\u27A1" },
  { id: "energy", label: "Mer energi", icon: "\u26A1" },
  { id: "noMeds", label: "Uten medisiner", icon: "\u2736" }
]

export const WHY_OPTIONS = [
  { id: "self", label: "For meg selv", icon: "\u2605" },
  { id: "family", label: "For familien", icon: "\u2665" },
  { id: "work", label: "Bedre leder", icon: "\u2191" },
  { id: "health", label: "For helsen", icon: "\u2724" }
]

export const DEF_TRIGGERS = [
  { id: "unique", label: "Unik mulighet", icon: "sparkle" },
  { id: "errand", label: "Snike meg til på ærend", icon: "bag" },
  { id: "happy", label: "Var happy", icon: "sun" },
  { id: "down", label: "Var nedfor", icon: "cloud" },
  { id: "fasting", label: "Droppet frokost (IF)", icon: "sparkle" }
]

export const DEF_MILESTONES = [
  { a: 500, l: "En god flaske vin" },
  { a: 1000, l: "Skikkelig god middag ute" },
  { a: 2500, l: "Nytt treningsplagg" },
  { a: 5000, l: "Et par nye sko" },
  { a: 10000, l: "En weekend-tur" },
  { a: 25000, l: "Ny Fujifilm-linse" }
]

export const DEF_COST = 50

export const MO = [
  { id: "good", label: "En god minusdag", color: "#7c5cfc", bg: "rgba(124,92,252,0.12)" },
  { id: "ok", label: "Helt ok", color: "#e8e6e1", bg: "rgba(255,255,255,0.05)" },
  { id: "smell", label: "Gikk på smell", color: "#b07cc3", bg: "rgba(176,124,195,0.12)" }
]

export const WTS = ["Gåtur", "Styrke", "Løping", "Sykling", "Annet"]

export const STREAK_LEVELS = [
  { level: 1, min: 0, label: "Nivå 1" },
  { level: 2, min: 7, label: "Nivå 2" },
  { level: 3, min: 30, label: "Nivå 3" },
  { level: 4, min: 100, label: "Nivå 4" },
]
