import { css } from '@emotion/css'
import Breeds from '../data/breeds_fin.json'

interface Props {
  onClick: (breed: string) => void
}

const BreedList: React.FC<Props> = ({ onClick }) => {
  const breeds = Breeds.Rotu
  return (
    <div className={css`
      display: flex;
      flex-direction: column;
    `}>

      <label>select your breed</label>
      <select
        name="breeds"
        id="breed-select"
        onChange={(event) => onClick(event.target.value)}>
        <option value="">--Please choose your breed--</option>
        {breeds.map((breed, idx) => {
          return (
            <option
              key={idx}
              value={breed}
            >
              {breed}
            </option>
          )
        })}
      </select>
    </div >

  )
}

export default BreedList