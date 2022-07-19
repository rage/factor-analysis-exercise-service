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

const StyledEditor = styled.div`
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

const DeleteButton = styled.button`
  width: 2rem;
  height: 2rem;
`

const QuestionEditor: React.FC<Props> = ({
  item,
  onDelete,
  onChangeQuestion,
}) => {
  return (
    <StyledEditor>
      <div
        className={css`
            flex: 1;
            margin: 0.5rem;
          `}
      >
        {item.question && <MarkdownText text={item.question} />}
      </div>
      <TextArea
        label="Question text editor"
        value={item.question ?? ""}
        onChange={(value) => {
          onChangeQuestion({ ...item, question: value })
        }}
        className={css`
        flex: 1;
        padding: 0.5rem;
        width: 100%;
        margin: 0 auto;
        margin-right: 0.5rem;
        `}
      />
      {/* eslint-disable-next-line i18next/no-literal-string */}
      <select
        onChange={(event) => {
          const answer: Answer = item.answer ?? { id: v4(), type: AnswerType.None, answer: "", options: null }
          const answerType: AnswerType = (event.target.value as unknown as AnswerType)
          if (!answerType) return
          onChangeQuestion({ ...item, answer: { ...answer, type: answerType } })
        }}>

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
      <DeleteButton onClick={onDelete}>x</DeleteButton>
      {(item.answer?.type === AnswerType.MultiChoice || item.answer?.type === AnswerType.RadioGroup) &&
        <div>
          input youroptions here
        </div>
      }
    </StyledEditor>
  )
}

export default QuestionEditor
