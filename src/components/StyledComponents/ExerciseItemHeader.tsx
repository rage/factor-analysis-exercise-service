import styled from "@emotion/styled"
import React from "react"

import { headingFont } from "../../shared-module/styles"
import MarkdownText from "../MarkdownText"

interface Props {
  questionText: string
}
/* const GREEN = baseTheme.colors.green[100]

const COLOR = baseTheme.colors.blue[300]
const CHOSEN_COLOR = baseTheme.colors.blue[700]
 */
const Header = styled.div`
  font-family: ${headingFont};
  font-style: normal;
  font-weight: 500;
  font-size: 22px;
  line-height: 30px;
  /* background: GREEN;
  padding: 15px; */

  /* identical to box height, or 136% */
  display: flex;
  align-items: flex-end;

  color: #333333;
`

export const ExerciseItemHeader: React.FC<React.PropsWithChildren<Props>> = ({ questionText }) => {
  return (
    <Header>
      <MarkdownText text={questionText} />
    </Header>
  )
}
