import Breeds from '../data/breeds_fin.json'

const BreedList: React.FC = () => {
  const breeds = Breeds.Rotu
  return (
    <ul>
      {breeds.map((breed) => {
        return (
          <li>
            {breed}
          </li>
        )
      })}
    </ul>
  )
}

export default BreedList