"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useFormatter, useTranslations } from "next-intl";
import { DS } from "@/product/design-system/colors";
import { Link } from "@/libs/I18nNavigation";
import type { SanityBlogPostList, SanityCategoryDoc } from "@/sanity/types";

const gradientText: React.CSSProperties = {
  background: DS.accentGradient,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

const font = (
  size: number,
  weight: 400 | 500 | 600 | 700 | 800,
  lineHeight?: number,
  letterSpacing?: number,
): React.CSSProperties => ({
  fontFamily:
    '"SF Pro Display","SF Pro Text",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
  fontSize: size,
  fontWeight: weight,
  lineHeight: lineHeight !== undefined ? `${lineHeight}px` : "normal",
  letterSpacing: letterSpacing !== undefined ? `${letterSpacing}px` : undefined,
});

function useScrollFade() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, visible };
}

function FadeIn(props: { children: React.ReactNode; delay?: number }) {
  const { children, delay = 0 } = props;
  const { ref, visible } = useScrollFade();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel(props: { children: React.ReactNode }) {
  const { children } = props;
  return (
    <div className="mb-3.5 flex items-center gap-2.5">
      <div
        className="h-[22px] w-[3px] rounded-sm"
        style={{ background: "linear-gradient(180deg, #eb6a00, #ffa807)" }}
      />
      <span
        style={{
          ...font(12, 700, undefined, 1.5),
          color: DS.accentPrimary,
          textTransform: "uppercase",
        }}
      >
        {children}
      </span>
    </div>
  );
}

function getCategoryColor(slug: string, sanityColor?: string | null): string {
  if (sanityColor) {
    return sanityColor;
  }
  const map: Record<string, string> = {
    "artist-trends": "#FFAE42",
    "market-analysis": "#3CB371",
    strategy: "#FF6B6B",
    "platform-guide": "#6BB5FF",
    "product-updates": DS.accentMediumAlt,
  };
  return map[slug] ?? DS.accentPrimary;
}

function buildCategoryOptions(
  fromCms: SanityCategoryDoc[],
  posts: SanityBlogPostList[],
  allLabel: string,
): { title: string; slug: string }[] {
  const base = [{ title: allLabel, slug: "all" }];
  const fromDocs = fromCms
    .filter((c) => c.slug)
    .map((c) => ({ title: c.title ?? c.slug!, slug: c.slug! }));
  if (fromDocs.length > 0) {
    return [...base, ...fromDocs];
  }
  const seen = new Set<string>();
  const fromPosts: { title: string; slug: string }[] = [];
  for (const p of posts) {
    const slug = p.category?.slug;
    const title = p.category?.title;
    if (!slug || seen.has(slug)) {
      continue;
    }
    seen.add(slug);
    fromPosts.push({ slug, title: title ?? slug });
  }
  return [...base, ...fromPosts];
}

function Hero() {
  const t = useTranslations("BlogPage");
  return (
    <section className="relative overflow-hidden px-4 pb-14 pt-30 sm:px-6 md:px-12 md:pb-16 md:pt-32">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-[60%] top-[10%] h-[500px] w-[600px] -translate-x-1/2 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255,174,66,0.07) 0%, transparent 65%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,174,66,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,174,66,0.025) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>
      <div className="relative mx-auto max-w-[1280px]">
        <div
          className="mb-5 inline-flex items-center gap-2 rounded-full border px-[18px] py-1.5"
          style={{
            background: "rgba(255,174,66,0.1)",
            borderColor: "rgba(255,174,66,0.3)",
          }}
        >
          <span className="text-[15px]">{t("hero_emoji")}</span>
          <span style={{ ...font(13, 600), color: DS.accentPrimary, letterSpacing: "0.5px" }}>
            {t("hero_badge")}
          </span>
        </div>
        <h1
          className="mb-4 max-w-[760px] text-[clamp(2rem,5vw,4rem)] font-extrabold leading-tight tracking-tight"
          style={{ color: DS.textPrimary }}
        >
          {t("hero_title_before")}{" "}
          <span style={gradientText}>{t("hero_title_highlight")}</span>
        </h1>
        <p className="m-0 max-w-[520px]" style={{ ...font(18, 400, 28, -0.3), color: DS.textMuted }}>
          {t("hero_subtitle")}
        </p>
      </div>
    </section>
  );
}

