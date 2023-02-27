import { Factor, ReportVariable } from "./privateSpec"

export interface ExerciseFeedback {
  userVar?: ReportVariable
  comparingVar?: ReportVariable
  zeroVar?: ReportVariable
  titleText?: string
  noReportMessage?: string
  factorReport: FactorReport[] | null
}

export type FactorReport = Omit<Factor, "weights"> & { score: number }

export interface Rate {
  questionLabel: string
  rate: number | null
}
