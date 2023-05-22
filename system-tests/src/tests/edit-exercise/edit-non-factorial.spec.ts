// @ts-check
import { expect, test } from "@playwright/test"

import expectScreenshotsToMatchSnapshots from "../../utils/screenshot"
import waitForFunction from "../../utils/waitForFunction"

test("can add non-factorial survey type with information elements and questions intermixed", async ({
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
  const dropdown = await page.frameLocator("iframe").locator('[aria-label="select-survey-type"]')
  expect(await dropdown.selectOption("non-factorial")).toHaveLength(1)

  await frame
    .getByPlaceholder(
      "Input questions as (semicolon separated) label;question list (questionlabel; question-text..[newline] questionlabel; question-text..)",
    )
    .fill(
      "ownership; Asuuko koira luonasi? *\nowner; Vastaan koirasta, joka on...\nother_owner; Kenen koirasta vastaat?\nanimal_name; Koiran kutsumanimi*\nofficial_name; Koiran virallinen nimi/kennelnimi (jos koiralla ei ole virallista nimeä, kirjoita ”ei ole”)*\nspecies_gender; Koiran sukupuoli*\ndate_of_birth; Koiran syntymäaika (jos kyseessä on rescue, vastaa lähin arvaus) *\ndeath; Onko koira kuollut? *",
    )

  await page
    .frameLocator("iframe")
    .getByRole("combobox", { name: "select-answerSpec-type-ownership" })
    .selectOption("radio-group")
  await page.frameLocator("iframe").getByRole("button", { name: "add option" }).click()
  await page.frameLocator("iframe").getByRole("button", { name: "add option" }).click()
  await page.frameLocator("iframe").getByRole("textbox", { name: "0-option-text" }).fill("yes")
  await page.frameLocator("iframe").getByRole("textbox", { name: "1-option-text" }).fill("no")

  await page
    .frameLocator("iframe")
    .getByRole("group", { name: "owner." })
    .getByRole("combobox", { name: "select-answerSpec-type-owner." })
    .selectOption("multiple-choice")
  await page
    .frameLocator("iframe")
    .getByRole("group", { name: "owner." })
    .getByLabel("or upload a csv file")
    .setInputFiles("test-data/some-options.csv")
  await page
    .frameLocator("iframe")
    .getByRole("group", { name: "owner." })
    .getByRole("button", { name: "Apply" })
    .click()
  await page
    .frameLocator("iframe")
    .getByRole("combobox", { name: "select-answerSpec-type-other_owner" })
    .selectOption("advanced-dropdown")
  await page
    .frameLocator("iframe")
    .getByRole("group", { name: "other_owner" })
    .getByLabel("or upload a csv file")
    .click()
  await page
    .frameLocator("iframe")
    .getByRole("group", { name: "other_owner" })
    .getByLabel("or upload a csv file")
    .setInputFiles("test-data/some-options.csv")
  await page
    .frameLocator("iframe")
    .getByRole("group", { name: "other_owner" })
    .getByRole("button", { name: "Apply" })
    .click()
  await page
    .frameLocator("iframe")
    .getByRole("group", { name: "other_owner" })
    .getByLabel("Conditional")
    .check()
  await page.frameLocator("iframe").locator("#condition-selector-for-other_owner").click()
  await page.frameLocator("iframe").locator("#react-select-2-option-2").dblclick()
  await page
    .frameLocator("iframe")
    .getByRole("combobox", { name: "select-answerSpec-type-animal_name" })
    .selectOption("number")
  await page
    .frameLocator("iframe")
    .getByRole("group", { name: "animal_name" })
    .getByLabel("Conditional")
    .check()
  await page.frameLocator("iframe").locator("#condition-selector-for-animal_name").click()
  await page.frameLocator("iframe").locator("#react-select-3-option-1").click()
  await page
    .frameLocator("iframe")
    .getByRole("combobox", { name: "select-answerSpec-type-official_name" })
    .selectOption("dropdown-selection")
  await page
    .frameLocator("iframe")
    .getByRole("group", { name: "official_name" })
    .getByLabel("or upload a csv file")
    .click()
  await page
    .frameLocator("iframe")
    .getByRole("group", { name: "official_name" })
    .getByLabel("or upload a csv file")
    .setInputFiles("test-data/some-options.csv")
  await page
    .frameLocator("iframe")
    .getByRole("group", { name: "official_name" })
    .getByRole("button", { name: "Apply" })
    .click()
  await page
    .frameLocator("iframe")
    .getByLabel(
      'Editor (special purpose labels: "info" & "info-header")official_name; Koiran virallinen nimi/kennelnimi (jos koiralla ei ole virallista nimeä, kirjoita ”ei ole”)*',
    )
    .click()
  await page
    .frameLocator("iframe")
    .getByLabel(
      'Editor (special purpose labels: "info" & "info-header")official_name; Koiran virallinen nimi/kennelnimi (jos koiralla ei ole virallista nimeä, kirjoita ”ei ole”)*',
    )
    .click()
  await page
    .frameLocator("iframe")
    .getByLabel(
      'Editor (special purpose labels: "info" & "info-header")official_name; Koiran virallinen nimi/kennelnimi (jos koiralla ei ole virallista nimeä, kirjoita ”ei ole”)*',
    )
    .click()
  await page
    .frameLocator("iframe")
    .getByLabel(
      'Editor (special purpose labels: "info" & "info-header")official_name; Koiran virallinen nimi/kennelnimi (jos koiralla ei ole virallista nimeä, kirjoita ”ei ole”)*',
    )
    .click()
  await page
    .frameLocator("iframe")
    .getByLabel(
      'Editor (special purpose labels: "info" & "info-header")official_name; Koiran virallinen nimi/kennelnimi (jos koiralla ei ole virallista nimeä, kirjoita ”ei ole”)*',
    )
    .fill(
      "info; Koiran virallinen nimi/kennelnimi (jos koiralla ei ole virallista nimeä, kirjoita ”ei ole”)*",
    )
  await page
    .frameLocator("iframe")
    .getByRole("group", { name: "species_gender" })
    .getByRole("button", { name: "x" })
    .click()
  await page
    .frameLocator("iframe")
    .getByRole("combobox", { name: "select-answerSpec-type-death" })
    .selectOption("date")
  await page
    .frameLocator("iframe")
    .getByRole("group", { name: "death" })
    .getByLabel("Conditional")
    .check()
  await page.frameLocator("iframe").locator("#condition-selector-for-death").click()
  await page.frameLocator("iframe").locator("#react-select-4-option-2").click()
  //Choose two more options
  await page.frameLocator("iframe").locator("#react-select-4-option-5").dblclick()
  await page
    .frameLocator("iframe")
    .getByRole("group", { name: "owner." })
    .getByRole("button", { name: "x" })
    .nth(1)
    .click()

  await page.locator("text=Set as private spec input").click()

  const edit_frame = await waitForFunction(page, () =>
    page.frames().find((f) => {
      return f.url().startsWith("http://localhost:3008/iframe")
    }),
  )
  if (!edit_frame) {
    throw new Error("Could not find frame")
  }

  await edit_frame.waitForSelector("text=ownership; Asuuko koira luonasi? *")
  await expectScreenshotsToMatchSnapshots({
    axeSkip: ["heading-order", "scrollable-region-focusable"],
    headless,
    snapshotName: "mini-spec-edit-exercise",
    frame: edit_frame,
    clearNotifications: true,
  })

  // Click button:has-text("answer-exercise")
  await page.locator('button:has-text("answer-exercise")').click()

  const answer_frame = await waitForFunction(page, () =>
    page.frames().find((f) => {
      return f.url().startsWith("http://localhost:3008/iframe")
    }),
  )
  if (!answer_frame) {
    throw new Error("Could not find frame")
  }

  await answer_frame.waitForSelector("text=Asuuko koira luonasi? *")

  await expectScreenshotsToMatchSnapshots({
    axeSkip: ["heading-order", "scrollable-region-focusable"],
    headless,
    snapshotName: "mini-spec-edit-and-answer-exercise",
    frame: answer_frame,
    clearNotifications: true,
  })

  await page.frameLocator("iframe").getByRole("radio", { name: "yes" }).check()
  await page.frameLocator("iframe").getByRole("radio", { name: "no" }).check()

  await page
    .frameLocator("iframe")
    .getByRole("checkbox", { name: "option two, contains comma" })
    .check()
  await page.frameLocator("iframe").getByRole("checkbox", { name: "option three" }).check()

  await page
    .frameLocator("iframe")
    .getByRole("checkbox", { name: "option two, contains comma" })
    .uncheck()
  await page.frameLocator("iframe").getByRole("checkbox", { name: "option three" }).uncheck()
  await page.frameLocator("iframe").getByRole("checkbox", { name: "option three" }).check()

  await expectScreenshotsToMatchSnapshots({
    axeSkip: ["heading-order", "scrollable-region-focusable"],
    headless,
    snapshotName: "answer-exercise-conditional-questions-appear",
    frame: answer_frame,
    clearNotifications: true,
  })
})