function FeaturedPost(props: { post: SanityBlogPostList }) {
  const { post } = props;
  const t = useTranslations("BlogPage");
  const format = useFormatter();
  const slug = post.slug;
  if (!slug) {
    return null;
  }
  const catSlug = post.category?.slug ?? "";
  const catColor = getCategoryColor(catSlug, post.category?.color);
  const publishedLabel = post.publishedAt
    ? format.dateTime(new Date(post.publishedAt), { dateStyle: "medium" })
    : "";

  return (
    <FadeIn>
      <Link
        href={`/blog/${slug}`}
        className="group/grid grid cursor-pointer grid-cols-1 overflow-hidden rounded-[20px] border transition-[border-color,transform] duration-200 hover:-translate-y-0.5 md:grid-cols-2"
        style={{ background: DS.bgDark, borderColor: DS.bgSurface }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,174,66,0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = DS.bgSurface;
        }}
      >
        <div className="relative min-h-[240px] overflow-hidden md:min-h-[360px]">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.coverImageAlt?.trim() || post.title || ""}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="h-full min-h-[240px] w-full md:min-h-[360px]" style={{ background: DS.bgDarkest }} />
          )}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: "linear-gradient(to right, transparent 60%, rgba(28,28,30,0.5))",
            }}
          />
          <div
            className="absolute left-[18px] top-[18px] rounded-full px-3.5 py-1"
            style={{ background: DS.accentGradient, ...font(11, 700), color: DS.neutralDark, letterSpacing: "0.5px" }}
          >
            {t("featured_badge")}
          </div>
        </div>

        <div className="flex flex-col justify-center px-6 py-9 md:px-11 md:py-10">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span
              className="rounded-full border px-3 py-1"
              style={{
                background: `${catColor}18`,
                borderColor: `${catColor}44`,
                ...font(12, 600),
                color: catColor,
              }}
            >
              {post.category?.title ?? ""}
            </span>
            {post.readTime != null ? (
              <span style={{ ...font(12, 400), color: DS.textMuted }}>
                {post.readTime} {t("min_read")}
              </span>
            ) : null}
          </div>

          <h2 className="mb-3.5" style={{ ...font(28, 700, 36, -0.6), color: DS.textPrimary }}>
            {post.title ?? ""}
          </h2>
          <p className="mb-7" style={{ ...font(15, 400, 24, -0.2), color: DS.textMuted }}>
            {post.excerpt ?? ""}
          </p>

          <div className="flex items-center gap-2.5">
            {post.author?.avatar ? (
              <Image
                src={post.author.avatar}
                alt=""
                width={34}
                height={34}
                className="rounded-full object-cover"
              />
            ) : (
              <div
                className="flex h-[34px] w-[34px] items-center justify-center rounded-full"
                style={{ background: "rgba(255,174,66,0.15)", ...font(14, 700), color: DS.accentPrimary }}
              >
                {post.author?.name?.[0] ?? "?"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div style={{ ...font(13, 600), color: DS.textPrimary }}>{post.author?.name ?? ""}</div>
              <div style={{ ...font(12, 400), color: DS.textMuted }}>{publishedLabel}</div>
            </div>
            <span className="shrink-0" style={{ ...font(14, 600), color: DS.accentPrimary }}>
              {t("read_article")}
            </span>
          </div>
        </div>
      </Link>
    </FadeIn>
  );
}

function PostCard(props: { post: SanityBlogPostList; delay?: number }) {
  const { post, delay = 0 } = props;
  const t = useTranslations("BlogPage");
  const format = useFormatter();
  const slug = post.slug;
  if (!slug) {
    return null;
  }
  const catSlug = post.category?.slug ?? "";
  const catColor = getCategoryColor(catSlug, post.category?.color);
  const publishedLabel = post.publishedAt
    ? format.dateTime(new Date(post.publishedAt), { dateStyle: "medium" })
    : "";

  return (
    <FadeIn delay={delay}>
      <Link
        href={`/blog/${slug}`}
        className="group/card flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border transition-[border-color,transform] duration-200 hover:-translate-y-1"
        style={{ background: DS.bgDark, borderColor: DS.bgSurface }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,174,66,0.35)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = DS.bgSurface;
        }}
      >
        <div className="relative h-[200px] w-full shrink-0 overflow-hidden">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.coverImageAlt?.trim() || post.title || ""}
              fill
              className="object-cover transition-transform duration-300 group-hover/card:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="h-full w-full" style={{ background: DS.bgDarkest }} />
          )}
          <div
            className="absolute bottom-3 left-3.5 rounded-full border px-2.5 py-1 backdrop-blur-sm"
            style={{
              background: `${catColor}22`,
              borderColor: `${catColor}55`,
              ...font(11, 600),
              color: catColor,
            }}
          >
            {post.category?.title ?? ""}
          </div>
        </div>

        <div className="flex flex-1 flex-col px-5 pb-6 pt-5">
          <div className="mb-3 flex flex-wrap items-center gap-2.5">
            <span style={{ ...font(12, 400), color: DS.textMuted }}>{publishedLabel}</span>
            <span style={{ color: DS.bgSurface }}>·</span>
            {post.readTime != null ? (
              <span style={{ ...font(12, 400), color: DS.textMuted }}>
                {post.readTime} {t("min_read")}
              </span>
            ) : null}
          </div>

          <h3 className="mb-2.5 flex-1" style={{ ...font(17, 700, 24, -0.35), color: DS.textPrimary }}>
            {post.title ?? ""}
          </h3>
          <p
            className="mb-5 line-clamp-3"
            style={{ ...font(14, 400, 21, -0.15), color: DS.textMuted }}
          >
            {post.excerpt ?? ""}
          </p>

          <div
            className="mt-auto flex items-center justify-between border-t pt-3.5"
            style={{ borderColor: DS.bgSurface }}
          >
            <div className="flex min-w-0 items-center gap-2">
              {post.author?.avatar ? (
                <Image
                  src={post.author.avatar}
                  alt=""
                  width={28}
                  height={28}
                  className="shrink-0 rounded-full object-cover"
                />
              ) : (
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                  style={{ background: "rgba(255,174,66,0.12)", ...font(12, 700), color: DS.accentPrimary }}
                >
                  {post.author?.name?.[0] ?? "?"}
                </div>
              )}
              <span className="truncate" style={{ ...font(12, 600), color: DS.textPrimary }}>
                {post.author?.name ?? ""}
              </span>
            </div>
            <span className="shrink-0" style={{ ...font(12, 600), color: DS.accentPrimary }}>
              {t("read_card_cta")}
            </span>
          </div>
        </div>
      </Link>
    </FadeIn>
  );
}

