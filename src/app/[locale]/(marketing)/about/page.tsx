import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AboutPageContent } from "@/sections/about/AboutPage";
import { MarketFooter } from "@/sections/market-discovery/components/MarketFooter";

type AboutPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: AboutPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: "AboutPage",
  });

  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}

export default async function AboutPage(props: AboutPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <>
      <AboutPageContent />
      <MarketFooter />
    </>
  );
}
