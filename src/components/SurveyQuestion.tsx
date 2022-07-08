import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from "@mui/material"
import { Label, RatedQuestion } from "../util/stateInterfaces"

interface Props {
  question: RatedQuestion
  options: Label[]
  onClick: (questionId: string, rate: number) => void
}

const SurveyQuestion: React.FC<Props> = ({
  question,
  options,
  onClick
}) => {
  return (
    <FormControl>
      <FormLabel id="id">{question.question}</FormLabel>
      <RadioGroup
        onChange={(e) => {
          onClick(question.questionId, parseInt(e.target.value))
        }}
      >
        {options.map((option) => {
          return (
            <FormControlLabel
              value={option.value}
              control={<Radio />}
              label={option.label}
            />
          )
        })}
      </RadioGroup>
    </FormControl>
  )
}

export default SurveyQuestion