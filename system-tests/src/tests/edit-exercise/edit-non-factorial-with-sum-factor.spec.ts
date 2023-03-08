import { test } from "@playwright/test"

import expectScreenshotsToMatchSnapshots from "../../utils/screenshot"
import waitForFunction from "../../utils/waitForFunction"

test("can add weighted options to non-factorial survey and build a sum-factor report", async ({
  page,
  headless,
}) => {
  await page.goto("https://courses.mooc.fi/playground-views")

  await page.fill('[name="url"]', "http://localhost:3008/api/service-info")
  await page.waitForSelector("text=Valid service info")

  const frame = await waitForFunction(page, () =>
    page.frames().find((f) => {
      return f.url().startsWith("http://localhost:3008/iframe")
    }),
  )
  if (!frame) {
    throw new Error("Could not find frame")
  }

  await (await page.waitForSelector("text=Communication with the IFrame")).scrollIntoViewIfNeeded()

  await (await frame.waitForSelector("text=Choose type of Survey")).scrollIntoViewIfNeeded()
  const dropdown = await frame.locator('[aria-label="select-survey-type"]')
  await dropdown.selectOption("non-factorial")

  await frame.getByRole("button", { name: "Add Survey Item" }).click()
  await frame.getByPlaceholder("question_label; question text").click()

  await frame
    .getByPlaceholder("question_label; question text")
    .fill("first_quest; Are you always hungry?")
  await frame
    .getByRole("combobox", { name: "select-answer-type-first_quest." })
    .selectOption("weighted-radio-group")
  await frame.getByRole("button", { name: "Add Option" }).click()
  await frame.getByLabel("Option text").fill("yes")
  await frame.getByLabel("value").fill("1")
  await frame.getByRole("button", { name: "Add Option" }).click()
  await frame.locator("#option-text-2-first_quest").fill("no")
  await frame.locator("#rate-value-2-first_quest").fill("3")
  await frame.getByRole("button", { name: "Add Option" }).click()
  await frame.locator("#option-text-3-first_quest").fill("depends")
  await frame.locator("#rate-value-3-first_quest").fill("6")
  await frame.getByLabel("Mandatory").check()
  await frame.getByRole("button", { name: "Add Survey Item" }).click()
  await frame
    .getByRole("group", { name: "." })
    .filter({
      hasText: 'xMarkdown Editor (special purpose labels: "info" & "info-header")ConditionalMake',
    })
    .getByPlaceholder("question_label; question text")
    .fill("anger; Do you get angry when hungry?")
  await frame
    .getByRole("combobox", { name: "select-answer-type-anger." })
    .selectOption("weighted-radio-group")
  await frame
    .getByRole("group", { name: "anger." })
    .getByRole("button", { name: "Add Option" })
    .click()
  await frame.getByRole("group", { name: "anger." }).getByLabel("Option text").fill("Often")
  await frame.getByRole("group", { name: "anger." }).getByLabel("value").fill("2")
  await frame
    .getByRole("group", { name: "anger." })
    .getByRole("button", { name: "Add Option" })
    .click()
  await frame.locator("#option-text-2-anger").fill("Always")
  await frame.locator("#rate-value-2-anger").fill("5")

  await frame
    .getByRole("group", { name: "anger." })
    .getByRole("button", { name: "Add Option" })
    .click()
  await frame.locator("#option-text-3-anger").fill("Never")
  await frame
    .getByRole("group", { name: "anger." })
    .getByRole("button", { name: "Add Option" })
    .click()
  await frame.locator("#rate-value-3-anger").fill("-4")
  await frame.locator("#option-text-4-anger").fill("sometimes")
  await frame.locator("#rate-value-4-anger").fill("1")
  await frame.getByRole("button", { name: "Add Survey Item" }).click()
  await frame
    .getByRole("group", { name: "." })
    .filter({
      hasText: 'xMarkdown Editor (special purpose labels: "info" & "info-header")ConditionalMake',
    })
    .getByPlaceholder("question_label; question text")
    .fill("do; What do you do when you get angry?")
  await frame.getByRole("combobox", { name: "select-answer-type-do." }).press("ArrowDown")
  await frame.getByRole("checkbox", { name: "mark-conditional-do" }).check()
  await frame.locator("#condition-selector-for-do").click()
  await frame.getByRole("combobox", { name: "triggering-option-selector" }).fill("ofte")
  await frame.getByRole("combobox", { name: "triggering-option-selector" }).press("Enter")
  await frame.getByRole("combobox", { name: "triggering-option-selector" }).fill("alwa")
  await frame.getByRole("combobox", { name: "triggering-option-selector" }).press("Enter")
  await frame.getByRole("combobox", { name: "triggering-option-selector" }).fill("some")
  await frame.getByRole("combobox", { name: "triggering-option-selector" }).press("Enter")
  await frame.getByRole("combobox", { name: "triggering-option-selector" }).fill("yes")
  await frame.getByRole("combobox", { name: "triggering-option-selector" }).press("Enter")
  await frame.getByLabel("Calculate sum-factor report to student").check()
  await frame.getByPlaceholder("Factor title text").fill("Hunger-Anger")
  await frame
    .locator(
      "#logo-selector > .css-13cymwt-control > .css-1hb7zxy-IndicatorsContainer > .css-1xc3v61-indicatorContainer",
    )
    .click()
  await frame.locator("#react-select-3-option-0").click()
  await frame.getByRole("button", { name: "Add Sum-Factor Sub-Category" }).click()
  await frame.getByPlaceholder('example "normal", "low" or "danger zone"').fill("normal")
  await frame.getByLabel("range to").fill("7")
  await frame
    .getByRole("button", {
      name: 'Custom color picker. The currently selected color is called "Custom" and has a value of "F5F6F7".',
    })
    .click()
  await frame.getByLabel("Hex color").fill("80BFFF")

  await frame.getByRole("button", { name: "Add Sum-Factor Sub-Category" }).click()
  await frame.getByRole("textbox", { name: "2-Category Label" }).fill("not normal")
  await frame
    .getByRole("button", {
      name: 'Custom color picker. The currently selected color is called "Custom" and has a value of "F5F6F7".',
    })
    .click()
  await frame.getByLabel("Hex color").fill("FFA6FF")
  await frame.getByRole("group", { name: "Define the sum-factor" }).click()
  await frame
    .getByRole("listitem")
    .filter({ hasText: "Category Label range from range to bar colorCustomffa6ffx" })
    .getByLabel("range to")
    .fill("18")
  await frame.getByRole("button", { name: "Add Sum-Factor Sub-Category" }).click()
  await frame.getByRole("textbox", { name: "3-Category Label" }).fill("no problems")
  await frame
    .getByRole("listitem")
    .filter({ hasText: "Category Label range from range to bar colorCustomF5F6F7x" })
    .getByLabel("range from")
    .fill("-6")
  await frame
    .getByRole("button", {
      name: 'Custom color picker. The currently selected color is called "Custom" and has a value of "F5F6F7".',
    })
    .click()
  await frame.getByLabel("Hex color").fill("73E6E6")

  await frame.getByRole("button", { name: "Add Sum-Factor Sub-Category" }).click()
  await frame
    .getByRole("listitem")
    .filter({ hasText: "Category Label range from range to bar colorCustomF5F6F7x" })
    .getByLabel("range from")
    .fill("7")
  await frame
    .getByRole("listitem")
    .filter({ hasText: "Category Label range from range to bar colorCustomF5F6F7x" })
    .getByLabel("range to")
    .fill("12")
  await frame.getByRole("textbox", { name: "4-Category Label" }).fill("in between")
  await frame
    .getByRole("button", {
      name: 'Custom color picker. The currently selected color is called "Custom" and has a value of "F5F6F7".',
    })
    .click()
  await frame.getByLabel("Hex color").fill("FFB366")
  await frame
    .getByRole("listitem")
    .filter({ hasText: "Category Label range from range to bar colorCustomffa6ffx" })
    .getByLabel("range from")
    .fill("11")
  await frame
    .getByRole("listitem")
    .filter({ hasText: "Category Label range from range to bar colorCustomffa6ffx" })
    .getByLabel("range from")
    .click()
  await frame
    .getByRole("listitem")
    .filter({ hasText: "Category Label range from range to bar colorCustomffa6ffx" })
    .getByLabel("range from")
    .fill("12")
  await page
    .frameLocator("iframe")
    .getByPlaceholder("Factor description")
    .fill(
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    )

  await expectScreenshotsToMatchSnapshots({
    axeSkip: ["heading-order", "scrollable-region-focusable"],
    headless,
    snapshotName: "sum-factor-report-built",
    frame: frame,
    clearNotifications: true,
  })

  await frame.getByRole("textbox", { name: "4-Category Label" }).fill("in between of two normals")

  await expectScreenshotsToMatchSnapshots({
    axeSkip: ["heading-order", "scrollable-region-focusable"],
    headless,
    snapshotName: "sum-factor-report-built-stacked-labels",
    frame: frame,
    clearNotifications: true,
  })

  await page.locator("text=Set as private spec input").click()
  //await page.getByRole("button", { name: "Aseta private spec syötteeksi" }).click()

  await page.locator('button:has-text("answer-exercise")').scrollIntoViewIfNeeded()
  await page.click('button:text("answer-exercise")')

  const answer_frame = await waitForFunction(page, () =>
    page.frames().find((f) => {
      return f.url().startsWith("http://localhost:3008/iframe")
    }),
  )
  if (!answer_frame) {
    throw new Error("Could not find frame")
  }

  await answer_frame.waitForSelector("text=Are you always hungry?")

  await expectScreenshotsToMatchSnapshots({
    axeSkip: ["heading-order", "scrollable-region-focusable"],
    headless,
    snapshotName: "sum-factorial-answer-exercise",
    frame: answer_frame,
    clearNotifications: true,
  })

  await answer_frame.getByRole("radio", { name: "yes" }).check()
  await answer_frame.getByRole("radio", { name: "Never" }).check()
  await answer_frame.getByRole("textbox", { name: "text-input-for-do" }).click()
  await answer_frame.getByRole("textbox", { name: "text-input-for-do" }).fill("I eat")
  await page.getByRole("button", { name: "Submit" }).click()

  await expectScreenshotsToMatchSnapshots({
    axeSkip: ["heading-order", "scrollable-region-focusable"],
    headless,
    snapshotName: "sum-factorial-answered-exercise",
    frame: answer_frame,
    clearNotifications: true,
  })

  await page.locator('button:has-text("view-submission")').scrollIntoViewIfNeeded()
  await page.click('button:text("view-submission")')

  const submission_frame = await waitForFunction(page, () =>
    page.frames().find((f) => {
      return f.url().startsWith("http://localhost:3008/iframe")
    }),
  )
  if (!submission_frame) {
    throw new Error("Could not find frame")
  }
  await submission_frame.waitForSelector("text=Hunger-Anger")
  await expectScreenshotsToMatchSnapshots({
    axeSkip: ["heading-order", "scrollable-region-focusable"],
    headless,
    snapshotName: "submit-view-sum-factorial-report",
    frame: submission_frame,
    clearNotifications: true,
  })
})
