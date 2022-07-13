import { Label, RatedQuestion } from "../util/stateInterfaces"
import MarkdownText from "./MarkdownText"

interface Props {
  question: RatedQuestion
  options: Label[]
  onClick: (questionId: string, rate: number | "NaN") => void
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
                  value={option.value}
                  onChange={(e) => {
                    onClick(question.questionId, isNaN(parseInt(e.target.value)) ? "NaN" : parseInt(e.target.value))
                  }}
                  checked={question.rate === option.value}
                />
                <label>{option.label}</label>
              </div>
            )
          })}
        </fieldset>
      </div>
    </form>

  )
}

export default SurveyQuestion