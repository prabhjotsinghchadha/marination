import { cache } from "react";
import { client } from "@/sanity/client";
import { FAQ_PAGE_BY_LOCALE_QUERY } from "@/sanity/queries";
import type { SanityFaqPageQuery } from "@/sanity/types";
import { getFaqCategories, type FaqCategory } from "@/sections/faq/faqCategories";

function normaliseSanityFaq(data: SanityFaqPageQuery): FaqCategory[] | null {
  const rows = data?.categories;
  if (!rows?.length) {
    return null;
  }
  const out: FaqCategory[] = [];
  for (const c of rows) {
    if (!c.id?.trim() || !c.label?.trim()) {
      continue;
    }
    const questions = (c.questions ?? [])
      .filter((item) => item.q?.trim() && item.a?.trim())
      .map((item) => ({ q: item.q!.trim(), a: item.a!.trim() }));
    if (questions.length === 0) {
      continue;
    }
    out.push({
      id: c.id.trim(),
      label: c.label.trim(),
      icon: c.icon?.trim() || "❓",
      questions,
    });
  }
  return out.length > 0 ? out : null;
}

/**
 * Loads FAQ categories from Sanity for the given marketing locale, falling back to bundled JSON when missing or on error.
 */
export const getFaqPageCategories = cache(async (locale: string): Promise<FaqCategory[]> => {
  const sanityLocale = locale === "fr" ? "fr" : "en";
  try {
    const raw = await client.fetch<SanityFaqPageQuery>(FAQ_PAGE_BY_LOCALE_QUERY, {
      locale: sanityLocale,
    });
    const fromSanity = normaliseSanityFaq(raw);
    if (fromSanity) {
      return fromSanity;
    }
  } catch {
    // fall through to JSON
  }
  return getFaqCategories(locale);
});
