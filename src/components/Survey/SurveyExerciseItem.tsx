import { css } from "@emotion/css"
import styled from "@emotion/styled"

import { Answer, AnswerType, SurveyItem } from "../../util/stateInterfaces"
import MarkdownText from "../MarkdownText"
import AdvancedDropdown from "../SharedMisc/AdvancedDropdown"
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
    case AnswerType.AdvancedDropdown: {
      return (
        <div
          className={css`
            display: grid;
            margin-bottom: 5em;
            gap: 0.5em;
          `}
        >
          <AdvancedDropdown
            onClick={(option) => {
              updateAnswer(item.id, { ...item.answer, answer: option })
            }}
            chosenOption={item.answer.answer as string}
            disabled={disabled}
            options={item.answer.options}
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
              <CheckboxWrap key={o} checkedCollor={CHECKED} disabled={disabled}>
                <input
                  aria-label={o}
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
                <RadioGroupWrap key={option} checkedColor={CHECKED} disabled={disabled}>
                  <input
                    aria-label={option}
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
            aria-label={`${item.question.questionLabel}-dropdown-selection`}
            onChange={(e) => {
              updateAnswer(item.id, { ...item.answer, answer: e.target.value })
            }}
            value={item.answer.answer ? (item.answer.answer as string) : "default"}
            required
            disabled={disabled}
          >
            <option value="default" disabled label="--"></option>
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
    case AnswerType.ConsentCheckbox: {
      return (
        <div>
          <CheckboxWrap checkedCollor={"rgb(55, 188, 155)"} info>
            <input
              aria-label="consent-checkbox"
              type="checkbox"
              id={item.id}
              name={item.answer.options[0]}
              checked={(item.answer.answer as string).length > 0}
              onChange={(e) => {
                const newAnswer = { ...item.answer, answer: e.target.checked ? "checked" : "" }
                updateAnswer(item.id, newAnswer)
              }}
              disabled={disabled}
            />
            <MarkdownText text={item.answer.options.join("")} />
          </CheckboxWrap>
        </div>
      )
    }
    default: {
      // eslint-disable-next-line i18next/no-literal-string
      return null
    }
  }
}

export default SurveyExerciseitem
