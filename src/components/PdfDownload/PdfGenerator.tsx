/* eslint-disable react/forbid-component-props */
import { css } from "@emotion/css"
import {
  Circle,
  Document,
  G,
  Page,
  PDFDownloadLink,
  Rect,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer"
import React from "react"
import { useTranslation } from "react-i18next"

import { ExerciseFeedback } from "../../pages/api/grade"
import {
  CustomViewExerciseTaskGrading,
  //CustomViewExerciseTaskSpec,
  CustomViewExerciseTaskSubmission,
} from "../../shared-module/bindings"
import Button from "../../shared-module/components/Button"
import {
  CustomViewIframeState,
  UserVariablesMap,
} from "../../shared-module/exercise-service-protocol-types"
import { Survey, SurveyType } from "../../util/spec-types/privateSpec"
import { PublicSpec } from "../../util/spec-types/publicSpec"
import { AnsweredSurveyItem, UserAnswer } from "../../util/spec-types/userAnswer"
import { calculateSumFactorScore, getTextWidth } from "../../util/utils"
import { barColors } from "../Factorial/ViewSubmission/FactorialReport"
import { Bar } from "../Survey/ViewSubmission/SumFactorReport"

interface SubmissionProps {
  publicSpec?: PublicSpec
  answer?: UserAnswer
  gradingFeedback: ExerciseFeedback | null
  userVariables?: UserVariablesMap | null
}

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "snow",
    paddingHorizontal: 40,
    paddingTop: 40,
    paddingBottom: 10,
    flex: 2,
  },
  container: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "stretch",
  },
  text: { color: "#595857" },
  item: {
    width: "46%",
    paddingVertical: 8,
    margin: 2,
  },
})

const PDFFactorReport: React.FC<React.PropsWithChildren<SubmissionProps>> = ({
  gradingFeedback,
  userVariables,
}) => {
  if (!gradingFeedback?.factorReport) {
    return null
  }

  const userName: string | null =
    userVariables &&
    gradingFeedback?.userVar?.globalKey &&
    userVariables[gradingFeedback.userVar.globalKey]
      ? (userVariables[gradingFeedback.userVar.globalKey] as string)
      : null
  const userCompVar: string | null =
    userVariables &&
    gradingFeedback?.comparingVar?.globalKey &&
    userVariables[gradingFeedback.comparingVar?.globalKey]
      ? (userVariables[gradingFeedback.comparingVar?.globalKey] as string)
      : null
  const comparingVar = gradingFeedback?.comparingVar ?? null
  return (
    <div>
      <View>
        <Text style={{ textAlign: "center", marginBottom: "10px", fontSize: 15 }}>
          {gradingFeedback?.titleText}
        </Text>
      </View>
      <Svg
        height={50}
        viewBox={`0 0 100 25`}
        style={{ border: "2px solid #aaa", padding: "2px", marginHorizontal: "10px" }}
      >
        <G fill="gray">
          <Circle cx={`5%`} cy={`15%`} r="2" fill="yellow" stroke="lime" />
          <Text x={`10%`} y={`22%`} style={{ fontSize: 5 }}>
            {gradingFeedback?.zeroVar?.label ?? "Dogs average"}
          </Text>
          <Circle cx={`5%`} cy={`45%`} r="2" fill="tomato" stroke="brown" />
          <Text x={`10%`} y={`52%`} style={{ fontSize: 5 }}>
            {userName ?? gradingFeedback?.userVar?.label ?? "Your Score"}
          </Text>
          {userCompVar && (
            <>
              <Circle cx={`5%`} cy={`75%`} r="2" fill="hotpink" stroke="blue" />
              <Text x={`10%`} y={`82%`} style={{ fontSize: 5 }}>
                {userCompVar ?? "Your breed"}
              </Text>
            </>
          )}
        </G>
      </Svg>
      <Svg
        //width="200"
        height={80 * (gradingFeedback?.factorReport?.length ?? 0)}
        viewBox={`0 0 100 ${40 * (gradingFeedback?.factorReport?.length ?? 0)}`}
        style={{ /* border: "1px solid #aaa", */ padding: "1" }}
      >
        {gradingFeedback?.factorReport.map((f, idf) => {
          const species =
            (100 * (-(f.range?.min as number) + (f.mainComparingVar ?? 0))) /
            ((f.range?.max as number) - (f.range?.min as number))

          const userScore =
            (100 * (-(f.range?.min as number) + f.score)) /
            ((f.range?.max as number) - (f.range?.min as number))
          let comparingVarAvg = null
          if (
            f.comparingVariable &&
            userCompVar &&
            comparingVar?.globalKey &&
            f.comparingVariable[comparingVar.globalKey] &&
            !isNaN(f.comparingVariable[comparingVar.globalKey][userCompVar])
          ) {
            comparingVarAvg =
              (100 *
                (-(f.range?.min as number) +
                  f.comparingVariable[comparingVar.globalKey][userCompVar])) /
              ((f.range?.max as number) - (f.range?.min as number))
          }
          const len = gradingFeedback?.factorReport?.length ?? 0
          return (
            <G key={f.id} fill="grey">
              <Text x={`0%`} y={`${(idf * 100 + 30) / (len ?? 1)}%`} style={{ fontSize: 6 }}>
                {f.name}
              </Text>
              <Circle
                cx={`${species}%`}
                cy={`${(idf * 100 + 60) / (len ?? 1)}%`}
                r="2"
                fill="yellow"
                stroke="lime"
              />
              {comparingVarAvg && (
                <Circle
                  cx={`${comparingVarAvg}%`}
                  cy={`${(idf * 100 + 60) / (len ?? 1)}%`}
                  r="2"
                  fill="hotpink"
                  stroke="blue"
                />
              )}
              <Circle
                cx={`${userScore}%`}
                cy={`${(idf * 100 + 60) / (len ?? 1)}%`}
                r="2"
                fill="tomato"
                stroke="brown"
              />
              {barColors.map((color, idx) => {
                return (
                  <Rect
                    key={idx}
                    fill={color}
                    height={`${10 / len}%`}
                    width={`${100 / barColors.length - 1}%`}
                    x={`${(idx * 100) / barColors.length}%`}
                    y={`${(idf * 100 + 75) / (len ?? 1)}%`}
                  />
                )
              })}
            </G>
          )
        })}
      </Svg>
    </div>
  )
}

