import { css } from "@emotion/css"
import { useState } from "react"

import {
  CurrentStateMessage,
  FileUploadMessage,
  UserVariablesMap,
} from "../../shared-module/exercise-service-protocol-types"
import { baseTheme } from "../../shared-module/styles"
import { Answer, AnswerType, SubmittedForm, Survey, SurveyItem } from "../../util/stateInterfaces"
import MarkdownText from "../MarkdownText"
import { ExerciseItemHeader } from "../StyledComponents/ExerciseItemHeader"
import { InfoSection } from "../StyledComponents/InfoSection"
import { InfoHeaderWrapper, ItemWrapper } from "../StyledComponents/Wrappers"

import SurveyExerciseItem from "./SurveyExerciseItem"

interface Props {
  state: Survey
  port: MessagePort
  userVariables?: UserVariablesMap | null
}

const SurveyExercise: React.FC<React.PropsWithChildren<Props>> = ({
  port,
  state,
  userVariables,
}) => {
  const INITIAL_ANSWERED = state.content.map((q) => {
    return {
      id: q.id,
      question: q.question,
      answer: q.answer,
      conditional: q.conditional,
      dependsOn: q.dependsOn,
      globalVariable: q.globalVariable,
    } as SurveyItem
  })

  const [answeredItems, _setAnsweredItems] = useState<SurveyItem[]>(INITIAL_ANSWERED)

  const setAnsweredItems: typeof _setAnsweredItems = (value) => {
    const res = _setAnsweredItems(value)
    if (!port) {
      // eslint-disable-next-line i18next/no-literal-string
      console.error("Cannot send current state to parent because I don't have a port")
      return
    }
    // eslint-disable-next-line i18next/no-literal-string
    console.info("Posting current state to parent")
    // the type should be the same one that is received as the initial selected id
    const data: SubmittedForm = {
      answeredQuestions: value ? (value as SurveyItem[]) : [],
    }

    const message: CurrentStateMessage = {
      // eslint-disable-next-line i18next/no-literal-string
      message: "current-state",
      data,
      valid: true,
    }
    port.postMessage(message)
    return res
  }

  const [_uploadFile, _setUploadFile] = useState<File>()

  const setUploadFile: typeof _setUploadFile = (value) => {
    const res = _setUploadFile(value)
    if (!port) {
      // eslint-disable-next-line i18next/no-literal-string
      console.error("Cannot send current state to parent because I don't have a port")
      return
    }
    // eslint-disable-next-line i18next/no-literal-string
    console.info("Posting file upload to parent")
    // the type should be the same one that is received as the initial selected id

    const data: File = value as File
    const files = new Map()
    files.set(data.name, data as Blob)
    console.log("Tis me data:", files)

    const message: FileUploadMessage = {
      // eslint-disable-next-line i18next/no-literal-string
      message: "file-upload",
      files: files,
    }
    port.postMessage(message)
    console.log(res)
    return res
  }

  const updateAnswer = (itemId: string, answer: Answer) => {
    if (!port) {
      // eslint-disable-next-line i18next/no-literal-string
      console.error("Cannot send current state to parent because I don't have a port")
      return
    }

    const newAnsweredQ = answeredItems.map((quest) => {
      if (quest.id !== itemId) {
        return quest
      }
      return { ...quest, answer: answer }
    })
    setAnsweredItems(newAnsweredQ)
  }

  const updateFileUpload = (_item: SurveyItem, file: File | null) => {
    if (!port) {
      // eslint-disable-next-line i18next/no-literal-string
      console.error("Cannot send current state to parent because I don't have a port")
      return
    }
    if (file) {
      setUploadFile(file)
    } else {
      console.log(file)
    }
    /* if (url) {  // This will be the received url for file upload
      const answer: Answer = {
        ...item.answer,
        answer: url.url,
      }
      updateAnswer(item.id, answer)
    } */
  }

  return (
    <>
      {userVariables &&
        Object.keys(userVariables as UserVariablesMap).map((k) => {
          return (
            <div key={k}>
              <p>{k}</p>
              <p>{userVariables[k] as string} </p>
            </div>
          )
        })}
      {answeredItems.map((item) => {
        if (item.conditional && item.dependsOn) {
          const chosenOptions = answeredItems.find(
            (surveyItem) => surveyItem.question.questionLabel === item.dependsOn?.questionLabel,
          )?.answer.answer as string[]
          if (chosenOptions?.indexOf(item.dependsOn.triggeringOption) === -1) {
            if (item.answer.answer !== "") {
              updateAnswer(item.id, { ...item.answer, answer: "" })
            }
            return
          }
        }
        if (item.question.questionLabel === "info") {
          return (
            <InfoSection
              key={item.id}
              content={item.question.question}
              userVariables={userVariables}
            />
          )
        }
        if (item.question.questionLabel === "info-header") {
          return (
            <InfoHeaderWrapper key={item.id}>
              <div
                className={css`
                  color: ${baseTheme.colors.crimson[700]};
                `}
              >
                <MarkdownText text={item.question.question} />
              </div>
              <SurveyExerciseItem item={item} updateAnswer={updateAnswer} />
            </InfoHeaderWrapper>
          )
        }
        if (item.answer.type == AnswerType.FileUpload) {
          return (
            <div key={item.id}>
              <input
                id="pngInput"
                name="file"
                type="file"
                accept="png"
                onChange={(e) => {
                  console.log("in file select", e.target)
                  if (e.target.files) {
                    console.log("clearly no null")
                    updateFileUpload(item, e.target.files[0])
                  }
                }}
              ></input>
            </div>
          )
        }
        return (
          <ItemWrapper key={item.id}>
            <ExerciseItemHeader titleText={item.question.question} />
            <SurveyExerciseItem item={item} updateAnswer={updateAnswer} />
          </ItemWrapper>
        )
      })}
    </>
  )
}

export default SurveyExercise
