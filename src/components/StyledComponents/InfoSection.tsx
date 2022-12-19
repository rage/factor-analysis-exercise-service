import React from "react"

import MarkdownText from "../MarkdownText"

import { InfoWrapper } from "./Wrappers"

interface Props {
  content: string
}

export const InfoSection: React.FC<React.PropsWithChildren<Props>> = ({ content }) => {
  return (
    <InfoWrapper>
      <MarkdownText text={content} />
    </InfoWrapper>
  )
}
