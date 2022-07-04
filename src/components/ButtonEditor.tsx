import styled from "@emotion/styled"
import { useTranslation } from "react-i18next"

import { Label } from "../util/stateInterfaces"
interface Props {
  item: Label
  onDelete: () => void
  onChange: (item: Label) => void
}

const StyledButtonEditor = styled.div`
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

const InputValuebox = styled.input`
  margin: 0 auto;
  margin-right: 0.5rem;
  width: 2rem;
  height: 2rem;
`

const DeleteButton = styled.button`
  width: 2rem;
  height: 2rem;
`

const ButtonEditor: React.FC<Props> = ({ item, onDelete, onChange }) => {
  const { t } = useTranslation()
  return (
    <StyledButtonEditor>
      <InputValuebox
        type="number"
        onChange={(e) => {
          onChange({ ...item, value: parseInt(e.target.value) })
        }}
      />
      <Input
        placeholder={t("input-placeholder-option-text")}
        value={item.label}
        onChange={(e) => {
          onChange({ ...item, label: e.target.value })
        }}
      />
      {/* eslint-disable-next-line i18next/no-literal-string */}
      <DeleteButton onClick={onDelete}>x</DeleteButton>
    </StyledButtonEditor>
  )
}

export default ButtonEditor
