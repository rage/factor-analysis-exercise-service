import { css } from "@emotion/css"

import TextField from "../../../../shared-module/components/InputFields/TextField"
import { FactorialOption } from "../../../../util/spec-types/privateSpec"
import { DeleteButton, StyledLabelEditor } from "../../../StyledComponents/Wrappers"
interface Props {
  idx: number
  item: FactorialOption
  onDelete: () => void
  onChange: (item: FactorialOption) => void
  questionLabel?: string
}

const OptionEditor: React.FC<React.PropsWithChildren<Props>> = ({
  idx,
  item,
  onDelete,
  onChange,
  questionLabel,
}) => {
  return (
    <StyledLabelEditor>
      <TextField
        id={`rate-value-${idx}${questionLabel ? "-" + questionLabel : ""}`}
        label="value"
        type="number"
        value={(item.value as unknown as string) ?? ""}
        onChangeByValue={(value) => {
          const parsedNumber = parseInt(value)
          onChange({ ...item, value: isNaN(parsedNumber) ? null : parsedNumber })
        }}
        className={css`
          padding: 0.5rem;
          width: 6rem;
          margin: 0;
          textfield: {
            margin: 0 auto;
            margin-right: 0.5rem;
          }
        `}
      />
      <TextField
        id={`option-text-${idx}${questionLabel ? "-" + questionLabel : ""}`}
        label={`Option text`}
        value={item.name}
        onChangeByValue={(value) => {
          onChange({ ...item, name: value })
        }}
        className={css`
          flex: 1;
          padding: 0.5rem;
          margin: 0;
          textfield: {
            padding: 0;
            width: 100%;
            margin: 0 auto;
            margin-right: 0.5rem;
          }
        `}
      />
      <DeleteButton onClick={onDelete}>{"x"}</DeleteButton>
    </StyledLabelEditor>
  )
}

export default OptionEditor
