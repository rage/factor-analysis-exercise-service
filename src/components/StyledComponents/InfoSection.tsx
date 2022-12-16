import React from "react"

import { UserVariablesMap } from "../../shared-module/exercise-service-protocol-types"
import { insertVariablesToText } from "../../util/utils"
import MarkdownText from "../MarkdownText"

import { InfoWrapper } from "./Wrappers"

interface Props {
  content: string
  userVariables?: UserVariablesMap | null
}

export const InfoSection: React.FC<React.PropsWithChildren<Props>> = ({
  content,
  userVariables,
}) => {
  const parsedContent = insertVariablesToText(content, userVariables)

  return (
    <InfoWrapper>
      <MarkdownText text={parsedContent} />
    </InfoWrapper>
  )
}
