export const WITHINGS_AUTH_URL = "https://account.withings.com/oauth2_user/authorize2"
export const WITHINGS_TOKEN_URL = "https://wbsapi.withings.net/v2/oauth2"
export const WITHINGS_MEASURE_URL = "https://wbsapi.withings.net/measure"

// Withings measure type IDs
export const MEASURE_TYPES = {
  WEIGHT: 1,        // kg
  FAT_PERCENT: 6,   // %
  MUSCLE_MASS: 76,  // kg (we convert to %)
  FAT_MASS: 8,      // kg
  BONE_MASS: 88,    // kg
} as const

// Decode Withings measure value: value * 10^unit
export function decodeMeasure(value: number, unit: number): number {
  return parseFloat((value * Math.pow(10, unit)).toFixed(2))
}
