"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { DS } from "@/product/design-system/colors";
import { Link } from "@/libs/I18nNavigation";
import { getFaqCategories, type FaqCategory } from "@/sections/faq/faqCategories";

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

function useScrollFade(threshold = 0.12) {
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
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

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

function highlightParts(text: string, query: string): React.ReactNode[] {
  const q = query.trim();
  if (!q) {
    return [text];
  }
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === q.toLowerCase() ? (
      <mark
        key={i}
        className="rounded px-0.5"
        style={{ background: "rgba(255,174,66,0.3)", color: DS.textPrimary }}
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

function AccordionItem(props: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  searchQuery: string;
}) {
  const { question, answer, isOpen, onToggle, searchQuery } = props;

  return (
    <div
      className="mb-2.5 overflow-hidden rounded-[14px] border transition-[background,border-color] duration-300"
      style={{
        background: isOpen ? DS.bgDark : "transparent",
        borderColor: isOpen ? "rgba(255,174,66,0.25)" : DS.bgSurface,
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center justify-between gap-5 border-none bg-transparent px-6 py-5 text-left"
      >
        <span style={{ ...font(16, 600, 22, -0.3), color: DS.textPrimary }}>
          {highlightParts(question, searchQuery)}
        </span>
        <div
          className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full transition-[background,transform] duration-300"
          style={{
            background: isOpen ? "rgba(255,174,66,0.15)" : DS.bgSurface,
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <ChevronDown size={14} style={{ color: isOpen ? DS.accentPrimary : DS.textMuted }} />
        </div>
      </button>

      {isOpen ? (
        <div className="px-6 pb-6">
          <div className="mb-4 h-px" style={{ background: DS.bgSurface }} />
          <p className="m-0" style={{ ...font(15, 400, 24, -0.2), color: DS.textMuted }}>
            {highlightParts(answer, searchQuery)}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function CategoryBlock(props: {
  category: FaqCategory;
  openItems: Set<string>;
  toggleItem: (key: string) => void;
  searchQuery: string;
  questionsCountLabel: (count: number) => string;
}) {
  const { category, openItems, toggleItem, searchQuery, questionsCountLabel } = props;

  return (
    <FadeIn>
      <div className="mb-14">
        <div className="mb-6 flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl text-[22px]"
            style={{
              background: "rgba(255,174,66,0.1)",
              border: `1px solid rgba(255,174,66,0.2)`,
            }}
          >
            {category.icon}
          </div>
          <div>
            <h2 className="m-0" style={{ ...font(22, 700, 28, -0.4), color: DS.textPrimary }}>
              {category.label}
            </h2>
            <span style={{ ...font(13, 400), color: DS.textMuted }}>
              {questionsCountLabel(category.questions.length)}
            </span>
          </div>
        </div>

        {category.questions.map((item, i) => {
          const key = `${category.id}-${i}`;
          return (
            <AccordionItem
              key={key}
              question={item.q}
              answer={item.a}
              isOpen={openItems.has(key)}
              onToggle={() => toggleItem(key)}
              searchQuery={searchQuery}
            />
          );
        })}
      </div>
    </FadeIn>
  );
}

/**
 * Marketing FAQ: search, category filters, accordions, contact strip, and CTA.
 */
export function FaqPageContent() {
  const t = useTranslations("FaqPage");
  const locale = useLocale();
  const categories = getFaqCategories(locale);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (key: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const filteredCategories = categories
    .filter((cat) => activeCategory === null || cat.id === activeCategory)
    .map((cat) => ({
      ...cat,
      questions: cat.questions.filter((item) => {
        if (!searchQuery.trim()) {
          return true;
        }
        const q = searchQuery.toLowerCase();
        return item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q);
      }),
    }))
    .filter((cat) => cat.questions.length > 0);

  const totalResults = filteredCategories.reduce((acc, c) => acc + c.questions.length, 0);

  const allKeys = filteredCategories.flatMap((cat) =>
    cat.questions.map((_, i) => `${cat.id}-${i}`),
  );
  const anyOpen = allKeys.some((k) => openItems.has(k));

  const questionsCountLabel = (count: number) => t("questions_count", { count });

  return (
    <div
      className="w-full text-[15px]"
      style={{
        color: DS.textPrimary,
        fontFamily:
          '"SF Pro Display","SF Pro Text",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
      }}
    >
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-12 pt-10 text-center sm:px-6 md:px-12 md:pb-16 md:pt-14 lg:px-12">
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute left-1/2 top-[10%] h-[600px] w-[600px] -translate-x-1/2 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(255,174,66,0.08) 0%, transparent 65%)",
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

        <div className="relative mx-auto max-w-[740px]">
          <div
            className="mb-7 inline-flex items-center gap-1.5 rounded-full border px-[18px] py-1.5"
            style={{
              background: "rgba(255,174,66,0.1)",
              borderColor: "rgba(255,174,66,0.3)",
            }}
          >
            <span className="text-base">{t("hero_emoji")}</span>
            <span style={{ ...font(13, 600, undefined, 0.5), color: DS.accentPrimary }}>
              {t("hero_pill")}
            </span>
          </div>

          <h1
            className="mb-4 text-[clamp(2rem,5vw,4rem)] font-extrabold leading-[1.05] tracking-tight"
            style={{ color: DS.textPrimary }}
          >
            {t("hero_title_before")}{" "}
            <span style={gradientText}>{t("hero_title_highlight")}</span>
          </h1>

          <p
            className="mx-auto mb-10 max-w-[520px] sm:mb-11"
            style={{ ...font(18, 400, 28, -0.3), color: DS.textMuted }}
          >
            {t("hero_subtitle")}
          </p>

          <div
            className="mx-auto flex max-w-[560px] items-center gap-3 rounded-[14px] border px-5 py-3.5 transition-[border-color] duration-200"
            style={{ background: DS.bgDark, borderColor: DS.bgSurface }}
            onFocus={(event) => {
              event.currentTarget.style.borderColor = "rgba(255,174,66,0.5)";
            }}
            onBlur={(event) => {
              event.currentTarget.style.borderColor = DS.bgSurface;
            }}
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="11" cy="11" r="7" stroke={DS.accentLightGray} strokeWidth="2" />
              <path
                d="m16.5 16.5 4 4"
                stroke={DS.accentLightGray}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t("search_placeholder")}
              className="min-w-0 flex-1 border-none bg-transparent outline-none"
              style={{ ...font(15, 400), color: DS.textPrimary }}
              type="search"
              aria-label={t("search_aria_label")}
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="cursor-pointer border-none bg-transparent p-0 leading-none"
                style={{ ...font(20, 400), color: DS.textMuted }}
                aria-label={t("clear_search_aria")}
              >
                ×
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {/* Category pills */}
      <div className="mx-auto flex max-w-[1280px] flex-wrap justify-center gap-2.5 px-4 pb-10 sm:px-6 md:px-12 lg:px-12">
        <button
          type="button"
          onClick={() => setActiveCategory(null)}
          className="cursor-pointer rounded-full border-none px-5 py-2.5 transition-all duration-200"
          style={{
            background: activeCategory === null ? DS.accentGradient : DS.bgDark,
            border: activeCategory === null ? "none" : `1px solid ${DS.bgSurface}`,
            ...font(13, 600),
            color: activeCategory === null ? DS.neutralDark : DS.textMuted,
          }}
        >
          {t("filter_all_topics")}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border px-5 py-2.5 transition-all duration-200"
            style={{
              background: activeCategory === cat.id ? "rgba(255,174,66,0.12)" : DS.bgDark,
              border:
                activeCategory === cat.id
                  ? "1px solid rgba(255,174,66,0.4)"
                  : `1px solid ${DS.bgSurface}`,
              ...font(13, 600),
              color: activeCategory === cat.id ? DS.accentPrimary : DS.textMuted,
            }}
          >
            <span>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main */}
      <section className="mx-auto max-w-[1280px] px-4 pb-16 sm:px-6 md:px-12 lg:px-12">
        {searchQuery.trim() ? (
          <div className="mb-8">
            <p style={{ ...font(14, 400), color: DS.textMuted }}>
              {totalResults === 0
                ? t("results_none", { query: searchQuery })
                : t("results_count", { count: totalResults, query: searchQuery })}
            </p>
          </div>
        ) : null}

        {totalResults === 0 ? (
          <FadeIn>
            <div
              className="rounded-[20px] border px-10 py-16 text-center"
              style={{ background: DS.bgDark, borderColor: DS.bgSurface }}
            >
              <div className="mb-4 text-5xl">🔍</div>
              <h3 className="mb-2.5" style={{ ...font(22, 700, 28, -0.4), color: DS.textPrimary }}>
                {t("empty_title")}
              </h3>
              <p className="mb-6" style={{ ...font(15, 400, 23), color: DS.textMuted }}>
                {t("empty_body")}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory(null);
                }}
                className="cursor-pointer rounded-[10px] border-none px-7 py-3"
                style={{
                  background: DS.accentGradient,
                  ...font(14, 700),
                  color: DS.neutralDark,
                }}
              >
                {t("clear_filters")}
              </button>
            </div>
          </FadeIn>
        ) : (
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,220px)_1fr] lg:gap-12">
            <div className="lg:sticky lg:top-20">
              <p
                className="mb-3.5"
                style={{
                  ...font(12, 700),
                  color: DS.accentLightGray,
                  letterSpacing: "1.2px",
                  textTransform: "uppercase",
                }}
              >
                {t("jump_to")}
              </p>
              {filteredCategories.map((cat) => (
                <a
                  key={cat.id}
                  href={`#${cat.id}`}
                  className="mb-1 flex items-center gap-2 rounded-lg px-3 py-2 no-underline transition-[background,color] duration-150"
                  style={{ ...font(14, 500), color: DS.textMuted }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.background = "rgba(255,174,66,0.08)";
                    event.currentTarget.style.color = DS.accentPrimary;
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.background = "transparent";
                    event.currentTarget.style.color = DS.textMuted;
                  }}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span className="ml-auto" style={{ ...font(12, 400), color: "#555555" }}>
                    {cat.questions.length}
                  </span>
                </a>
              ))}

              <div className="my-4 h-px" style={{ background: DS.bgSurface }} />

              <button
                type="button"
                onClick={() => {
                  if (anyOpen) {
                    setOpenItems(new Set());
                  } else {
                    setOpenItems(new Set(allKeys));
                  }
                }}
                className="w-full cursor-pointer rounded-lg border bg-transparent px-3 py-2.5 text-left transition-[border-color,color] duration-200"
                style={{
                  borderColor: DS.bgSurface,
                  ...font(13, 600),
                  color: DS.textMuted,
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.borderColor = "rgba(255,174,66,0.4)";
                  event.currentTarget.style.color = DS.accentPrimary;
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.borderColor = DS.bgSurface;
                  event.currentTarget.style.color = DS.textMuted;
                }}
              >
                {anyOpen ? t("collapse_all") : t("expand_all")}
              </button>
            </div>

            <div>
              {filteredCategories.map((cat) => (
                <div key={cat.id} id={cat.id}>
                  <CategoryBlock
                    category={cat}
                    openItems={openItems}
                    toggleItem={toggleItem}
                    searchQuery={searchQuery}
                    questionsCountLabel={questionsCountLabel}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Contact strip */}
      <section
        className="border-t px-4 py-16 sm:px-6 md:px-12 md:py-20 lg:px-12"
        style={{ background: DS.bgDark, borderColor: DS.bgSurface }}
      >
        <div className="mx-auto max-w-[1280px]">
          <FadeIn>
            <div className="mb-12 text-center">
              <SectionLabel>{t("contact_label")}</SectionLabel>
              <h2
                className="mb-3.5 text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold leading-tight tracking-tight"
                style={{ ...font(36, 800, 44, -1), color: DS.textPrimary }}
              >
                {t("contact_title_before")}{" "}
                <span style={gradientText}>{t("contact_title_highlight")}</span>
              </h2>
              <p
                className="mx-auto max-w-[480px]"
                style={{ ...font(16, 400, 25, -0.2), color: DS.textMuted }}
              >
                {t("contact_subtitle")}
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              {
                key: "email",
                icon: t("contact_1_icon"),
                title: t("contact_1_title"),
                sub: t("contact_1_sub"),
                note: t("contact_1_note"),
                cta: t("contact_1_cta"),
                href: "mailto:support@marinationmusic.com",
                external: true,
              },
              {
                key: "help",
                icon: t("contact_2_icon"),
                title: t("contact_2_title"),
                sub: t("contact_2_sub"),
                note: t("contact_2_note"),
                cta: t("contact_2_cta"),
                href: "/help-center",
                external: false,
              },
              {
                key: "social",
                icon: t("contact_3_icon"),
                title: t("contact_3_title"),
                sub: t("contact_3_sub"),
                note: t("contact_3_note"),
                cta: t("contact_3_cta"),
                href: "https://twitter.com",
                external: true,
              },
            ].map((ch, i) => (
              <FadeIn key={ch.key} delay={i * 90}>
                <div
                  className="flex h-full flex-col rounded-[18px] border px-6 pb-7 pt-8 transition-[border-color,transform] duration-300"
                  style={{ background: DS.bgDarkest, borderColor: DS.bgSurface }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.borderColor = "rgba(255,174,66,0.35)";
                    event.currentTarget.style.transform = "translateY(-4px)";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.borderColor = DS.bgSurface;
                    event.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div className="mb-4 text-[34px]">{ch.icon}</div>
                  <h3 style={{ ...font(18, 700, 24, -0.3), color: DS.textPrimary, margin: "0 0 6px" }}>
                    {ch.title}
                  </h3>
                  <p style={{ ...font(14, 500, 20), color: DS.accentPrimary, margin: "0 0 4px" }}>
                    {ch.sub}
                  </p>
                  <p style={{ ...font(13, 400, 18), color: DS.textMuted, margin: "0 0 22px" }}>
                    {ch.note}
                  </p>
                  {ch.external ? (
                    <a
                      href={ch.href}
                      className="mt-auto block rounded-[10px] border py-2.5 text-center no-underline transition-[background] duration-200"
                      style={{
                        borderColor: "rgba(255,174,66,0.35)",
                        ...font(14, 600),
                        color: DS.accentPrimary,
                      }}
                      {...(ch.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      {ch.cta} →
                    </a>
                  ) : (
                    <Link
                      href={ch.href}
                      className="mt-auto block rounded-[10px] border py-2.5 text-center no-underline transition-[background] duration-200"
                      style={{
                        borderColor: "rgba(255,174,66,0.35)",
                        ...font(14, 600),
                        color: DS.accentPrimary,
                      }}
                    >
                      {ch.cta} →
                    </Link>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 sm:px-6 md:px-12 md:py-20 lg:px-12">
        <div className="mx-auto max-w-[1280px]">
          <FadeIn>
            <div
              className="relative flex flex-col gap-10 overflow-hidden rounded-3xl border px-6 py-12 sm:px-10 sm:py-14 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:px-14 lg:py-16"
              style={{
                background:
                  "linear-gradient(135deg, rgba(235,106,0,0.14), rgba(255,168,7,0.07))",
                borderColor: "rgba(255,174,66,0.22)",
              }}
            >
              <div
                className="pointer-events-none absolute -right-16 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(255,174,66,0.06) 0%, transparent 70%)",
                }}
              />
              <div className="relative">
                <div className="mb-4 text-[38px]">{t("cta_emoji")}</div>
                <h2
                  className="mb-3 text-[clamp(1.75rem,3.5vw,2.5rem)] font-extrabold leading-tight tracking-tight"
                  style={{ ...font(32, 800, 40, -1), color: DS.textPrimary }}
                >
                  {t("cta_title_before")}{" "}
                  <span style={gradientText}>{t("cta_title_highlight")}</span>
                </h2>
                <p className="m-0 max-w-[440px]" style={{ ...font(16, 400, 25, -0.2), color: DS.textMuted }}>
                  {t("cta_body")}
                </p>
              </div>
              <div className="relative flex shrink-0 flex-col gap-3">
                <Link
                  href="/"
                  className="whitespace-nowrap rounded-xl px-10 py-3.5 text-center no-underline"
                  style={{
                    background: DS.accentGradient,
                    ...font(16, 700, 20, -0.2),
                    color: DS.neutralDark,
                  }}
                >
                  {t("cta_primary")}
                </Link>
                <Link
                  href="/"
                  className="whitespace-nowrap rounded-xl border px-10 py-3.5 text-center no-underline"
                  style={{
                    borderColor: DS.bgSurface,
                    ...font(15, 600, 20, -0.2),
                    color: DS.textPrimary,
                  }}
                >
                  {t("cta_secondary")}
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
