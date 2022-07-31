import { FactorialOption, RatedQuestion } from "../../util/stateInterfaces"
import MarkdownText from "../MarkdownText"

interface Props {
  question: RatedQuestion
  options: FactorialOption[]
  onClick: (questionId: string, rate: number | null, chosenOption: string) => void
}

const SurveyQuestion: React.FC<Props> = ({
  question,
  options,
  onClick
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
              <div>
                <input
                  type="radio"
                  value={option.value ?? undefined}
                  onChange={(e) => {
                    onClick(
                      question.questionId, 
                      isNaN(parseInt(e.target.value)) ? null : parseInt(e.target.value), 
                      option.name)
                  }}
                  checked={question.chosenOption === option.name}
                  required
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