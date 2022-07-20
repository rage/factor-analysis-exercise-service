import { css } from "@emotion/css"
import styled from "@emotion/styled"
import { v4 } from "uuid"
import TextArea from "../../shared-module/components/InputFields/TextAreaField"

import { Answer, AnswerType, SurveyItem } from "../../util/stateInterfaces"
import MarkdownText from "../MarkdownText"
interface Props {
  item: SurveyItem
  onDelete: () => void
  onChangeQuestion: (item: SurveyItem) => void
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
  border: 1px solid black;
  padding: 1rem;
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

const QuestionEditor: React.FC<Props> = ({
  item,
  onDelete,
  onChangeQuestion,
}) => {
  return (
    <StyledOuterEditor>
      <StyledInnerEditor>
        <div
          className={css`
            flex: 1;
            padding: 0.5rem;
            width: 100%;
            margin: 0 auto;
            margin-right: 0.5rem;
        `}>
          {item.question && <MarkdownText text={item.question} />}
        </div>
        <DeleteButton onClick={onDelete}>x</DeleteButton>
      </StyledInnerEditor>

      <TextArea
        label="Question text editor"
        value={item.question ?? ""}
        onChange={(value) => {
          onChangeQuestion({ ...item, question: value })
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
          const answer: Answer = item.answer ?? { id: v4(), type: AnswerType.None, answer: "", options: [] }
          const answerType: AnswerType = (event.target.value as unknown as AnswerType)
          if (!answerType) return
          onChangeQuestion({ ...item, answer: { ...answer, type: answerType } })
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
        defaultValue={AnswerType.None}>

        {Object.values(AnswerType).map((t) => {
          if (t === AnswerType.None) {
            return <option value={AnswerType.None}>Choose answer type</option>
          }
          return (
            <option
              value={t}
              key={t}
              selected={item.answer?.type === t ? true : false}
            >
              {t}
            </option>
          )
        })}
      </select>

      {(item.answer?.type === AnswerType.MultiChoice || item.answer?.type === AnswerType.RadioGroup) &&
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
                        onChangeQuestion({ ...item, answer: newAnswer })
                      }}
                    />
                    <DeleteButton
                      onClick={() => {
                        const newAnswer = { ...item.answer, options: item.answer.options.filter((e) => o !== e) }
                        onChangeQuestion({ ...item, answer: newAnswer })
                      }}>x</DeleteButton>
                  </StyledInnerEditor>
                </li>
              )
            })}
          </ol>

          <button onClick={() => {
            const newItem = item as SurveyItem
            newItem.answer.options.push("")
            onChangeQuestion({ ...item, answer: newItem.answer })
          }}>add option</button>
        </div>
      }
    </StyledOuterEditor>
  )
}

export default QuestionEditor
