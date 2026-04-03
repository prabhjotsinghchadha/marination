import gettingStartedEn from "./categories/getting-started.en.json";
import predictionsEn from "./categories/predictions.en.json";
import moneyEn from "./categories/money.en.json";
import marketsEn from "./categories/markets.en.json";
import accountEn from "./categories/account.en.json";
import platformEn from "./categories/platform.en.json";
import gettingStartedFr from "./categories/getting-started.fr.json";
import predictionsFr from "./categories/predictions.fr.json";
import moneyFr from "./categories/money.fr.json";
import marketsFr from "./categories/markets.fr.json";
import accountFr from "./categories/account.fr.json";
import platformFr from "./categories/platform.fr.json";

export type FaqCategory = {
  id: string;
  label: string;
  icon: string;
  questions: { q: string; a: string }[];
};

const FAQ_EN: FaqCategory[] = [
  gettingStartedEn as FaqCategory,
  predictionsEn as FaqCategory,
  moneyEn as FaqCategory,
  marketsEn as FaqCategory,
  accountEn as FaqCategory,
  platformEn as FaqCategory,
];

const FAQ_FR: FaqCategory[] = [
  gettingStartedFr as FaqCategory,
  predictionsFr as FaqCategory,
  moneyFr as FaqCategory,
  marketsFr as FaqCategory,
  accountFr as FaqCategory,
  platformFr as FaqCategory,
];

/**
 * Returns localized FAQ categories for the marketing FAQ page.
 */
export function getFaqCategories(locale: string): FaqCategory[] {
  return locale === "fr" ? FAQ_FR : FAQ_EN;
}
