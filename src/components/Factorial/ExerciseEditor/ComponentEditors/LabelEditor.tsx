import { css } from "@emotion/css"

import TextField from "../../../../shared-module/components/InputFields/TextField"
import { FactorialOption } from "../../../../util/stateInterfaces"
import { DeleteButton, StyledLabelEditor } from "../../../StyledComponents/Wrappers"
interface Props {
  item: FactorialOption
  onDelete: () => void
  onChange: (item: FactorialOption) => void
}

const LabelEditor: React.FC<React.PropsWithChildren<Props>> = ({ item, onDelete, onChange }) => {
  return (
    <StyledLabelEditor>
      <TextField
        aria-label="rate-value"
        label="value"
        type="number"
        value={(item.value as unknown as string) ?? ""}
        onChange={(e) => {
          const parsedNumber = parseInt(e)
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
        label="Label text"
        value={item.name}
        onChange={(e) => {
          onChange({ ...item, name: e })
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
      {/* eslint-disable-next-line i18next/no-literal-string */}
      <DeleteButton onClick={onDelete}>x</DeleteButton>
    </StyledLabelEditor>
  )
}

export default LabelEditor
