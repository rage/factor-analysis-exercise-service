import styled from "@emotion/styled"
import React from "react"

import MarkdownText from "../MarkdownText"

interface Props {
  content: string
}

const InfoWrapper = styled.div`
  background: #faf6e3;
  width: 100%;
  padding: 15px;

  font-family: "Raleway";
  font-style: normal;
  font-weight: 500;
  font-size: 17px;
  line-height: 100%;

  /* or 17px */
  display: flex;
  align-items: flex-end;
  text-align: center;

  color: #494949;
`

export const InfoSection: React.FC<React.PropsWithChildren<Props>> = ({ content }) => {
  return (
    <InfoWrapper>
      <MarkdownText text={content} />
    </InfoWrapper>
  )
}
