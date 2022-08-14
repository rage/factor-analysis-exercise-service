import styled from "@emotion/styled"

import { FactorialOption, RatedQuestion } from "../../util/stateInterfaces"
import { ExerciseItemHeader } from "../StyledComponents/ExerciseItemHeader"
import { CheckedRadioGroupWrap, RadioGroupWrap } from "../StyledComponents/RadioGroupWrap"

interface Props {
  question: RatedQuestion
  options: FactorialOption[]
  onClick: (questionId: string, rate: number | null, chosenOption: string) => void
  disabled?: boolean
}

const ItemWrapper = styled.div`
  margin-top: 1rem;
  margin-bottom: 2rem;
  margin-left: 0.5rem;
  margin-right: 0.5;
`

const SurveyQuestion: React.FC<React.PropsWithChildren<Props>> = ({
  question,
  options,
  onClick,
  disabled,
}) => {
  return (
    <ItemWrapper>
      <form>
        <div className="radio">
          <ExerciseItemHeader questionText={question.question} />
          {options.map((option) => {
            return (
              <CheckedRadioGroupWrap key={option.id} checkedCollor="#32BEA6" border={true}>
                <input
                  type="radio"
                  value={option.value ?? undefined}
                  onChange={(e) => {
                    onClick(
                      question.questionId,
                      isNaN(parseInt(e.target.value)) ? null : parseInt(e.target.value),
                      option.name,
                    )
                  }}
                  checked={question.chosenOption === option.name}
                  required
                  disabled={disabled}
                />
                <label>{option.name}</label>
              </CheckedRadioGroupWrap>
            )
          })}
        </div>
      </form>
    </ItemWrapper>
  )
}

export default SurveyQuestion