function NewsletterStrip() {
  const t = useTranslations("BlogPage");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section
      className="border-y px-4 py-16 sm:px-6 md:px-12 md:py-[72px]"
      style={{ background: DS.bgDark, borderColor: DS.bgSurface }}
    >
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <FadeIn>
          <div>
            <SectionLabel>{t("newsletter_section_label")}</SectionLabel>
            <h2 className="mb-3.5 text-[clamp(1.75rem,3.5vw,2.5rem)] font-extrabold leading-tight tracking-tight" style={{ color: DS.textPrimary }}>
              {t("newsletter_title_before")}{" "}
              <span style={gradientText}>{t("newsletter_title_highlight")}</span>
            </h2>
            <p className="m-0" style={{ ...font(16, 400, 25, -0.2), color: DS.textMuted }}>
              {t("newsletter_body")}
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={100}>
          {submitted ? (
            <div
              className="flex items-center gap-3.5 rounded-2xl border px-6 py-7"
              style={{ background: DS.successBg, borderColor: DS.success }}
            >
              <span className="text-[28px]">{t("newsletter_success_emoji")}</span>
              <div>
                <div className="mb-1" style={{ ...font(16, 700), color: DS.textPrimary }}>
                  {t("newsletter_success_title")}
                </div>
                <div style={{ ...font(14, 400), color: DS.textMuted }}>
                  {t("newsletter_success_body", { email })}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("newsletter_placeholder")}
                  className="min-h-[48px] flex-1 rounded-[11px] border px-[18px] outline-none"
                  style={{ background: DS.bgDarkest, borderColor: DS.bgSurface, ...font(15, 400), color: DS.textPrimary }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,174,66,0.5)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = DS.bgSurface;
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (email.includes("@")) {
                      setSubmitted(true);
                    }
                  }}
                  className="min-h-[48px] shrink-0 rounded-[11px] border-none px-6 whitespace-nowrap"
                  style={{ background: DS.accentGradient, ...font(14, 700), color: DS.neutralDark, cursor: "pointer" }}
                >
                  {t("newsletter_submit")}
                </button>
              </div>
              <p className="mt-2.5" style={{ ...font(12, 400), color: "#555" }}>
                {t.rich("newsletter_privacy", {
                  policy: (chunks) => (
                    <Link href="/privacy-policy" className="underline underline-offset-2" style={{ color: DS.accentPrimary }}>
                      {chunks}
                    </Link>
                  ),
                })}
              </p>
            </div>
          )}
        </FadeIn>
      </div>
    </section>
  );
}

export type BlogPageContentProps = {
  featured: SanityBlogPostList | null;
  posts: SanityBlogPostList[];
  categories: SanityCategoryDoc[];
  totalCount: number;
  fetchFailed: boolean;
};

