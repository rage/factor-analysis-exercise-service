import { css } from "@emotion/css"

import CheckBox from "../../../shared-module/components/InputFields/CheckBox"
import TextArea from "../../../shared-module/components/InputFields/TextAreaField"
import { baseTheme, primaryFont } from "../../../shared-module/styles"
import { respondToOrLarger } from "../../../shared-module/styles/respond"
import { Answer, AnswerType, Survey, SurveyItem } from "../../../util/spec-types/privateSpec"
import {
  insertVariablesToText,
  parseLabelQuestion,
  reverseParseLabelQuestion,
} from "../../../util/utils"
import MarkdownText from "../../MarkdownText"
import CsvReader from "../../SharedMisc/CsvReader"
import {
  DeleteButton,
  infoColor,
  infoHeaderColor,
  Input,
  StyledInnerEditor,
  StyledOuterEditor,
} from "../../StyledComponents/Wrappers"

import { SelectCondition } from "./SelectItemCondition"

interface Props {
  item: SurveyItem
  onDelete: () => void
  onChangeSurveyItem: (item: SurveyItem) => void
  onDuplicate: (item: SurveyItem) => void
  state: Survey
}

export const getBackgroundColor = (questionLabel: string) => {
  switch (questionLabel) {
    case "info":
      return infoColor
    case "info-header":
      return infoHeaderColor
    default:
      return "inherit"
  }
}

