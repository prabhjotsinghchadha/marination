import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getBlogListing } from "@/sanity/blog-data";
import { BlogPageContent } from "@/sections/blog/BlogPage";
import { MarketFooter } from "@/sections/market-discovery/components/MarketFooter";

type BlogIndexPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: BlogIndexPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: "BlogPage",
  });

  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}

export default async function BlogIndexPage(props: BlogIndexPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const { featured, categories, posts, totalCount, fetchFailed } = await getBlogListing();

  return (
    <>
      <BlogPageContent
        featured={featured}
        posts={posts}
        categories={categories}
        totalCount={totalCount}
        fetchFailed={fetchFailed}
      />
      <MarketFooter />
    </>
  );
}
