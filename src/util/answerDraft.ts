/* eslint-disable i18next/no-literal-string */
import { createContext } from "react"

import { SetStateMessage } from "../shared-module/exercise-service-protocol-types"

import { PublicSpec } from "./spec-types/publicSpec"
import { UserAnswer } from "./spec-types/userAnswer"

// Storage access throws in some sandboxed or privacy-restricted contexts; a draft is best effort.

const draftKey = (specId: string) => `answer-draft:${specId}`

/** Keeps the unsubmitted answer for the spec in sessionStorage so a reloaded iframe can restore it. */
export const saveAnswerDraft = (specId: string, answer: UserAnswer): void => {
  try {
    window.sessionStorage.setItem(draftKey(specId), JSON.stringify(answer))
  } catch (e) {
    console.warn("Could not save the answer draft", e)
  }
}

/** The draft saved for the spec, unvalidated, or null when there is none or storage fails. */
export const loadAnswerDraft = (specId: string): unknown => {
  try {
    const saved = window.sessionStorage.getItem(draftKey(specId))
    return saved === null ? null : JSON.parse(saved)
  } catch (e) {
    console.warn("Could not load the answer draft", e)
    return null
  }
}

export const clearAnswerDraft = (specId: string): void => {
  try {
    window.sessionStorage.removeItem(draftKey(specId))
  } catch (e) {
    console.warn("Could not clear the answer draft", e)
  }
}

/** Clears the draft once the host shows the submission view, which it does after a submit. */
export const clearSubmittedAnswerDraft = (message: SetStateMessage): void => {
  if (message.view_type !== "view-submission") {
    return
  }
  const specId = (message.data.public_spec as PublicSpec | null)?.id
  if (typeof specId === "string") {
    clearAnswerDraft(specId)
  }
}

/**
 * The draft a form should start from: the one the host re-sent with `set-state` (`answer_draft`)
 * when present, otherwise the one in sessionStorage.
 */
export const pickAnswerDraft = (specId: string, hostAnswerDraft: unknown): unknown =>
  hostAnswerDraft !== undefined && hostAnswerDraft !== null
    ? hostAnswerDraft
    : loadAnswerDraft(specId)

/** The `answer_draft` of the current answer-exercise set-state, if the host sent one. */
export const AnswerDraftContext = createContext<unknown>(undefined)
