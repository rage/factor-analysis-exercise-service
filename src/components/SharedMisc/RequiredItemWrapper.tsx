import { css } from "@emotion/css"
import React from "react"
import { useTranslation } from "react-i18next"

import { baseTheme } from "../../shared-module/styles"
import { UNANSWERED_ITEM_ATTRIBUTE } from "../../util/focusFirstInvalid"

interface Props {
  isUnanswered: boolean
  shouldHighlight: boolean
}

const highlightClass = css`
  border-left: 4px solid ${baseTheme.colors.red[600]};
  padding-left: 0.75rem;
`

const errorTextClass = css`
  color: ${baseTheme.colors.red[600]};
  font-size: 16px;
  margin: 0.25rem 0 0 0;
`

/** Marks an unanswered required item for focus-first-invalid and highlights it when asked to. */
const RequiredItemWrapper: React.FC<React.PropsWithChildren<Props>> = ({
  isUnanswered,
  shouldHighlight,
  children,
}) => {
  const { t } = useTranslation()
  const isHighlighted = isUnanswered && shouldHighlight
  return (
    <div
      {...{ [UNANSWERED_ITEM_ATTRIBUTE]: isUnanswered ? "true" : undefined }}
      tabIndex={isUnanswered ? -1 : undefined}
      className={isHighlighted ? highlightClass : undefined}
    >
      {children}
      {isHighlighted && <p className={errorTextClass}>{t("required-question-unanswered")}</p>}
    </div>
  )
}

export default RequiredItemWrapper
