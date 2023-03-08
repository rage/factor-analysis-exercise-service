import { css } from "@emotion/css"
import { ColorPalette } from "@wordpress/components"

import TextField from "../../../shared-module/components/InputFields/TextField"
import { baseTheme } from "../../../shared-module/styles"
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
    <StyledInnerEditor respondTo>
      <TextField
        label={`Category Label`}
        aria-label={`${idx + 1}-Category Label`}
        id={`${idx + 1}-Category Label`}
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
        aria-label={`Category-${idx + 1}-range-from`}
        id={`Category-${idx + 1}-range-from`}
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
        aria-label={`Category-${idx + 1}-range-to`}
        id={`Category-${idx + 1}-range-to`}
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
      <label htmlFor={`color-picker-for-${category.label + "-" + idx}`}>{"bar color"}</label>
      <ColorPalette
        id={`color-picker-for-${category.label + "-" + idx}`}
        aria-label={`set bar color for ${category.label + "-" + idx}`}
        disableCustomColors={false}
        value={category.color.length ? category.color : baseTheme.colors.clear[100]}
        onChange={(backgroundColor: string) => onChange({ ...category, color: backgroundColor })}
        clearable={false}
        enableAlpha
        className={css`
          flex: 1;
          padding: 0 0.4rem 0 0rem;
        `}
      />
      <DeleteButton onClick={onDelete}>{"x"}</DeleteButton>
    </StyledInnerEditor>
  )
}

export default FactorCategoryEditor
