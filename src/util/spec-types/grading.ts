import { Factor, LegendKey } from "./privateSpec"

export interface ExerciseFeedback {
  userVar?: LegendKey
  comparingVar?: LegendKey
  zeroVar?: LegendKey
  titleText?: string
  noReportMessage?: string
  factorReport: FactorReport[] | null
}

export type FactorReport = Omit<Factor, "weights"> & { score: number }

export interface Rate {
  questionLabel: string
  rate: number | null
}