export function BlogPageContent(props: BlogPageContentProps) {
  const { featured, posts, categories, totalCount, fetchFailed } = props;
  const t = useTranslations("BlogPage");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categoryOptions = buildCategoryOptions(categories, posts, t("category_all"));
  const regularPosts = posts.filter((p) => !p.featured);
  const filtered = regularPosts.filter((p) => {
    const matchCat = activeCategory === "all" || p.category?.slug === activeCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchSearch =
      !q ||
      (p.title ?? "").toLowerCase().includes(q) ||
      (p.excerpt ?? "").toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const listingCap = 100;
  const isTruncated = totalCount > listingCap;

  return (
    <div
      className="min-h-screen"
      style={{
        background: DS.bgDarkest,
        color: DS.textPrimary,
        fontFamily:
          '"SF Pro Display","SF Pro Text",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
      }}
    >
      <style>{`
        .blog-search-wrap:focus-within { border-color: rgba(255,174,66,0.45) !important; }
        ::placeholder { color: #555; }
      `}</style>

      <Hero />

      <main className="mx-auto max-w-[1280px] px-4 pb-20 sm:px-6 md:px-12">
        {fetchFailed ? (
          <div
            className="mb-8 rounded-xl border px-4 py-3"
            style={{ background: DS.dangerBg, borderColor: DS.error, ...font(14, 500), color: DS.textPrimary }}
            role="alert"
          >
            {t("load_error")}
          </div>
        ) : null}

        {featured?.slug ? (
          <div className="mb-14 md:mb-16">
            <SectionLabel>{t("section_featured")}</SectionLabel>
            <FeaturedPost post={featured} />
          </div>
        ) : null}

        <div className="mb-9 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setActiveCategory(cat.slug)}
                className="rounded-full border px-[18px] py-2 transition-colors"
                style={{
                  background: activeCategory === cat.slug ? DS.accentGradient : DS.bgDark,
                  borderColor: activeCategory === cat.slug ? "transparent" : DS.bgSurface,
                  ...font(13, 600),
                  color: activeCategory === cat.slug ? DS.neutralDark : DS.textMuted,
                  cursor: "pointer",
                }}
              >
                {cat.title}
              </button>
            ))}
          </div>

          <div
            className="blog-search-wrap flex min-w-[240px] items-center gap-2.5 rounded-[11px] border px-4 py-2.5 transition-[border-color] duration-200 md:max-w-[320px] md:flex-1"
            style={{ background: DS.bgDark, borderColor: DS.bgSurface }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="11" cy="11" r="7" stroke={DS.accentLightGray} strokeWidth="2" />
              <path d="m16.5 16.5 4 4" stroke={DS.accentLightGray} strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("search_placeholder")}
              aria-label={t("search_aria_label")}
              className="min-w-0 flex-1 border-none bg-transparent outline-none"
              style={{ ...font(14, 400), color: DS.textPrimary }}
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="border-none bg-transparent p-0"
                style={{ cursor: "pointer", color: DS.textMuted, ...font(18, 400), lineHeight: 1 }}
                aria-label={t("search_clear_aria")}
              >
                ×
              </button>
            ) : null}
          </div>
        </div>

        {searchQuery.trim() ? (
          <p className="mb-6" style={{ ...font(14, 400), color: DS.textMuted }}>
            {filtered.length === 0
              ? t("results_none", { query: searchQuery })
              : filtered.length === 1
                ? t("results_one", { query: searchQuery })
                : t("results_many", { count: filtered.length, query: searchQuery })}
          </p>
        ) : null}

        {filtered.length === 0 ? (
          <div
            className="rounded-[20px] border px-6 py-16 text-center md:px-10"
            style={{ background: DS.bgDark, borderColor: DS.bgSurface }}
          >
            <div className="mb-4 text-5xl">{t("empty_emoji")}</div>
            <h3 className="mb-2.5" style={{ ...font(22, 700, 28, -0.4), color: DS.textPrimary }}>
              {t("empty_title")}
            </h3>
            <p className="mb-6" style={{ ...font(15, 400, 23), color: DS.textMuted }}>
              {t("empty_body")}
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory("all");
                setSearchQuery("");
              }}
              className="rounded-[10px] border-none px-7 py-3"
              style={{ background: DS.accentGradient, ...font(14, 700), color: DS.neutralDark, cursor: "pointer" }}
            >
              {t("empty_reset")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post, i) => (
              <PostCard key={post._id} post={post} delay={i * 60} />
            ))}
          </div>
        )}

        {isTruncated && !searchQuery.trim() ? (
          <p className="mt-10 text-center" style={{ ...font(13, 400), color: DS.textMuted }}>
            {t("listing_truncated", { shown: listingCap, total: totalCount })}
          </p>
        ) : null}
      </main>

      <NewsletterStrip />
    </div>
  );
}
