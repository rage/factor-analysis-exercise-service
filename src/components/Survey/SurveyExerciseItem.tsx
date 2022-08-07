import { css } from "@emotion/css"
import styled from "@emotion/styled"

import { Answer, AnswerType, SurveyItem } from "../../util/stateInterfaces"
import BreedList from "../BreedList"

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

const CheckboxWrap = styled.div`
  margin-bottom: 1.5px;
  display: flex;
  font-family: "Raleway";
  font-style: normal;
  font-weight: 500;
  font-size: 18px;
  line-height: 25px;
  color: #1a2333;
  align-items: left;

  input[type="checkbox"] {
    appearance: none;
    background-color: #fff;
    margin-right: 10px;
    margin-top: 5px;
    font: inherit;
    color: currentColor;
    width: 1.15em;
    height: 1.1em;
    border: 1px solid #989ca3;
    transform: translateY(-0.075em);
    display: grid;
    place-content: center;
  }

  input[type="checkbox"]:before {
    content: "";
    width: 0.65em;
    height: 0.65em;
    transform: scale(0);
    transition: 120ms transform ease-in-out;
    box-shadow: inset 1em 1em #fff;
    clip-path: polygon(28% 38%, 41% 53%, 75% 24%, 86% 38%, 40% 78%, 15% 50%);
  }

  input[type="checkbox"]:checked {
    border-color: ${CHECKED};
    background: ${CHECKED};
  }
  input[type="checkbox"]:checked::before {
    transform: scale(1);
  }
`

const RadioGroupWrap = styled.div`
  margin-bottom: 2px;
  display: flex;
  border: 2px solid #ebedee;
  border-radius: 2px;
  font-family: "Raleway";
  font-style: normal;
  font-weight: 500;
  font-size: 18px;
  line-height: 60px;
  color: #1a2333;
  align-items: left;

  input[type="radio"] {
    appearance: none;
    background-color: #fff;
    margin-right: 10px;
    margin-top: 20px;
    margin-left: 20px;
    font: inherit;
    color: currentColor;
    width: 1.15em;
    height: 1.1em;
    border: 1px solid #c1c1c1;
    border-radius: 1em;
    transform: translateY(-0.075em);
    display: grid;
    place-content: center;
  }

  input[type="radio"]:before {
    content: "";
    width: 0.65em;
    height: 0.65em;
    transform: scale(0);
    transition: 120ms transform ease-in-out;
    box-shadow: inset 1em 1em #fff;
    clip-path: polygon(28% 38%, 41% 53%, 75% 24%, 86% 38%, 40% 78%, 15% 50%);
  }

  input[type="radio"]:checked {
    border-color: ${CHECKED};
    background: ${CHECKED};
  }

  input[type="radio"]:checked::before {
    transform: scale(1);
  }
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
              <CheckboxWrap key={o}>
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
                <RadioGroupWrap key={option}>
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
            value={item.answer.answer as string}
            required
            disabled={disabled}
          >
            <option></option>
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
      return <p>unsupported answer type</p>
    }
  }
}

export default SurveyExerciseitem
