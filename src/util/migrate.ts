import { FactorQuery, Label, Question } from "./stateInterfaces";

export function migrateFactorQuery(oldForm: unknown): FactorQuery {
  return {
    ...(oldForm as FactorQuery),
    optionLabels: (oldForm as FactorQuery).optionLabels.map((x) => (migrateLabels(x))),
    questions: (oldForm as FactorQuery).questions.map((x) => migrateWeights(x)),
  }
}

function migrateLabels(oldLabel: unknown): Label {
  return{
    ...(oldLabel as Label)
  }
}

function migrateWeights(oldQuestion: unknown): Question {
  return {
    ...(oldQuestion as Question),
    factorWeights: (oldQuestion as Question).factorWeights.map((x) => (x as number))
  }
}