const PDFSumFactorReport: React.FC<React.PropsWithChildren<SubmissionProps>> = ({
  publicSpec,
  answer,
  userVariables,
}) => {
  const sumFactor = (publicSpec as Survey)?.sumFactor
  if (!sumFactor || !sumFactor.categories) {
    return null
  }
  const userScore =
    calculateSumFactorScore(
      (publicSpec as Survey)?.content,
      answer?.answeredQuestions as AnsweredSurveyItem[],
    ) ?? 0
  const userName =
    (userVariables != null && sumFactor.userVariable?.globalKey) ?? userVariables
      ? (userVariables[sumFactor.userVariable?.globalKey ?? ""] as string)
      : null
  const userVar = sumFactor.userVariable ?? null
  const sortedCategories = [...sumFactor.categories].sort((a, b) => a.from - b.from)
  const start = sortedCategories[0].from
  const finnish = sortedCategories[sortedCategories.length - 1].to
  const sortedBars: Bar[] = sortedCategories.map((cat, idx) => {
    const width = (100 * (cat.to - cat.from)) / (finnish - start)
    const padding =
      idx === sortedCategories.length - 1
        ? 0
        : (100 * (sortedCategories[idx + 1].from - cat.to)) / (finnish - start)
    const labelWidth = getTextWidth(cat.label, "15px Raleway")
    return { ...cat, barWidth: width, padding: padding, labelWidth: labelWidth }
  })

  const userLabel: string = userName ?? userVar?.label ?? "Your Score"
  const userPlacement =
    (100 * (-(start as number) + userScore)) / ((finnish as number) - (start as number))
  const userLabelWidth = getTextWidth(userLabel, "9px Raleway")
  const labelPlacement =
    userPlacement >= 100 - userLabelWidth ? userPlacement - userLabelWidth - 4 : userPlacement + 4
  return (
    <View style={{ marginHorizontal: 10 }}>
      <Svg height={`160`} width={`100%`} viewBox={`0 0 240 120`}>
        <Circle
          cx={`${userPlacement}%`}
          cy={`${13}%`}
          r="4"
          fill="tomato"
          stroke="brown"
          strokeWidth="2"
        />
        <Text x={`${labelPlacement}%`} y={`16%`} style={{ fontSize: 9, color: "#706d6d" }}>
          {`${userLabel}`}
        </Text>
        {sortedBars.map((car, idx) => {
          return (
            <>
              <Rect
                key={idx}
                fill={car.color}
                width={`${car.barWidth}%`}
                height={`20%`}
                x={`${(100 * (car.from - start)) / (finnish - start)}%`}
                y={`26%`}
              ></Rect>
              <Rect
                key={10 * idx}
                fill={car.color}
                width={`8%`}
                height={`15%`}
                x={`0%`}
                y={`${53 + idx * 15}%`}
              ></Rect>
              <Text
                x={`10%`}
                y={`${66 + idx * 15}%`}
                style={{ textAlign: "left", marginBottom: "2px", fontSize: 8, color: "#706d6d" }}
              >
                {car.label}
              </Text>
            </>
          )
        })}
      </Svg>
    </View>
  )
}

