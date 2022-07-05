import { FactorialSurvey, Label, Question } from "./stateInterfaces";

export function migrateFactorialSurvey(oldForm: unknown): FactorialSurvey {
  return {
    ...(oldForm as FactorialSurvey),
    optionLabels: (oldForm as FactorialSurvey).optionLabels.map((x) => (migrateLabels(x))),
    // questions: (oldForm as FactorialSurvey).questions.map((x) => migrateWeights(x)),
  }
}

function migrateLabels(oldLabel: unknown): Label {
  return{
    ...(oldLabel as Label)
  }
}

/*
function migrateWeights(oldQuestion: unknown): Question {
  return {
    ...(oldQuestion as Question),
    factorWeights: (oldQuestion as Question).factorWeights.map((x) => (x as number))
  }
}
*/