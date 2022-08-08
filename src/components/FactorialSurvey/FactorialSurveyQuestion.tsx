import styled from "@emotion/styled"

import { FactorialOption, RatedQuestion } from "../../util/stateInterfaces"
import { ExerciseItemHeader } from "../ExerciseItemHeader"
import MarkdownText from "../MarkdownText"
import { RadioGroupWrap } from "../StyledComponents/RadioGroupWrap"

interface Props {
  question: RatedQuestion
  options: FactorialOption[]
  onClick: (questionId: string, rate: number | null, chosenOption: string) => void
  disabled?: boolean
}

const ItemWrapper = styled.div`
  margin-top: 1rem;
  margin-bottom: 2rem;
  margin-left: 1rem;
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
              <RadioGroupWrap key={option.id} checkedCollor="#32BEA6" border={false}>
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
              </RadioGroupWrap>
            )
          })}
        </div>
      </form>
    </ItemWrapper>
  )
}

export default SurveyQuestion
