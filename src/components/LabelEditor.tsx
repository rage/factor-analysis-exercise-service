import styled from "@emotion/styled"

import { Label } from "../util/stateInterfaces"
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

const Input = styled.input`
  padding: 0.5rem;
  width: 100%;
  margin: 0 auto;
  margin-right: 0.5rem;
`

const InputNumberbox = styled.input`
  margin: 0 auto;
  margin-right: 0.5rem;
  width: 2.5rem;
  height: 2rem;
`

const DeleteButton = styled.button`
  width: 2rem;
  height: 2rem;
`

const LabelEditor: React.FC<Props> = ({ item, onDelete, onChange }) => {
  return (
    <StyledLabelEditor>
      <InputNumberbox
        type="number"
        value={item.value}
        onChange={(e) => {
          const parsedNumber = parseInt(e.target?.value)
          onChange({ ...item, value: isNaN(parsedNumber) ? "NaN" : parsedNumber})
        }}
      />
      <Input
        value={item.label}
        onChange={(e) => {
          onChange({ ...item, label: e.target.value })
        }}
      />
      {/* eslint-disable-next-line i18next/no-literal-string */}
      <DeleteButton onClick={onDelete}>x</DeleteButton>
    </StyledLabelEditor>
  )
}

export default LabelEditor
