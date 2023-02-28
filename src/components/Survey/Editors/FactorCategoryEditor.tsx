import { css } from "@emotion/css"

import TextField from "../../../shared-module/components/InputFields/TextField"
import { SubCategory } from "../../../util/spec-types/privateSpec"
import { DeleteButton, StyledInnerEditor } from "../../StyledComponents/Wrappers"

interface Props {
  idx: number
  category: SubCategory
  onDelete: () => void
  onChange: (category: SubCategory) => void
}

const FactorCategoryEditor: React.FC<React.PropsWithChildren<Props>> = ({
  idx,
  category,
  onDelete,
  onChange,
}) => {
  return (
    <StyledInnerEditor>
      <TextField
        label={`Category Label`}
        aria-label={`${idx + 1}-Category Label`}
        type="text"
        placeholder={`example "normal", "low" or "danger zone"`}
        onChange={(value) => {
          onChange({ ...category, label: value })
        }}
        value={category.label ?? ""}
        className={css`
          flex: 2;
        `}
      />

      <TextField
        label="range from"
        type="number"
        value={category.from ? (category.from as unknown as string) : "0"}
        onChange={(value) => {
          onChange({
            ...category,
            from: parseFloat(value),
          })
        }}
        className={css`
          flex: 1;
          padding: 0 0.2rem 0 0.3rem;
        `}
      />
      <TextField
        label="range to"
        type="number"
        value={category.to ? (category.to as unknown as string) : "0"}
        onChange={(value) => {
          onChange({
            ...category,
            to: parseFloat(value),
          })
        }}
        className={css`
          flex: 1;
          padding: 0 0.4rem 0 0rem;
        `}
      />
      <TextField
        label="bar color"
        type="text"
        placeholder="color"
        value={category.color}
        onChange={(value) => {
          onChange({
            ...category,
            color: value,
          })
        }}
        className={css`
          flex: 1;
        `}
      />
      <DeleteButton onClick={onDelete}>{"x"}</DeleteButton>
    </StyledInnerEditor>
  )
}

export default FactorCategoryEditor
