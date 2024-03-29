import { FactorialOption, Question } from "../../../util/spec-types/privateSpec"
import { RatedQuestion } from "../../../util/spec-types/userAnswer"
import { ExerciseItemHeader } from "../../StyledComponents/ExerciseItemHeader"
import { CheckedRadioGroupWrap } from "../../StyledComponents/RadioGroupWrap"
import { ItemWrapper } from "../../StyledComponents/Wrappers"

interface Props {
  question: Question
  ratedQuestion: RatedQuestion
  questionText: string
  options: FactorialOption[]
  onClick: (questionLabel: string, chosenOptionId: string) => void
  disabled?: boolean
}

/* const withBorder = {
  border: true,
  checkedColor: "#44827E",
} */

const noBorder = {
  border: false,
  checkedColor: "#32BEA6",
}

const FactorialSurveyQuestion: React.FC<React.PropsWithChildren<Props>> = ({
  question,
  ratedQuestion,
  questionText,
  options,
  onClick,
  disabled,
}) => {
  return (
    <ItemWrapper>
      <form>
        <div className="radio">
          <ExerciseItemHeader titleText={questionText} />
          {options.map((option, idx) => {
            return (
              <CheckedRadioGroupWrap key={option.id} {...noBorder} disabled={disabled}>
                <input
                  type="radio"
                  id={`${question.questionLabel}-factorial-option-${idx + 1}`}
                  value={option.value ?? undefined}
                  onChange={() => {
                    onClick(question.questionLabel, option.id)
                  }}
                  checked={ratedQuestion.chosenOptionId === option.id}
                  required
                  disabled={disabled}
                />
                <label htmlFor={`${question.questionLabel}-factorial-option-${idx + 1}`}>
                  {option.name}
                </label>
              </CheckedRadioGroupWrap>
            )
          })}
        </div>
      </form>
    </ItemWrapper>
  )
}

export default FactorialSurveyQuestion
