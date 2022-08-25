import styled from "@emotion/styled"
import React from "react"

import { baseTheme, primaryFont } from "../../shared-module/styles"
import MarkdownText from "../MarkdownText"

interface Props {
  questionText: string
}

const Header = styled.div`
  font-family: ${primaryFont};
  color: ${baseTheme.colors.grey[600]};
  font-style: normal;
  font-weight: 500;
  font-size: 22px;
  line-height: 30px;
  margin-bottom: 9px;
  margin-top: 4px;

  /* identical to box height, or 136% */
  display: flex;
  align-items: flex-end;
`

export const ExerciseItemHeader: React.FC<React.PropsWithChildren<Props>> = ({ questionText }) => {
  return (
    <Header>
      <MarkdownText text={questionText} />
    </Header>
  )
}
