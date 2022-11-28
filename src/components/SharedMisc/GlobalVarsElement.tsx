import { UserVariablesMap } from "../../shared-module/exercise-service-protocol-types"

interface Props {
  title: string
  text: string
  globs?: UserVariablesMap
}

const GlobalVarsElement: React.FC<React.PropsWithChildren<Props>> = ({ text, globs }) => {
  const regexp = /\$\{\w+=.*\}/
  //string output = RegExp.Replace(input, @"(\[.*\])", newData);
  const label = text.match(regexp)
  const keyValues = label?.map((l) => {
    return l.split("=")
  })
  const newString = keyValues?.map((pair) => {
    null
  })
  console.log("we found something", label)

  return <div></div>
}

export default GlobalVarsElement