const MyDoc: React.FC<React.PropsWithChildren<CustomViewIframeState>> = (props) => {
  const { t } = useTranslation()
  const user_vars = props.user_variables
  const data = props.data
  const user_info = props.user_information
  const course_name = props.course_name
  const subs = data.submissions_by_exercise
    .filter(
      (ex, index, array) =>
        array.findIndex((elem) => elem.exercise_id === ex.exercise_id) === index,
    )
    .flatMap((exercise) => {
      return exercise.exercise_tasks.flatMap((task) => {
        const grading = task.grading as CustomViewExerciseTaskGrading
        const answer =
          ((task.user_answer as CustomViewExerciseTaskSubmission)?.data_json as UserAnswer) ?? null

        const pubSpec = task.public_spec as PublicSpec
        const gradingFeedback = grading.feedback_json
          ? (grading.feedback_json as ExerciseFeedback)
          : null
        const task_id = task.task_id
        const exercise_id = exercise.exercise_id
        const exercise_name = exercise.exercise_name
        return gradingFeedback?.factorReport ||
          (pubSpec.type == SurveyType.NonFactorial && pubSpec.sumFactor)
          ? { exercise_id, task_id, gradingFeedback, answer, pubSpec, exercise_name }
          : []
      })
    })
    .sort(
      (a, b) =>
        (b.gradingFeedback?.factorReport?.length ?? 0) -
        (a.gradingFeedback?.factorReport?.length ?? 0),
    )

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          <Text style={{ textAlign: "center", paddingBottom: "10px" }}>{course_name}</Text>
          <Text style={[styles.text, { textAlign: "center", paddingBottom: "5px", fontSize: 12 }]}>
            {t("pdf-sub-title")}
          </Text>
        </View>
        <View>
          <Text style={[styles.text, { textAlign: "center", paddingBottom: "10px", fontSize: 10 }]}>
            {`${t("pdf-sub-text", {
              studentName: user_info.first_name,
              date: props.module_completion_date?.substring(0, 10),
            })}`}
          </Text>
        </View>
        <View style={styles.container}>
          {subs.map((exercise) => {
            return (
              <View
                key={exercise.exercise_id}
                style={[styles.item, { paddingBottom: "20px" }]}
                wrap={false}
              >
                <View style={{ paddingBottom: "10px" }}>
                  <Text>{exercise.exercise_name}</Text>
                </View>
                <PDFFactorReport
                  key={exercise.task_id}
                  gradingFeedback={exercise.gradingFeedback}
                  userVariables={user_vars}
                ></PDFFactorReport>
                {exercise.answer && (
                  <PDFSumFactorReport
                    key={exercise.task_id}
                    gradingFeedback={null}
                    userVariables={user_vars}
                    publicSpec={exercise.pubSpec}
                    answer={exercise.answer}
                  ></PDFSumFactorReport>
                )}
              </View>
            )
          })}
        </View>
      </Page>
    </Document>
  )
}

const PdfGenerator: React.FC<React.PropsWithChildren<CustomViewIframeState>> = (props) => {
  const { t } = useTranslation()
  const fileName = t("pdf-file-name")
  const buttonText = t("pdf-download-text")
  return (
    <div>
      <PDFDownloadLink document={<MyDoc {...props} />} fileName={fileName}>
        <Button variant="blue" size={"large"}>
          <span
            className={css`
              width: 100%;
              word-wrap: break-word;
              white-space: normal;
              display: block;
              text-overflow: ellipsis;
            `}
          >
            {`${buttonText}`}
          </span>
        </Button>
      </PDFDownloadLink>
    </div>
  )
}

export default PdfGenerator
