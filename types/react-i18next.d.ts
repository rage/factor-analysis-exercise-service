import "i18next"

import ownTranslations from "../src/shared-module/locales/en/factorial-survey.json"
import sharedModule from "../src/shared-module/locales/en/shared-module.json"

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "factorial-survey"
    fallbackNS: "shared-module"
    resources: {
      //"example-exercise": typeof ownTranslations
      "factorial-survey": typeof ownTranslations
      "shared-module": typeof sharedModule
    }
    allowObjectInHTMLChildren: true
  }

  type Trans = string // typeof Reacti18Next.Trans
}
