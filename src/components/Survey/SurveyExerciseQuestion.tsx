import { Answer, AnswerType, SurveyItem } from "../../util/stateInterfaces"
import BreedList from "../BreedList"

interface Props {
  question: SurveyItem
  updateAnswer: (questionId: string, answer: Answer) => void
}

const SurveyExerciseQuestion: React.FC<Props> = ({
  question,
  updateAnswer,
}) => {
  console.log("in the right question thingie")
  switch (question.answer.type) {
    case AnswerType.BreedList: {
      return (
        <div>
          <BreedList onClick={value => console.log(value)} />
        </div>
      )
    }
    case AnswerType.Number: {
      return (
        <div>
          <input
            value={question.answer.answer ?? ''}
            type="number"
            onChange={(e) => {
              const newAnswer = question.answer
              newAnswer.answer = e.target.value
              updateAnswer(question.id, newAnswer)
            }}
          />
        </div>
      )
    }
    case AnswerType.Text: {
      return (
        <div>
          <input
            value={question.answer.answer ?? ''}
            type="text"
            onChange={(e) => {
              const newAnswer = question.answer
              newAnswer.answer = e.target.value
              updateAnswer(question.id, newAnswer)
            }}
          />
        </div>
      )
    }
    case AnswerType.MultiChoice: {
      const selectedOptions: string[] = question.answer.answer as string[] || []
      return (
        <div>
          {question.answer.options.map((o) => {
            return (
              <div>
                <input
                  type="checkbox"
                  id={o}
                  name={o}
                  checked={selectedOptions.includes(o)}
                  onChange={(e) => {
                    const newSeleceted = selectedOptions.filter(option => o !== option)
                    e.target.checked && newSeleceted.push(o)
                    const newAnswer = { ...(question.answer), answer: newSeleceted }
                    updateAnswer(question.id, newAnswer)
                  }} />
                <label>{o}</label>
              </div>
            )
          })}
        </div >
      )
    }
    case AnswerType.RadioGroup: {
      return (
        <form>
          <div className="radio">
            {question.answer.options.map((option) => {
              return (
                <div>
                  <input
                    type="radio"
                    value={option}
                    onChange={(e) => {
                      updateAnswer(question.id, { ...question.answer, answer: e.target.value })
                    }}
                    checked={option === question.answer.answer}
                    required
                  />
                  <label>{option}</label>
                </div>
              )
            })}
          </div>
        </form>
      )
    }
    default: {
      return (
        <p>unsupported answer type</p>
      )
    }
  }
}

export default SurveyExerciseQuestion