/* eslint-disable i18next/no-literal-string */

const FOCUS_FIRST_INVALID_EVENT = "focus-first-invalid"

/** Set on the element wrapping each required item that is unanswered. */
export const UNANSWERED_ITEM_ATTRIBUTE = "data-unanswered-required"

const FOCUSABLE_CONTROL =
  "input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])"

/** Forwards the host's `focus-first-invalid` message to the mounted answer form. */
export const requestFocusFirstInvalid = (): void => {
  window.dispatchEvent(new Event(FOCUS_FIRST_INVALID_EVENT))
}

/** Subscribes to `requestFocusFirstInvalid`; returns the unsubscribe function. */
export const onFocusFirstInvalidRequest = (listener: () => void): (() => void) => {
  window.addEventListener(FOCUS_FIRST_INVALID_EVENT, listener)
  return () => window.removeEventListener(FOCUS_FIRST_INVALID_EVENT, listener)
}

/**
 * Scrolls to the first element marked with `UNANSWERED_ITEM_ATTRIBUTE` and focuses its first
 * enabled control (or the element itself).
 */
export const focusFirstUnansweredItem = (): void => {
  const item = document.querySelector<HTMLElement>(`[${UNANSWERED_ITEM_ATTRIBUTE}]`)
  if (!item) {
    return
  }
  // jsdom lacks scrollIntoView
  item.scrollIntoView?.({ block: "center" })
  const control = item.querySelector<HTMLElement>(FOCUSABLE_CONTROL) ?? item
  control.focus({ preventScroll: true })
}
