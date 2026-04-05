import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getAllPostSlugs, getBlogPostBySlug, getRelatedBlogPosts } from "@/sanity/blog-data";
import { BlogArticlePage } from "@/sections/blog/BlogArticlePage";
import { MarketFooter } from "@/sections/market-discovery/components/MarketFooter";
import { DS } from "@/product/design-system/colors";

type BlogPostPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(props: BlogPostPageProps): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const post = await getBlogPostBySlug(slug);
  const t = await getTranslations({ locale, namespace: "BlogArticlePage" });

  if (!post) {
    return { title: t("not_found_meta_title") };
  }

  const title = post.seo?.metaTitle?.trim() || post.title || t("fallback_title");
  const description = post.seo?.metaDescription?.trim() || post.excerpt || t("fallback_description");
  const ogImage = post.seo?.ogImage || post.coverImage;

  return {
    title,
    description,
    openGraph: ogImage ? { images: [{ url: ogImage }] } : undefined,
  };
}

export default async function BlogPostPage(props: BlogPostPageProps) {
  const { locale, slug } = await props.params;
  setRequestLocale(locale);

  const post = await getBlogPostBySlug(slug);
  if (!post) {
    notFound();
  }

  const categorySlug = post.category?.slug;
  const related =
    categorySlug != null && categorySlug.length > 0
      ? await getRelatedBlogPosts(categorySlug, post._id)
      : [];

  return (
    <div className="min-h-screen" style={{ background: DS.bgDarkest, color: DS.textPrimary }}>
      <BlogArticlePage post={post} related={related} />
      <MarketFooter />
    </div>
  );
}
