/* eslint-disable i18next/no-literal-string */
import { css } from "@emotion/css"
import styled from "@emotion/styled"
import { v4 } from "uuid"

import TextArea from "../../shared-module/components/InputFields/TextAreaField"
import { Answer, AnswerType, Survey, SurveyItem } from "../../util/stateInterfaces"
import { parseLabelQuestion } from "../../util/utils"
import MarkdownText from "../MarkdownText"

import SelectConditionForItem from "./SelectConditionForItem"
interface Props {
  item: SurveyItem
  onDelete: () => void
  onChangeSurveyItem: (item: SurveyItem) => void
  state: Survey
}

const StyledOuterEditor = styled.div`
  margin: 0 auto;
  margin-bottom: 1rem;
  width: 100%;
  border: 1px solid black;
  padding: 1rem;
  display: flex;
  align-items: left;
  justify-content: space-apart;
  flex-direction: column;
`

const StyledInnerEditor = styled.div`
  margin: 0 auto;
  margin-bottom: 1rem;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-apart;
`

const DeleteButton = styled.button`
  width: 2rem;
  height: 2rem;
`

const Input = styled.input`
  padding: 0.5rem;
  width: 100%;
  margin: 0 auto;
  margin-right: 0.5rem;
`

const SurveyItemEditor: React.FC<React.PropsWithChildren<Props>> = ({
  item,
  onDelete,
  onChangeSurveyItem,
  state,
}) => {
  return (
    <StyledOuterEditor>
      <legend>{item.question.questionLabel}</legend>
      <StyledInnerEditor>
        <div
          className={css`
            flex: 1;
            padding: 0.5rem;
            width: 100%;
            margin: 0 auto;
            margin-right: 0.5rem;
          `}
        >
          {item.question && <MarkdownText text={item.question.question} />}
        </div>
        <DeleteButton onClick={onDelete}>x</DeleteButton>
      </StyledInnerEditor>
      <TextArea
        label="Editor (label ; question)"
        //value={item.question.question ?? ""}   If this, then label wont show, neither will text appear unless it's correctly parsed
        onChange={(value) => {
          const parsedValue = parseLabelQuestion(value)
          if (!parsedValue) {
            return
          }
          onChangeSurveyItem({
            ...item,
            question: { ...item.question, questionLabel: parsedValue[0], question: parsedValue[1] },
          })
        }}
        className={css`
          flex: 1;
          padding: 0rem;
          width: 100%;
          margin: 0 auto;
          margin-right: 0.5rem;
        `}
      />

      {/* eslint-disable-next-line i18next/no-literal-string */}
      <select
        onChange={(event) => {
          const answer: Answer = item.answer ?? {
            id: v4(),
            type: AnswerType.None,
            answer: "",
            options: [],
          }
          const answerType: AnswerType = event.target.value as unknown as AnswerType
          if (!answerType) {
            return
          }
          onChangeSurveyItem({ ...item, answer: { ...answer, type: answerType } })
        }}
        className={css`
          flex: 1;
          padding: 0rem;
          width: 100%;
          margin: 0 auto;
          margin-right: 0.5rem;
          margin-top: 1rem;
          margin-bottom: 1rem;
        `}
        value={item.answer.type}
      >
        {Object.values(AnswerType).map((t) => {
          if (t === AnswerType.None) {
            return <option value={AnswerType.None}>Select answer type</option>
          }
          return (
            <option value={t} key={t}>
              {t}
            </option>
          )
        })}
      </select>

      {(item.answer?.type === AnswerType.MultiChoice ||
        item.answer?.type === AnswerType.RadioGroup) && (
        <div>
          <ol>
            {item.answer.options.map((o, o_idx) => {
              return (
                <li key={o_idx}>
                  <StyledInnerEditor>
                    <Input
                      value={o}
                      type="text"
                      onChange={(e) => {
                        const newAnswer = item.answer
                        newAnswer.options[o_idx] = e.target.value
                        onChangeSurveyItem({ ...item, answer: newAnswer })
                      }}
                    />
                    <DeleteButton
                      onClick={() => {
                        const newAnswer = {
                          ...item.answer,
                          options: item.answer.options.filter((e) => o !== e),
                        }
                        onChangeSurveyItem({ ...item, answer: newAnswer })
                      }}
                    >
                      x
                    </DeleteButton>
                  </StyledInnerEditor>
                </li>
              )
            })}
          </ol>

          <button
            onClick={() => {
              const newItem = item as SurveyItem
              newItem.answer.options.push("")
              onChangeSurveyItem({ ...item, answer: newItem.answer })
            }}
          >
            add option
          </button>
        </div>
      )}
      <StyledInnerEditor>
        <legend>Conditional</legend>
        <input
          type="checkbox"
          checked={item.conditional}
          onChange={(e) => {
            onChangeSurveyItem({
              ...item,
              conditional: e.target.checked,
              dependsOn: undefined,
            })
          }}
        />
      </StyledInnerEditor>
      {item.conditional && (
        <SelectConditionForItem item={item} onChangeSurveyItem={onChangeSurveyItem} state={state} />
      )}
    </StyledOuterEditor>
  )
}

export default SurveyItemEditor
