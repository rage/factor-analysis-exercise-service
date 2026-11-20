import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { UserVariablesMap } from "../shared-module/exercise-service-protocol-types"
import { saveAnswerDraft } from "../util/answerDraft"
import { buildCurrentStateMessage } from "../util/currentState"
import { focusFirstUnansweredItem, onFocusFirstInvalidRequest } from "../util/focusFirstInvalid"
import { PublicSpec } from "../util/spec-types/publicSpec"
import { UserAnswer } from "../util/spec-types/userAnswer"
import { findUnansweredQuestions, UnansweredQuestion } from "../util/utils"

interface AnswerReporting {
  unansweredIds: Set<UnansweredQuestion["id"]>
  /** True once the host has asked to focus the first unanswered item, i.e. after a blocked submit. */
  shouldHighlightUnanswered: boolean
}

/**
 * Posts `current-state` to the host whenever the answer changes and keeps a sessionStorage draft
 * of it. Also handles the host's focus-first-invalid requests for the mounted form.
 */
const useAnswerReporting = (
  port: MessagePort,
  spec: PublicSpec,
  answeredQuestions: UserAnswer["answeredQuestions"],
  userVariables?: UserVariablesMap | null,
): AnswerReporting => {
  const { t } = useTranslation()
  const [shouldHighlightUnanswered, setShouldHighlightUnanswered] = useState(false)
  const answer: UserAnswer = useMemo(() => ({ answeredQuestions }), [answeredQuestions])
  const unanswered = useMemo(() => findUnansweredQuestions(spec, answer), [spec, answer])

  useEffect(() => {
    port.postMessage(buildCurrentStateMessage(answer, unanswered, t, userVariables))
    saveAnswerDraft(spec.id, answer)
  }, [port, spec.id, answer, unanswered, t, userVariables])

  useEffect(
    () =>
      onFocusFirstInvalidRequest(() => {
        setShouldHighlightUnanswered(true)
        focusFirstUnansweredItem()
      }),
    [],
  )

  const unansweredIds = useMemo(() => new Set(unanswered.map((q) => q.id)), [unanswered])
  return { unansweredIds, shouldHighlightUnanswered }
}

export default useAnswerReporting
