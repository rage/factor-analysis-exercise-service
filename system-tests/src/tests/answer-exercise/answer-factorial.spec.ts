// @ts-check
import { test } from "@playwright/test"

import privateSpec from "../../../../tests/.test-data/factorial/mini-test/private-spec.json"
import expectScreenshotsToMatchSnapshots from "../../utils/screenshot"
import waitForFunction from "../../utils/waitForFunction"

test("can fill out form in answer-exercise mini-spec with non-nan valued options", async ({
  page,
  headless,
}) => {
  await page.goto("https://courses.mooc.fi/playground-views")

  await page.fill('[name="url"]', "http://localhost:3008/api/service-info")
  await page.waitForSelector("text=Valid service info")

  await page.fill('[name="private_spec"]', JSON.stringify(privateSpec))
  await page.waitForSelector("text=answer-exercise")

  await page.click('button:text("answer-exercise")')
  const frame = await waitForFunction(page, () =>
    page.frames().find((f) => {
      return f.url().startsWith("http://localhost:3008/iframe")
    }),
  )
  if (!frame) {
    throw new Error("Could not find frame")
  }

  // Check #question_one-factorial-option-2
  await frame.locator("#question_one-factorial-option-2").check()
  // Check #question_two-factorial-option-1
  await frame.locator("#question_two-factorial-option-1").check()
  // Check #three-factorial-option-3
  await frame.locator("#three-factorial-option-3").check()
  // Check #five-factorial-option-2
  await frame.locator("#five-factorial-option-2").check()

  await expectScreenshotsToMatchSnapshots({
    axeSkip: ["heading-order", "scrollable-region-focusable"],
    headless,
    snapshotName: "mini-spec-answer-exercise-form-filled",
    frame,
    clearNotifications: true,
  })
  // Click button:has-text("Submit")
  await page.locator('button:has-text("Submit")').click()
  // Click text=Success >> nth=0
  await page.waitForSelector("text=Success")
  // Click text=view-submission
  await page.locator("text=view-submission").click()
  const submission_frame = await waitForFunction(page, () =>
    page.frames().find((f) => {
      return f.url().startsWith("http://localhost:3008/iframe")
    }),
  )
  if (!submission_frame) {
    throw new Error("Could not find frame")
  }
  await submission_frame.waitForSelector("text=name of factor one")
  await expectScreenshotsToMatchSnapshots({
    axeSkip: ["heading-order", "scrollable-region-focusable"],
    headless,
    snapshotName: "mini-spec-form-submitted-show-submission",
    frame: submission_frame,
    clearNotifications: true,
  })
})
