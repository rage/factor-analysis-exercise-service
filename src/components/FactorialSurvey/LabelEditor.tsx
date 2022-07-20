import { css } from "@emotion/css"
import styled from "@emotion/styled"
import TextField from "../../shared-module/components/InputFields/TextField"

import { Label } from "../../util/stateInterfaces"
interface Props {
  item: Label
  onDelete: () => void
  onChange: (item: Label) => void
}

const StyledLabelEditor = styled.div`
  margin: 0 auto;
  margin-bottom: 1rem;
  width: 100%;
  border: 1px solid black;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-apart;
`

const DeleteButton = styled.button`
  width: 2rem;
  height: 2rem;
`

const LabelEditor: React.FC<Props> = ({ item, onDelete, onChange }) => {
  return (
    <StyledLabelEditor>
      <TextField
        aria-label="rate-value"
        label="value"
        type="number"
        value={(item.value as unknown as string)}
        onChange={(e) => {
          const parsedNumber = parseInt(e)
          onChange({ ...item, value: isNaN(parsedNumber) ? null : parsedNumber })
        }}
        className={css`
          padding: 0.5rem;
          width: 6rem;
          margin: 0 auto;
          margin-right: 0.5rem;
        `}
      />
      <TextField
        label="Label text"
        value={item.label}
        onChange={(e) => {
          onChange({ ...item, label: e })
        }}
        className={css`
          flex: 1;
          padding: 0.5rem;
          width: 100%;
          margin: 0 auto;
          margin-right: 0.5rem;
        `}
      />
      {/* eslint-disable-next-line i18next/no-literal-string */}
      <DeleteButton onClick={onDelete}>x</DeleteButton>
    </StyledLabelEditor>
  )
}

export default LabelEditor
