import { Label, RatedQuestion } from "../util/stateInterfaces"

interface Props {
  question: RatedQuestion
  options: Label[]
  onClick: (questionId: string, rate: number) => void
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
          <legend>{question.question}</legend>
          {options.map((option) => {
            return (
              <div>
                <input
                  type="radio"
                  value={option.value}
                  onChange={(e) => {
                    onClick(question.questionId, parseInt(e.target.value) ?? NaN)
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