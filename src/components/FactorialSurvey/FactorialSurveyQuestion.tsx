import { FactorialOption, RatedQuestion } from "../../util/stateInterfaces"
import MarkdownText from "../MarkdownText"

interface Props {
  question: RatedQuestion
  options: FactorialOption[]
  onClick: (questionId: string, rate: number | null, chosenOption: string) => void
  disabled?: boolean
}

const SurveyQuestion: React.FC<React.PropsWithChildren<Props>> = ({
  question,
  options,
  onClick,
  disabled,
}) => {
  return (
    <form>
      <div className="radio">
        <fieldset>
          <legend>
            <MarkdownText text={question.question} />
          </legend>
          {options.map((option) => {
            return (
              <div key={option.id}>
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
              </div>
            )
          })}
        </fieldset>
      </div>
    </form>
  )
}

export default SurveyQuestion
