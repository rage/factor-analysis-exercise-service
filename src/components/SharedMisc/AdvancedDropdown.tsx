import { css } from "@emotion/css"
import Select from "react-select"

interface Props {
  onClick: (breed: string) => void
  disabled: boolean | undefined
  chosenOption: string | null
  options: string[]
}

interface SelectOption {
  value: string
  label: string
}

const AdvancedDropdown: React.FC<React.PropsWithChildren<Props>> = ({
  onClick,
  disabled,
  chosenOption,
  options,
}) => {
  const breedOptions: SelectOption[] = options.map((option) => {
    return { value: option, label: option }
  })
  const sortedOptions = breedOptions.sort((n1, n2) => {
    if (n1.value > n2.value) {
      return 1
    }
    if (n1.value < n2.value) {
      return -1
    }
    return 0
  })

  const selectedOption = { value: chosenOption ?? "", label: chosenOption ?? "" }
  return (
    <Select<SelectOption>
      aria-label="breed-selector"
      options={sortedOptions}
      placeholder="Select breed"
      isSearchable={true}
      value={selectedOption}
      onChange={(e) => onClick(e?.value ?? "")}
      isDisabled={disabled}
      maxMenuHeight={400}
      className={css`
        aria-label: breed-selection;
      `}
    />
    //</div>
  )
}

export default AdvancedDropdown
