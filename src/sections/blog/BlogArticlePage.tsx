import Image from "next/image";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { getFormatter, getTranslations } from "next-intl/server";
import { DS } from "@/product/design-system/colors";
import { Link } from "@/libs/I18nNavigation";
import type { SanityBlogPostDetail, SanityBlogPostList } from "@/sanity/types";

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

function portableComponents(): PortableTextComponents {
  return {
    block: {
      h2: (props) => (
        <h2
          className="mb-4 mt-10"
          style={{ ...font(26, 700, 34, -0.5), color: DS.textPrimary }}
        >
          {props.children}
        </h2>
      ),
      h3: (props) => (
        <h3
          className="mb-3 mt-8"
          style={{ ...font(20, 700, 28, -0.35), color: DS.textPrimary }}
        >
          {props.children}
        </h3>
      ),
      normal: (props) => (
        <p className="mb-4" style={{ ...font(16, 400, 26, -0.2), color: DS.textMuted }}>
          {props.children}
        </p>
      ),
      blockquote: (props) => (
        <blockquote
          className="my-6 border-l-[3px] py-1 pl-5"
          style={{ borderLeftColor: DS.accentPrimary, color: DS.textMuted }}
        >
          <div style={{ ...font(16, 500, 26, -0.15), color: DS.textPrimary }}>
            {props.children}
          </div>
        </blockquote>
      ),
    },
    list: {
      bullet: (props) => (
        <ul className="mb-4 list-disc pl-6" style={{ ...font(16, 400, 26, -0.2), color: DS.textMuted }}>
          {props.children}
        </ul>
      ),
      number: (props) => (
        <ol className="mb-4 list-decimal pl-6" style={{ ...font(16, 400, 26, -0.2), color: DS.textMuted }}>
          {props.children}
        </ol>
      ),
    },
    listItem: {
      bullet: (props) => <li className="mb-1.5">{props.children}</li>,
      number: (props) => <li className="mb-1.5">{props.children}</li>,
    },
    marks: {
      link: (props) => {
        const href = typeof props.value?.href === "string" ? props.value.href : "#";
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-1 underline-offset-2"
            style={{ color: DS.accentPrimary }}
          >
            {props.children}
          </a>
        );
      },
      strong: (props) => (
        <strong style={{ fontWeight: 700, color: DS.textPrimary }}>{props.children}</strong>
      ),
      em: (props) => <em>{props.children}</em>,
    },
  };
}

function RelatedCard(props: { post: SanityBlogPostList; publishedLabel: string; minReadLabel: string }) {
  const { post, publishedLabel, minReadLabel } = props;
  const slug = post.slug;
  if (!slug) {
    return null;
  }
  return (
    <Link
      href={`/blog/${slug}`}
      className="flex flex-col overflow-hidden rounded-2xl border transition-[border-color,transform] duration-200 hover:-translate-y-1"
      style={{ background: DS.bgDark, borderColor: DS.bgSurface }}
    >
      <div className="relative h-36 w-full shrink-0">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title ?? ""}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="h-full w-full" style={{ background: DS.bgDarkest }} />
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="mb-2" style={{ ...font(12, 400), color: DS.textMuted }}>
          {publishedLabel}
          {post.readTime != null ? ` · ${post.readTime} ${minReadLabel}` : ""}
        </p>
        <p className="line-clamp-2 flex-1" style={{ ...font(15, 700, 22, -0.2), color: DS.textPrimary }}>
          {post.title ?? ""}
        </p>
      </div>
    </Link>
  );
}

export async function BlogArticlePage(props: {
  post: SanityBlogPostDetail;
  related: SanityBlogPostList[];
}) {
  const { post, related } = props;
  const t = await getTranslations("BlogArticlePage");
  const format = await getFormatter();

  const publishedLabel = post.publishedAt
    ? format.dateTime(new Date(post.publishedAt), { dateStyle: "medium" })
    : "";

  const minRead = post.readTime != null ? `${post.readTime} ${t("min_read")}` : "";
  const coverAlt = post.coverImageAlt?.trim() || post.title || t("cover_alt_fallback");

  return (
    <article className="pb-20 pt-8 md:pt-12">
      <div className="mx-auto max-w-[720px] px-4 sm:px-6 md:px-8">
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-1 no-underline transition-colors"
          style={{ ...font(14, 600), color: DS.accentPrimary }}
        >
          ← {t("back_to_blog")}
        </Link>

        {post.coverImage ? (
          <div className="relative mb-10 aspect-video w-full overflow-hidden rounded-2xl border" style={{ borderColor: DS.bgSurface }}>
            <Image
              src={post.coverImage}
              alt={coverAlt}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 720px"
            />
          </div>
        ) : null}

        <header className="mb-10">
          <h1 className="mb-4" style={{ ...font(36, 800, 44, -1), color: DS.textPrimary }}>
            {post.title ?? ""}
          </h1>
          <div className="flex flex-wrap items-center gap-3" style={{ ...font(14, 400), color: DS.textMuted }}>
            {post.author?.name ? <span>{post.author.name}</span> : null}
            {publishedLabel ? <span>{publishedLabel}</span> : null}
            {minRead ? <span>{minRead}</span> : null}
          </div>
        </header>

        <div className="blog-article-body">
          {post.body?.length ? (
            <PortableText value={post.body} components={portableComponents()} />
          ) : (
            <p style={{ ...font(16, 400), color: DS.textMuted }}>{t("empty_body")}</p>
          )}
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mx-auto mt-16 max-w-[1280px] border-t px-4 pt-14 sm:px-6 md:px-12" style={{ borderColor: DS.bgSurface }}>
          <h2 className="mb-8" style={{ ...font(22, 700, 28, -0.4), color: DS.textPrimary }}>
            {t("related_heading")}
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => {
              const label = item.publishedAt
                ? format.dateTime(new Date(item.publishedAt), { dateStyle: "medium" })
                : "";
              return (
                <RelatedCard
                  key={item._id}
                  post={item}
                  publishedLabel={label}
                  minReadLabel={t("min_read_short")}
                />
              );
            })}
          </div>
        </section>
      ) : null}
    </article>
  );
}
