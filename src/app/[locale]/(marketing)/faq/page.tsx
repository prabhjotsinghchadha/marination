import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FaqPageContent } from "@/sections/faq/FaqPage";
import { MarketFooter } from "@/sections/market-discovery/components/MarketFooter";

type FaqPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: FaqPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: "FaqPage",
  });

  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}

export default async function FaqPage(props: FaqPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <>
      <FaqPageContent />
      <MarketFooter />
    </>
  );
}
