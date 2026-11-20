/* eslint-disable i18next/no-literal-string */
import { readFileSync } from "fs"

import { PublicSpec } from "../src/util/spec-types/publicSpec"
import { checkSpec, SpecFinding } from "../src/util/specChecks"

const USAGE = `Usage: npm run audit-specs -- <exported-specs.json>

Reports spec problems that can block students from submitting (checks in src/util/specChecks.ts).

Input: a JSON array of
  { "course": string, "exercise": string, "task": string, "public_spec": object | string }
where public_spec is the exercise task's public spec (a JSON string is parsed). For example:

  SELECT json_agg(json_build_object(
    'course', c.name, 'exercise', e.name, 'task', t.id, 'public_spec', t.public_spec))
  FROM exercise_tasks t
  JOIN exercise_slides s ON s.id = t.exercise_slide_id
  JOIN exercises e ON e.id = s.exercise_id
  JOIN courses c ON c.id = e.course_id
  WHERE t.exercise_type = '<this service's slug>'
    AND t.deleted_at IS NULL AND e.deleted_at IS NULL AND c.deleted_at IS NULL;

Exit status: 0 no findings, 1 findings reported, 2 unreadable input.`

/** One exported exercise task; see USAGE. */
interface ExportedTask {
  course: string
  exercise: string
  task: string
  public_spec: PublicSpec | string | null
}

const parseExport = (path: string): ExportedTask[] => {
  const parsed = JSON.parse(readFileSync(path, "utf8"))
  if (!Array.isArray(parsed)) {
    throw new Error("expected a JSON array")
  }
  return parsed
}

const main = (args: string[]): number => {
  if (args.length !== 1 || args[0] === "--help" || args[0] === "-h") {
    console.error(USAGE)
    return 2
  }
  let tasks: ExportedTask[]
  try {
    tasks = parseExport(args[0])
  } catch (error) {
    console.error(`Cannot read ${args[0]}: ${error instanceof Error ? error.message : error}`)
    console.error(USAGE)
    return 2
  }

  const findingsByExercise = new Map<string, { task: string; finding: SpecFinding }[]>()
  for (const task of tasks) {
    const spec =
      typeof task.public_spec === "string" ? JSON.parse(task.public_spec) : task.public_spec
    const key = `${task.course} / ${task.exercise}`
    for (const finding of checkSpec(spec)) {
      findingsByExercise.set(key, [
        ...(findingsByExercise.get(key) ?? []),
        { task: task.task, finding },
      ])
    }
  }

  const exerciseKeys = [...findingsByExercise.keys()].sort()
  for (const key of exerciseKeys) {
    console.log(key)
    for (const { task, finding } of findingsByExercise.get(key) ?? []) {
      console.log(`  task ${task} [${finding.kind}] ${finding.message}`)
    }
  }
  const findingCount = exerciseKeys.reduce(
    (sum, key) => sum + (findingsByExercise.get(key)?.length ?? 0),
    0,
  )
  console.log(
    `${tasks.length} tasks checked, ${findingCount} findings in ${exerciseKeys.length} exercises.`,
  )
  return findingCount > 0 ? 1 : 0
}

process.exitCode = main(process.argv.slice(2))
