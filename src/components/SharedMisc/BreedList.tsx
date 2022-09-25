/* eslint-disable i18next/no-literal-string */
import { css } from "@emotion/css"
import Select from "react-select"

import Breeds from "../../data/breeds_fin.json"

interface Props {
  onClick: (breed: string) => void
  disabled: boolean | undefined
  chosenBreed: string | null
}

interface SelectOption {
  value: string
  label: string
}

const BreedList: React.FC<React.PropsWithChildren<Props>> = ({
  onClick,
  disabled,
  chosenBreed,
}) => {
  const breedOptions: SelectOption[] = Breeds.Rotu.map((breed) => {
    return { value: breed, label: breed }
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

  const selectedOption = { value: chosenBreed ?? "", label: chosenBreed ?? "" }
  return (
    <div
      className={css`
        display: flex;
        flex-direction: column;
      `}
    >
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
    </div>
  )
}

export default BreedList
