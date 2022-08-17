import styled from "@emotion/styled"

import MarkdownText from "../MarkdownText"

interface Props {
  dogName: string
  dogBreed: string
  content: string
}

const InfoWrapper = styled.div`
  background: rgba(85, 179, 245, 0.05);
  width: 100%;
  padding: 15px;

  font-family: Lato;
  font-style: normal;
  font-weight: 500;
  font-size: 17px;
  line-height: 100%;

  /* or 17px */
  display: flex;
  align-items: flex-end;
  text-align: left;

  color: #494949;
`
const InfoHeaderWithCheckbox: React.FC<React.PropsWithChildren<Props>> = ({ content }) => {
  return (
    <InfoWrapper>
      <MarkdownText text={content} />
    </InfoWrapper>
  )
}

export default InfoHeaderWithCheckbox
