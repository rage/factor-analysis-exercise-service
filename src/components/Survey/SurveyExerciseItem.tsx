import { Answer, AnswerType, SurveyItem } from "../../util/stateInterfaces"
import BreedList from "../BreedList"

interface Props {
  item: SurveyItem
  updateAnswer: (itemId: string, answer: Answer) => void
  disabled?: boolean
}

const SurveyExerciseitem: React.FC<React.PropsWithChildren<Props>> = ({
  item,
  updateAnswer,
  disabled,
}) => {
  switch (item.answer.type) {
    case AnswerType.BreedList: {
      return (
        <div>
          <BreedList
            onClick={(breed) => {
              updateAnswer(item.id, { ...item.answer, answer: breed })
            }}
            chosenBreed={item.answer.answer as string}
            disabled={disabled}
          />
        </div>
      )
    }
    case AnswerType.Number: {
      return (
        <div>
          <input
            value={item.answer.answer ?? ""}
            type="number"
            onChange={(e) => {
              updateAnswer(item.id, { ...item.answer, answer: e.target.value })
            }}
            required
            disabled={disabled}
          />
        </div>
      )
    }
    case AnswerType.Text: {
      return (
        <div>
          <input
            value={item.answer.answer ?? ""}
            type="text"
            onChange={(e) => {
              updateAnswer(item.id, { ...item.answer, answer: e.target.value })
            }}
            required
            disabled={disabled}
          />
        </div>
      )
    }
    case AnswerType.MultiChoice: {
      const selectedOptions: string[] = (item.answer.answer as string[]) || []
      return (
        <div>
          {item.answer.options.map((o) => {
            return (
              <div key={o}>
                <input
                  type="checkbox"
                  id={o}
                  name={o}
                  checked={selectedOptions.includes(o)}
                  onChange={(e) => {
                    const newSeleceted = selectedOptions.filter((option) => o !== option)
                    e.target.checked && newSeleceted.push(o)
                    const newAnswer = { ...item.answer, answer: newSeleceted }
                    updateAnswer(item.id, newAnswer)
                  }}
                  disabled={disabled}
                />
                <label>{o}</label>
              </div>
            )
          })}
        </div>
      )
    }
    case AnswerType.RadioGroup: {
      return (
        <form>
          <div className="radio">
            {item.answer.options.map((option) => {
              return (
                <div key={option}>
                  <input
                    type="radio"
                    value={option}
                    onChange={(e) => {
                      updateAnswer(item.id, { ...item.answer, answer: e.target.value })
                    }}
                    checked={option === item.answer.answer}
                    required
                    disabled={disabled}
                  />
                  <label>{option}</label>
                </div>
              )
            })}
          </div>
        </form>
      )
    }
    case AnswerType.Date: {
      return (
        <form>
          <input
            type="date"
            onChange={(e) => {
              updateAnswer(item.id, { ...item.answer, answer: e.target.value })
            }}
            required
            value={item.answer.answer as string}
            disabled={disabled}
          />
        </form>
      )
    }
    case AnswerType.Dropdown: {
      return (
        <>
          <select
            onChange={(e) => {
              updateAnswer(item.id, { ...item.answer, answer: e.target.value })
            }}
            value={item.answer.answer as string}
            required
            disabled={disabled}
          >
            {item.answer.options.map((option) => {
              return (
                <option key={option} value={option}>
                  {option}
                </option>
              )
            })}
          </select>
        </>
      )
    }
    default: {
      // eslint-disable-next-line i18next/no-literal-string
      return <p>unsupported answer type</p>
    }
  }
}

export default SurveyExerciseitem
