// @ts-check
import { expect, test } from "@playwright/test"

import expectScreenshotsToMatchSnapshots from "../../utils/screenshot"
import waitForFunction from "../../utils/waitForFunction"

test("can add factorial survey type wtih information elements and questions intermixed", async ({
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
  expect(await dropdown.selectOption("non-factorial")).toHaveLength(1)

  // Click text=Add Survey Item
  await frame.locator("text=Add Survey Item").click()
  // Fill textarea
  await frame
    .locator("textarea")
    .fill(
      "info-header; Koiran käyttäytymiseen vaikuttavat perimän lisäksi myös koiran kokemukset etenkin pentuaikana. Täytä huolellisesti seuraavat kysymykset koiran taustasta. Saatat joutua ottamaan yhteyttä koirasi kasvattajaan koirasi pentuaikaa koskevien kysymysten täyttämisessä.\nTähdellä merkityt kysymykset ovat pakollisia.\nTietosuoja *",
    )
  await frame.waitForSelector("text=Checkbox text editor")
  // Fill textarea >> nth=1
  await frame
    .locator("textarea")
    .nth(1)
    .fill(
      "Hyväksyn että henkilötietoni, koirani tiedot ja kaikki tällä lomakkeella kerätyt tiedot siirretään Helsingin yliopiston koirien geenitutkimusryhmän käyttöön tieteellisessä tutkimuksessa. Lisätietoja löydät Koirien geenitutkimusryhmän tietosuojaselosteesta.",
    )
  // Click text=Add Survey Item
  await frame.locator("text=Add Survey Item").click()

  // Fill textarea >> nth=2
  await frame.locator("textarea").nth(2).fill("ownership; Asuuko koira luonasi? *")
  // Select radio-group
  await frame.locator('[aria-label="select-answer-type-ownership"]').selectOption("radio-group")
  // Click text=add option
  await frame.locator("text=add option").click()
  // Click input[type="text"]
  await frame.locator('input[type="text"]').click()
  // Fill input[type="text"]
  await frame.locator('input[type="text"]').fill("Kyllä")
  // Click text=add option
  await frame.locator("text=add option").click()
  // Click input[type="text"] >> nth=1
  await frame
    .locator('input[type="text"]')
    .nth(1)
    .click({
      modifiers: ["Shift"],
    })
  // Click input[type="text"] >> nth=1
  await frame.locator('input[type="text"]').nth(1).click()
  // Fill input[type="text"] >> nth=1
  await frame.locator('input[type="text"]').nth(1).fill("Ei")

  // Click text=duplicate item >> nth=1
  await frame.locator("text=duplicate item").nth(1).click()
  // Click textarea >> nth=3
  await frame.locator("textarea").nth(3).click()
  // Fill textarea >> nth=3
  await frame.locator("textarea").nth(3).fill("death; Onko koira kuollut? *")
  // Select multiple-choice
  await frame.locator('[aria-label="select-answer-type-death"]').selectOption("multiple-choice")
  // Check input[type="checkbox"] >> nth=2
  await frame.locator('input[type="checkbox"]').nth(2).check()
  // Select ownership,Ei
  await frame.locator("select").nth(3).selectOption("ownership,Ei")

  // Click text=Add Survey Item
  await frame.locator("text=Add Survey Item").click()
  // Click textarea >> nth=4
  await frame.locator("textarea").nth(4).click()
  // Fill textarea >> nth=4
  await frame.locator("textarea").nth(4).fill("date_of_death; Koiran kuolinaika (PP.KK.VVVV)")
  // Select date
  await frame.locator('[aria-label="select-answer-type-date_of_death"]').selectOption("date")
  // Check input[type="checkbox"] >> nth=3
  await frame.locator('input[type="checkbox"]').nth(3).check()
  // Select death,Kyllä
  await frame
    .locator('[aria-label="triggering-option-selector"]')
    .nth(1)
    .selectOption("death,Kyllä")

  // from here on!!!

  // Click text=Add Survey Item
  await frame.locator("text=Add Survey Item").click()
  // Click li:nth-child(5) > .css-fgfehr-StyledOuterEditor > .css-ck76l7-SurveyItemEditor > .css-1sntlgu-TextAreaField-SurveyItemEditor > label > textarea
  await frame
    .locator(
      "li:nth-child(5) > .css-fgfehr-StyledOuterEditor > .css-ck76l7-SurveyItemEditor > .css-1sntlgu-TextAreaField-SurveyItemEditor > label > textarea",
    )
    .click({
      modifiers: ["Control"],
    })
  // Fill li:nth-child(5) > .css-fgfehr-StyledOuterEditor > .css-ck76l7-SurveyItemEditor > .css-1sntlgu-TextAreaField-SurveyItemEditor > label > textarea
  await frame
    .locator(
      "li:nth-child(5) > .css-fgfehr-StyledOuterEditor > .css-ck76l7-SurveyItemEditor > .css-1sntlgu-TextAreaField-SurveyItemEditor > label > textarea",
    )
    .fill("breed; Minkä rotuinen koira on? *")
  // Select breed-list
  await frame.locator('[aria-label="select-answer-type-breed"]').selectOption("breed-list")
  // Click text=Add Survey Item
  await frame.locator("text=Add Survey Item").click()
  // Click li:nth-child(6) > .css-fgfehr-StyledOuterEditor > .css-ck76l7-SurveyItemEditor > .css-1sntlgu-TextAreaField-SurveyItemEditor > label > textarea
  await frame
    .locator(
      "li:nth-child(6) > .css-fgfehr-StyledOuterEditor > .css-ck76l7-SurveyItemEditor > .css-1sntlgu-TextAreaField-SurveyItemEditor > label > textarea",
    )
    .click({
      modifiers: ["Control"],
    })
  // Click li:nth-child(6) > .css-fgfehr-StyledOuterEditor > .css-ck76l7-SurveyItemEditor > .css-1sntlgu-TextAreaField-SurveyItemEditor > label > textarea
  await frame
    .locator(
      "li:nth-child(6) > .css-fgfehr-StyledOuterEditor > .css-ck76l7-SurveyItemEditor > .css-1sntlgu-TextAreaField-SurveyItemEditor > label > textarea",
    )
    .click({
      modifiers: ["Control"],
    })
  // Press Enter
  await frame
    .locator(
      "li:nth-child(6) > .css-fgfehr-StyledOuterEditor > .css-ck76l7-SurveyItemEditor > .css-1sntlgu-TextAreaField-SurveyItemEditor > label > textarea",
    )
    .press("Enter")
  // Fill li:nth-child(6) > .css-fgfehr-StyledOuterEditor > .css-ck76l7-SurveyItemEditor > .css-1sntlgu-TextAreaField-SurveyItemEditor > label > textarea
  await frame
    .locator(
      "li:nth-child(6) > .css-fgfehr-StyledOuterEditor > .css-ck76l7-SurveyItemEditor > .css-1sntlgu-TextAreaField-SurveyItemEditor > label > textarea",
    )
    .fill("obtained_age; Minkä ikäinen koira oli tullessaan teille? *")
  // Select dropdown-selection
  await frame
    .locator('[aria-label="select-answer-type-obtained_age"]')
    .selectOption("dropdown-selection")
  // Click text=add option >> nth=2
  await frame.locator("text=add option").nth(2).click()
  // Click text=obtained_ageMinkä ikäinen koira oli tullessaan teille? * xEditor (special purpos >> [aria-label="\30 -option-text"]
  await frame
    .locator(
      'text=obtained_ageMinkä ikäinen koira oli tullessaan teille? * xEditor (special purpos >> [aria-label="\\30 -option-text"]',
    )
    .click()
  // Fill text=obtained_ageMinkä ikäinen koira oli tullessaan teille? * xEditor (special purpos >> [aria-label="\30 -option-text"]
  await frame
    .locator(
      'text=obtained_ageMinkä ikäinen koira oli tullessaan teille? * xEditor (special purpos >> [aria-label="\\30 -option-text"]',
    )
    .fill("nuori")
  // Click text=add option >> nth=2
  await frame.locator("text=add option").nth(2).click()
  // Click text=obtained_ageMinkä ikäinen koira oli tullessaan teille? * xEditor (special purpos >> [aria-label="\31 -option-text"]
  await frame
    .locator(
      'text=obtained_ageMinkä ikäinen koira oli tullessaan teille? * xEditor (special purpos >> [aria-label="\\31 -option-text"]',
    )
    .click()
  // Fill text=obtained_ageMinkä ikäinen koira oli tullessaan teille? * xEditor (special purpos >> [aria-label="\31 -option-text"]
  await frame
    .locator(
      'text=obtained_ageMinkä ikäinen koira oli tullessaan teille? * xEditor (special purpos >> [aria-label="\\31 -option-text"]',
    )
    .fill("vanha")
  // Click text=add option >> nth=2
  await frame.locator("text=add option").nth(2).click()
  // Click [aria-label="\32 -option-text"]
  await frame.locator('[aria-label="\\32 -option-text"]').click()
  // Fill [aria-label="\32 -option-text"]
  await frame.locator('[aria-label="\\32 -option-text"]').fill("muu")
  // Click li:nth-child(6) > .css-fgfehr-StyledOuterEditor > .css-ck76l7-SurveyItemEditor > div:nth-child(6) > .css-94rpl7-SurveyItemEditor
  await frame
    .locator(
      "li:nth-child(6) > .css-fgfehr-StyledOuterEditor > .css-ck76l7-SurveyItemEditor > div:nth-child(6) > .css-94rpl7-SurveyItemEditor",
    )
    .click()
  // Click [id="__next"] div:has-text("info-headerKoiran käyttäytymiseen vaikuttavat perimän lisäksi myös koiran kokemu") >> nth=0
  await frame
    .locator(
      '[id="__next"] div:has-text("info-headerKoiran käyttäytymiseen vaikuttavat perimän lisäksi myös koiran kokemu")',
    )
    .first()
    .click()
  // Click li:nth-child(7) > .css-fgfehr-StyledOuterEditor > .css-ck76l7-SurveyItemEditor > .css-1sntlgu-TextAreaField-SurveyItemEditor > label > textarea
  await frame
    .locator(
      "li:nth-child(7) > .css-fgfehr-StyledOuterEditor > .css-ck76l7-SurveyItemEditor > .css-1sntlgu-TextAreaField-SurveyItemEditor > label > textarea",
    )
    .click()
  // Fill li:nth-child(7) > .css-fgfehr-StyledOuterEditor > .css-ck76l7-SurveyItemEditor > .css-1sntlgu-TextAreaField-SurveyItemEditor > label > textarea
  await frame
    .locator(
      "li:nth-child(7) > .css-fgfehr-StyledOuterEditor > .css-ck76l7-SurveyItemEditor > .css-1sntlgu-TextAreaField-SurveyItemEditor > label > textarea",
    )
    .fill("weaning_age; Missä iässä koira erotettiin emostaan tai sijaisemosta?")
  // Select multiple-choice
  await frame
    .locator('[aria-label="select-answer-type-weaning_age"]')
    .selectOption("multiple-choice")
  // Check text=weaning_ageMissä iässä koira erotettiin emostaan tai sijaisemosta? xEditor (spec >> input[type="checkbox"]
  await frame
    .locator(
      'text=weaning_ageMissä iässä koira erotettiin emostaan tai sijaisemosta? xEditor (spec >> input[type="checkbox"]',
    )
    .check()
  // Select obtained_age,nuori
  await frame
    .locator(
      'text=weaning_ageMissä iässä koira erotettiin emostaan tai sijaisemosta? xEditor (spec >> [aria-label="triggering-option-selector"]',
    )
    .selectOption("obtained_age,nuori")
  // Click text=Add Survey Item
  await frame.locator("text=Add Survey Item").click()
  // Click [id="__next"] div:has-text("info-headerKoiran käyttäytymiseen vaikuttavat perimän lisäksi myös koiran kokemu") >> nth=0
  await frame
    .locator(
      '[id="__next"] div:has-text("info-headerKoiran käyttäytymiseen vaikuttavat perimän lisäksi myös koiran kokemu")',
    )
    .first()
    .click()
  // Click li:nth-child(8) > .css-fgfehr-StyledOuterEditor > .css-ck76l7-SurveyItemEditor > .css-1sntlgu-TextAreaField-SurveyItemEditor > label > textarea
  await frame
    .locator(
      "li:nth-child(8) > .css-fgfehr-StyledOuterEditor > .css-ck76l7-SurveyItemEditor > .css-1sntlgu-TextAreaField-SurveyItemEditor > label > textarea",
    )
    .click()
  // Fill li:nth-child(8) > .css-fgfehr-StyledOuterEditor > .css-ck76l7-SurveyItemEditor > .css-1sntlgu-TextAreaField-SurveyItemEditor > label > textarea
  await frame
    .locator(
      "li:nth-child(8) > .css-fgfehr-StyledOuterEditor > .css-ck76l7-SurveyItemEditor > .css-1sntlgu-TextAreaField-SurveyItemEditor > label > textarea",
    )
    .fill("info; Sosiaalistamiskausi: 7 viikon - 4 kuukauden iässä, miten usein koira...")
  // Check text=infoSosiaalistamiskausi: 7 viikon - 4 kuukauden iässä, miten usein koira... xEdi >> input[type="checkbox"]
  await frame
    .locator(
      'text=infoSosiaalistamiskausi: 7 viikon - 4 kuukauden iässä, miten usein koira... xEdi >> input[type="checkbox"]',
    )
    .check()
  // Select weaning_age,nuori
  await frame
    .locator(
      'text=infoSosiaalistamiskausi: 7 viikon - 4 kuukauden iässä, miten usein koira... xEdi >> [aria-label="triggering-option-selector"]',
    )
    .selectOption("weaning_age,nuori")
  // Click text=Add Survey Item
  await frame.locator("text=Add Survey Item").click()
  // Click li:nth-child(9) > .css-fgfehr-StyledOuterEditor > .css-ck76l7-SurveyItemEditor > .css-1sntlgu-TextAreaField-SurveyItemEditor > label > textarea
  await frame
    .locator(
      "li:nth-child(9) > .css-fgfehr-StyledOuterEditor > .css-ck76l7-SurveyItemEditor > .css-1sntlgu-TextAreaField-SurveyItemEditor > label > textarea",
    )
    .click()
  // Fill li:nth-child(9) > .css-fgfehr-StyledOuterEditor > .css-ck76l7-SurveyItemEditor > .css-1sntlgu-TextAreaField-SurveyItemEditor > label > textarea
  await frame
    .locator(
      "li:nth-child(9) > .css-fgfehr-StyledOuterEditor > .css-ck76l7-SurveyItemEditor > .css-1sntlgu-TextAreaField-SurveyItemEditor > label > textarea",
    )
    .fill("socialization_car; matkusti autolla? *")
  // Select number
  await frame.locator('[aria-label="select-answer-type-socialization_car"]').selectOption("number")

  // Check text=infoSosiaalistamiskausi: 7 viikon - 4 kuukauden iässä, miten usein koira... xEdi >> input[type="checkbox"]
  await frame.locator('text=socialization_carmatkusti autolla? * >> input[type="checkbox"]').check()
  // Select obtained_age,muu
  await frame
    .locator('[aria-label="triggering-option-selector"]')
    .nth(4)
    .selectOption("obtained_age,muu")

  await expectScreenshotsToMatchSnapshots({
    axeSkip: ["heading-order", "scrollable-region-focusable"],
    headless,
    snapshotName: "mini-spec-edit-exercise",
    frame,
    clearNotifications: true,
  })
  // Click text=Set as private spec input
  await page.locator("text=Set as private spec input").click()

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

  await answer_frame.waitForSelector(
    "text=Koiran käyttäytymiseen vaikuttavat perimän lisäksi myös koiran kokemukset etenkin pentuaikana",
  )
  await expectScreenshotsToMatchSnapshots({
    axeSkip: ["heading-order", "scrollable-region-focusable"],
    headless,
    snapshotName: "mini-spec-edit-and-answer-exercise",
    frame: answer_frame,
    clearNotifications: true,
  })
})
