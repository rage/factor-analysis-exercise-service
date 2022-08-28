/* eslint-disable i18next/no-literal-string */
import { css } from "@emotion/css"

import TextArea from "../../../shared-module/components/InputFields/TextAreaField"
import { baseTheme, primaryFont } from "../../../shared-module/styles"
import { Answer, AnswerType, Survey, SurveyItem } from "../../../util/stateInterfaces"
import { parseLabelQuestion, reverseParseLabelQuestion } from "../../../util/utils"
import MarkdownText from "../../MarkdownText"
import {
  DeleteButton,
  Input,
  StyledInnerEditor,
  StyledOuterEditor,
} from "../../StyledComponents/Wrappers"

import SelectConditionForItem from "./SelectConditionForItem"
interface Props {
  item: SurveyItem
  onDelete: () => void
  onChangeSurveyItem: (item: SurveyItem) => void
  state: Survey
}

const SurveyItemEditor: React.FC<React.PropsWithChildren<Props>> = ({
  item,
  onDelete,
  onChangeSurveyItem,
  state,
}) => {
  return (
    <StyledOuterEditor>
      <fieldset>
        <legend>{item.question.questionLabel}</legend>
        <StyledInnerEditor>
          <div
            className={css`
              font-family: ${primaryFont};
              color: ${baseTheme.colors.grey[600]};
              font-style: normal;
              font-weight: 500;
              font-size: 20px;
              flex: 1;
              background-color: ${baseTheme.colors.clear[100]};
              width: 100%;
              margin: 0 auto;
              margin-right: 0.5rem;
              padding: 0.5rem;
            `}
          >
            {item.question && <MarkdownText text={item.question.question} />}
          </div>
          <DeleteButton onClick={onDelete}>x</DeleteButton>
        </StyledInnerEditor>
        <TextArea
          label="Editor"
          autoResize
          placeholder="question_label; question text"
          onChange={(value) => {
            const parsedValue = parseLabelQuestion(value)
            if (!parsedValue) {
              return
            }
            onChangeSurveyItem({
              ...item,
              question: {
                ...item.question,
                questionLabel: parsedValue[0],
                question: parsedValue[1],
              },
            })
          }}
          defaultValue={reverseParseLabelQuestion(
            item.question.questionLabel,
            item.question.question,
          )}
          className={css`
            flex: 1;
            padding: 0rem;
            width: 100%;
            textarea {
              width: 100%;
              resize: vertical;
              max-height: 150px;
              margin: 0 auto;
              margin-right: 0.5rem;
            }
          `}
        />

        {/* eslint-disable-next-line i18next/no-literal-string */}
        {item.question.questionLabel !== "info" && (
          <select
            onChange={(event) => {
              const answer: Answer = item.answer
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
                return (
                  <option key={AnswerType.None} value={AnswerType.None}>
                    Select answer type
                  </option>
                )
              }
              return (
                <option value={t} key={t}>
                  {t}
                </option>
              )
            })}
          </select>
        )}

        {(item.answer?.type === AnswerType.MultiChoice ||
          item.answer?.type === AnswerType.RadioGroup ||
          item.answer?.type === AnswerType.Dropdown) && (
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
        {item.answer?.type === AnswerType.ConsentCheckbox && (
          <TextArea
            label="Checkbox text editor"
            placeholder={"Consent message"}
            autoResize
            className={css`
              width: 100%;
              textarea {
                width: 100%;
                resize: vertical;
                max-height: 100px;
              }
            `}
            onChange={(value) => {
              onChangeSurveyItem({ ...item, answer: { ...item.answer, options: [value] } })
            }}
            defaultValue={item.answer.options[0]}
          />
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
          <SelectConditionForItem
            item={item}
            onChangeSurveyItem={onChangeSurveyItem}
            state={state}
          />
        )}
      </fieldset>
    </StyledOuterEditor>
  )
}

export default SurveyItemEditor