const SurveyItemEditor: React.FC<React.PropsWithChildren<Props>> = ({
  item,
  onDelete,
  onChangeSurveyItem,
  onDuplicate,
  state,
}) => {
  return (
    <StyledOuterEditor>
      <fieldset
        aria-label={`${item.question.questionLabel}.`}
        className={css`
          background-color: ${getBackgroundColor(item.question.questionLabel)};
          legend {
            font-family: ${primaryFont};
            font-style: normal;
            font-weight: 500;
            font-size: 18px;
          }
        `}
      >
        <legend>{item.question.questionLabel}</legend>
        <StyledInnerEditor>
          <div
            className={css`
              font-family: ${primaryFont};
              color: ${baseTheme.colors.gray[700]};
              font-style: normal;
              font-weight: 500;
              font-size: 20px;
              flex: 1;
              background-color: ${item.question.questionLabel === "info" ||
              item.question.questionLabel === "info-header"
                ? "inherit"
                : baseTheme.colors.clear[100]};
              width: 100%;
              margin: 0 auto;
              margin-right: 0.5rem;
              padding: 0.5rem;
            `}
          >
            {item.question && <MarkdownText text={insertVariablesToText(item.question.question)} />}
          </div>
          <DeleteButton onClick={onDelete}>{"x"}</DeleteButton>
        </StyledInnerEditor>
        <TextArea
          label={`Markdown Editor (special purpose labels: "info" & "info-header")`}
          autoResize
          placeholder="question_label; question text"
          onChange={(value) => {
            const parsedValue = parseLabelQuestion(value)
            if (!parsedValue) {
              return
            }
            const newItem = {
              ...item,
              question: {
                ...item.question,
                questionLabel: parsedValue[0],
                question: parsedValue[1],
              },
            }
            if (newItem.question.questionLabel === "info") {
              newItem.answer.type = AnswerType.None
              newItem.answer.options = []
              delete newItem.globalVariable
              delete newItem.question.mandatory
            }
            if (newItem.question.questionLabel === "info-header") {
              newItem.answer.type = AnswerType.ConsentCheckbox
              newItem.answer.options = []
              delete newItem.globalVariable
              delete newItem.question.mandatory
            }
            if (
              newItem.answer.type === AnswerType.ConsentCheckbox &&
              newItem.question.questionLabel !== "info-header"
            ) {
              newItem.answer.type = AnswerType.None
              newItem.answer.options = []
            }
            onChangeSurveyItem(newItem)
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
        {item.question.questionLabel && item.question.questionLabel !== "info" && (
          <select
            aria-label={`select-answer-type-${item.question.questionLabel}.`}
            onChange={(event) => {
              const answer: Answer = item.answer
              const answerType: AnswerType = event.target.value as unknown as AnswerType
              if (!answerType) {
                return
              }
              onChangeSurveyItem({
                ...item,
                answer: {
                  ...answer,
                  options:
                    answerType === AnswerType.Dropdown ||
                    answerType === AnswerType.MultiChoice ||
                    answerType === AnswerType.RadioGroup
                      ? [...answer.options]
                      : [],
                  type: answerType,
                },
              })
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
                  // eslint-disable-next-line i18next/no-literal-string
                  <option key={AnswerType.None} value={AnswerType.None}>
                    Select answer type
                  </option>
                )
              }
              return (
                <option
                  value={t}
                  key={t}
                  disabled={
                    (item.question.questionLabel === "info-header"
                      ? t !== AnswerType.ConsentCheckbox
                      : t === AnswerType.ConsentCheckbox) || t === AnswerType.FileUpload
                  }
                >
                  {t}
                </option>
              )
            })}
          </select>
        )}

        {(item.answer?.type === AnswerType.MultiChoice ||
          item.answer?.type === AnswerType.RadioGroup ||
          item.answer?.type === AnswerType.Dropdown ||
          item.answer?.type === AnswerType.AdvancedDropdown) && (
          <div>
            {item.answer.options.length > 0 && (
              <ol
                className={css`
                  width: 100%;
                  max-width: 100%;
                  max-height: 20em;
                  margin: 1rem auto;
                  display: block;
                  overflow-x: auto;
                  border-spacing: 0;
                `}
              >
                {item.answer.options.map((o, o_idx) => {
                  return (
                    <li key={o_idx}>
                      <StyledInnerEditor>
                        <Input
                          aria-label={`${o_idx}-option-text`}
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
                          {"x"}
                        </DeleteButton>
                      </StyledInnerEditor>
                    </li>
                  )
                })}
              </ol>
            )}
            <button
              onClick={() => {
                const newItem = item as SurveyItem
                newItem.answer.options.push("")
                onChangeSurveyItem({ ...item, answer: newItem.answer })
              }}
              className={css`
                flex: 1;
                width: 100%;
                background-color: ${baseTheme.colors.blue[200]};
              `}
            >
              {"add option"}
            </button>
            <CsvReader
              parseNoHeaders={(value) => {
                const newOptions = value.flat().filter((n) => n === 0 || n)
                const newAnswer = item.answer
                newAnswer.options = newOptions
                onChangeSurveyItem({ ...item, answer: newAnswer })
              }}
              parseUsingHeaders={() => null}
              title={"or upload a csv file"}
              applyMsg={"Apply"}
              disableHeaderOption
              checked={false}
              id={`${item.question.questionLabel}-csv-file-input`}
            />
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
        <StyledInnerEditor respondTo>
          <div
            className={css`
              display: flex;
              flex: 2;
              align-items: center;
            `}
          >
            <CheckBox
              label="Conditional"
              aria-label={`mark-conditional-${item.question.questionLabel}`}
              checked={item.conditional}
              onChange={(checked) => {
                const newItem = {
                  ...item,
                  conditional: checked,
                }
                delete newItem.dependsOn
                onChangeSurveyItem(newItem)
              }}
            />
          </div>
          {item.question.questionLabel !== "info" &&
            item.question.questionLabel !== "info-header" && (
              <>
                <div
                  className={css`
                    display: flex;
                    flex: 2;
                    align-items: center;
                  `}
                >
                  <CheckBox
                    label={"Make global"}
                    aria-label={`mark-global-variable-${item.question.questionLabel}`}
                    checked={item.globalVariable ? true : false}
                    onChange={(checked) => {
                      onChangeSurveyItem({
                        ...item,
                        globalVariable: checked,
                      })
                    }}
                  />
                </div>
                <div
                  className={css`
                    display: flex;
                    flex: 2;
                    align-items: center;
                  `}
                >
                  <CheckBox
                    label="Mandatory"
                    aria-label={`mark-mandatory-variable-${item.question.questionLabel}`}
                    checked={item.question.mandatory ? true : false}
                    onChange={(checked) => {
                      const newQuestion = { ...item.question, mandatory: checked }
                      onChangeSurveyItem({
                        ...item,
                        question: newQuestion,
                      })
                    }}
                  />
                </div>
              </>
            )}
          <button
            aria-label={`duplicate-${item.question.questionLabel}`}
            className={css`
              display: flex;
              width: 50%;
              ${respondToOrLarger.sm} {
                width: 15%;
              }
              place-content: center;
            `}
            onClick={() => {
              onDuplicate(item)
            }}
          >
            {"duplicate item"}
          </button>
        </StyledInnerEditor>
        {item.conditional && (
          <SelectCondition item={item} onChange={onChangeSurveyItem} state={state} />
        )}
      </fieldset>
    </StyledOuterEditor>
  )
}

export default SurveyItemEditor
