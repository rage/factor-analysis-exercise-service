import { css } from "@emotion/css"
import styled from "@emotion/styled"

import { Answer, AnswerType, SurveyItem } from "../../util/stateInterfaces"
import BreedList from "../BreedList"
import { CheckboxWrap } from "../StyledComponents/CheckboxWrap"
import { RadioGroupWrap } from "../StyledComponents/RadioGroupWrap"

const CHECKED = "#44827E"
interface Props {
  item: SurveyItem
  updateAnswer: (itemId: string, answer: Answer) => void
  disabled?: boolean
}

const Option = styled.option`
  text-align: left;
  padding: 0.5rem;
`

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
            className={css`
              border: 1px solid #e0e0e0;
              border-radius: 2px;
            `}
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
            className={css`
              border: 1px solid #e0e0e0;
              border-radius: 2px;
            `}
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
              <CheckboxWrap key={o} checkedCollor={CHECKED}>
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
              </CheckboxWrap>
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
                <RadioGroupWrap key={option} checkedCollor={CHECKED} border>
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
                </RadioGroupWrap>
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
            className={css`
              border: 1px solid #e0e0e0;
              border-radius: 2px;
            `}
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
            value={item.answer.answer ? (item.answer.answer as string) : "default"}
            required
            disabled={disabled}
          >
            <option value="default" disabled selected></option>
            {item.answer.options.map((option) => {
              return (
                <Option key={option} value={option}>
                  {option}
                </Option>
              )
            })}
          </select>
        </>
      )
    }
    default: {
      // eslint-disable-next-line i18next/no-literal-string
      return null
    }
  }
}

export default SurveyExerciseitem
