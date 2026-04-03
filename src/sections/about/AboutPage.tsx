"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { DS } from "@/product/design-system/colors";
import { Link } from "@/libs/I18nNavigation";

const TEAM_JUSTIN_PHOTO_SRC = "/assets/images/Justin.jpeg";
const TEAM_PRABHJOT_PHOTO_SRC = "/assets/images/Prabhjot.jpg";

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
      { threshold: 0.15 },
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
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
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

function TeamCardWeb(props: {
  name: string;
  role: string;
  tagline: string;
  bio: string;
  achievements: { icon: string; text: string }[];
  tags: string[];
  imgSrc: string;
  imgAlt: string;
  imagePriority?: boolean;
  expanded: boolean;
  readFullBio: string;
  showLess: string;
  onToggle: () => void;
}) {
  const {
    name,
    role,
    tagline,
    bio,
    achievements,
    tags,
    imgSrc,
    imgAlt,
    imagePriority = false,
    expanded,
    readFullBio,
    showLess,
    onToggle,
  } = props;

  return (
    <div
      className="flex flex-col overflow-hidden rounded-[20px] border transition-[border-color] duration-300"
      style={{ background: DS.bgDark, borderColor: DS.bgSurface }}
      onMouseEnter={(event) => {
        event.currentTarget.style.borderColor = "rgba(255,174,66,0.35)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.borderColor = DS.bgSurface;
      }}
    >
      <div className="relative h-[360px] w-full overflow-hidden sm:h-[420px] lg:h-[460px]">
        <Image
          src={imgSrc}
          alt={imgAlt}
          fill
          className="object-cover object-center"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority={imagePriority}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 60%, rgba(255,174,66,0.07) 0%, transparent 70%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[100px] sm:h-[120px]"
          style={{
            background: "linear-gradient(to top, rgba(28,28,30,1) 0%, transparent 100%)",
          }}
        />
        <div
          className="absolute left-[18px] top-[18px] rounded-full border px-3.5 py-1.5"
          style={{
            background: "rgba(255,174,66,0.12)",
            borderColor: "rgba(255,174,66,0.32)",
            ...font(12, 600),
            color: DS.accentPrimary,
          }}
        >
          {role}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-7 pb-7 pt-[26px]">
        <h3 style={{ ...font(24, 700, 30, -0.5), color: DS.textPrimary, margin: "0 0 4px" }}>
          {name}
        </h3>
        <p style={{ ...font(14, 500, 19), color: DS.accentPrimary, margin: "0 0 16px" }}>
          {tagline}
        </p>
        <p
          className="mb-[18px] flex-1"
          style={{ ...font(14, 400, 22, -0.15), color: DS.textMuted, margin: "0 0 18px" }}
        >
          {bio}
        </p>

        <div className="mb-[18px]">
          {achievements.map((a, index) => (
            <div
              key={a.text}
              className={`flex items-center gap-2.5 py-2 ${index < achievements.length - 1 ? "border-b" : ""}`}
              style={{ borderColor: DS.bgSurface }}
            >
              <span className="text-base">{a.icon}</span>
              <span style={{ ...font(13, 500, 18), color: DS.textPrimary }}>{a.text}</span>
            </div>
          ))}
        </div>

        <div className="mb-[18px] flex flex-wrap gap-1.5">
          {tags.map((tag, index) => (
            <span
              key={`${name}-tag-${index}`}
              className="rounded-md px-2.5 py-1"
              style={{
                background: DS.bgSurface,
                ...font(12, 500),
                color: DS.textMuted,
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={onToggle}
          className="w-full cursor-pointer rounded-[10px] border py-2.5 transition-[background,border-color] duration-200"
          style={{
            background: "transparent",
            borderColor: DS.bgSurface,
            ...font(14, 600, 18, -0.1),
            color: DS.accentPrimary,
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.background = "rgba(255,174,66,0.06)";
            event.currentTarget.style.borderColor = "rgba(255,174,66,0.4)";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.background = "transparent";
            event.currentTarget.style.borderColor = DS.bgSurface;
          }}
        >
          {expanded ? showLess : readFullBio}
        </button>
      </div>
    </div>
  );
}

/**
 * Marketing about page: mission, product story, team bios, and primary CTA.
 */
export function AboutPageContent() {
  const t = useTranslations("AboutPage");
  const [expandedBio, setExpandedBio] = useState<"justin" | "prabhjot" | null>(null);

  const justinTags = [
    t("team_justin_tag_1"),
    t("team_justin_tag_2"),
    t("team_justin_tag_3"),
    t("team_justin_tag_4"),
    t("team_justin_tag_5"),
    t("team_justin_tag_6"),
  ];

  const prabhjotTags = [
    t("team_prabhjot_tag_1"),
    t("team_prabhjot_tag_2"),
    t("team_prabhjot_tag_3"),
    t("team_prabhjot_tag_4"),
    t("team_prabhjot_tag_5"),
    t("team_prabhjot_tag_6"),
  ];

  const missionTags = [
    t("mission_tag_1"),
    t("mission_tag_2"),
    t("mission_tag_3"),
    t("mission_tag_4"),
    t("mission_tag_5"),
    t("mission_tag_6"),
  ];

  const justinAchievements = [
    { icon: t("team_justin_achieve_1_icon"), text: t("team_justin_achieve_1_text") },
    { icon: t("team_justin_achieve_2_icon"), text: t("team_justin_achieve_2_text") },
    { icon: t("team_justin_achieve_3_icon"), text: t("team_justin_achieve_3_text") },
  ];

  const prabhjotAchievements = [
    { icon: t("team_prabhjot_achieve_1_icon"), text: t("team_prabhjot_achieve_1_text") },
    { icon: t("team_prabhjot_achieve_2_icon"), text: t("team_prabhjot_achieve_2_text") },
    { icon: t("team_prabhjot_achieve_3_icon"), text: t("team_prabhjot_achieve_3_text") },
  ];

  const steps = [
    {
      num: t("step_1_num"),
      icon: t("step_1_icon"),
      title: t("step_1_title"),
      body: t("step_1_body"),
    },
    {
      num: t("step_2_num"),
      icon: t("step_2_icon"),
      title: t("step_2_title"),
      body: t("step_2_body"),
    },
    {
      num: t("step_3_num"),
      icon: t("step_3_icon"),
      title: t("step_3_title"),
      body: t("step_3_body"),
    },
    {
      num: t("step_4_num"),
      icon: t("step_4_icon"),
      title: t("step_4_title"),
      body: t("step_4_body"),
    },
  ];

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
      <section
        className="relative flex min-h-[calc(100dvh-3.5rem)] items-center justify-center overflow-hidden px-4 pb-16 pt-10 text-center sm:px-6 md:px-12 md:pb-20 md:pt-16 lg:px-12"
      >
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute left-1/2 top-[15%] h-[700px] w-[700px] -translate-x-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,174,66,0.08) 0%, transparent 65%)",
            }}
          />
          <div
            className="absolute left-[20%] top-[30%] h-[400px] w-[400px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(235,106,0,0.05) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute right-[15%] top-[20%] h-[350px] w-[350px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,168,7,0.05) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,174,66,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,174,66,0.03) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative w-full max-w-[860px]">
          <div
            className="mb-7 inline-flex items-center gap-1.5 rounded-full border px-[18px] py-1.5 sm:mb-7"
            style={{
              background: "rgba(255,174,66,0.1)",
              borderColor: "rgba(255,174,66,0.3)",
            }}
          >
            <span className="text-base">{t("hero_emoji")}</span>
            <span style={{ ...font(13, 600, undefined, 0.5), color: DS.accentPrimary }}>
              {t("hero_badge")}
            </span>
          </div>

          <h1
            className="mb-5 leading-[1.05] tracking-tight sm:mb-5"
            style={{
              fontSize: "clamp(2rem, 6vw, 4.5rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: DS.textPrimary,
              fontFamily:
                '"SF Pro Display","SF Pro Text",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
            }}
          >
            <span className="block sm:inline">
              {t("hero_title_before")}{" "}
              <span style={gradientText}>{t("hero_title_highlight")}</span>
            </span>
            <br className="hidden sm:block" />
            <span className="block sm:inline"> {t("hero_title_after")}</span>
          </h1>

          <p
            className="mx-auto mb-10 max-w-[600px] sm:mb-11"
            style={{ ...font(18, 400, 30, -0.3), color: DS.textMuted }}
          >
            {t("hero_subtitle")}
          </p>

          <div className="flex flex-col items-center justify-center gap-3.5 sm:flex-row">
            <Link
              href="/"
              className="inline-block rounded-xl px-9 py-3.5 text-center no-underline sm:px-10"
              style={{
                background: DS.accentGradient,
                ...font(16, 700, 20, -0.2),
                color: DS.neutralDark,
              }}
            >
              {t("hero_cta_primary")}
            </Link>
            <Link
              href="/"
              className="inline-block rounded-xl border px-9 py-3.5 text-center no-underline sm:px-10"
              style={{
                borderColor: DS.bgSurface,
                ...font(16, 600, 20, -0.2),
                color: DS.textPrimary,
              }}
            >
              {t("hero_cta_secondary")}
            </Link>
          </div>

          <div
            className="mt-14 flex flex-wrap justify-center gap-8 border-t pt-10 sm:mt-[72px] sm:gap-10 md:gap-14 lg:gap-16"
            style={{ borderColor: DS.bgSurface }}
          >
            {[
              { value: t("stat_1_value"), label: t("stat_1_label") },
              { value: t("stat_2_value"), label: t("stat_2_label") },
              { value: t("stat_3_value"), label: t("stat_3_label") },
              { value: t("stat_4_value"), label: t("stat_4_label") },
            ].map((s) => (
              <div key={s.label} className="min-w-[120px] text-center">
                <div
                  className="mb-1"
                  style={{
                    ...font(32, 800, 38, -0.8),
                    ...gradientText,
                  }}
                >
                  {s.value}
                </div>
                <div style={{ ...font(12, 400), color: DS.textMuted }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="px-4 py-16 sm:px-6 md:px-12 md:py-[100px] lg:px-12">
        <div className="mx-auto max-w-[1280px]">
          <FadeIn>
            <SectionLabel>{t("section_why_exist")}</SectionLabel>
            <h2
              className="mb-10 max-w-[600px] text-[clamp(1.75rem,4vw,3rem)] font-extrabold leading-tight tracking-tight md:mb-14"
              style={{ ...font(40, 800, 48, -1.2), color: DS.textPrimary }}
            >
              {t("value_heading_before")}{" "}
              <span style={gradientText}>{t("value_heading_highlight")}</span>
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {[
              {
                emoji: t("value_1_emoji"),
                title: t("value_1_title"),
                body: t("value_1_body"),
              },
              {
                emoji: t("value_2_emoji"),
                title: t("value_2_title"),
                body: t("value_2_body"),
              },
              {
                emoji: t("value_3_emoji"),
                title: t("value_3_title"),
                body: t("value_3_body"),
              },
            ].map((card, i) => (
              <FadeIn key={card.title} delay={i * 100}>
                <div
                  className="relative h-full overflow-hidden rounded-[18px] border px-7 pb-9 pt-8 transition-[border-color,transform] duration-300 sm:px-7"
                  style={{
                    background: DS.bgDark,
                    borderColor: DS.bgSurface,
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.borderColor = "rgba(255,174,66,0.4)";
                    event.currentTarget.style.transform = "translateY(-4px)";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.borderColor = DS.bgSurface;
                    event.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div
                    className="absolute left-0 right-0 top-0 h-0.5"
                    style={{ background: DS.accentGradient }}
                  />
                  <div
                    className="mb-5 flex h-[52px] w-[52px] items-center justify-center rounded-[14px] text-[26px]"
                    style={{ background: "rgba(255,174,66,0.1)" }}
                  >
                    {card.emoji}
                  </div>
                  <h3 style={{ ...font(20, 700, 27, -0.4), color: DS.textPrimary, margin: "0 0 12px" }}>
                    {card.title}
                  </h3>
                  <p className="m-0" style={{ ...font(15, 400, 23, -0.2), color: DS.textMuted }}>
                    {card.body}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: DS.bgDark }}>
        <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 md:px-12 md:py-[100px] lg:px-12">
          <div className="mb-12 grid grid-cols-1 items-start gap-10 lg:mb-[72px] lg:grid-cols-2 lg:gap-12">
            <FadeIn>
              <SectionLabel>{t("section_how_it_works")}</SectionLabel>
              <h2
                className="m-0 text-[clamp(1.75rem,4vw,3rem)] font-extrabold leading-tight tracking-tight"
                style={{ ...font(40, 800, 48, -1.2), color: DS.textPrimary }}
              >
                {t("how_heading_before")}{" "}
                <span style={gradientText}>{t("how_heading_highlight")}</span>
              </h2>
            </FadeIn>

            <FadeIn delay={100}>
              <div
                className="relative rounded-2xl border px-7 py-7"
                style={{ background: DS.bgDarkest, borderColor: DS.bgSurface }}
              >
                <div
                  className="mb-3 opacity-40"
                  style={{ ...font(52, 800), color: DS.accentPrimary, lineHeight: 1 }}
                >
                  &ldquo;
                </div>
                <p
                  className="mb-3.5 italic"
                  style={{ ...font(16, 400, 26, -0.25), color: DS.textPrimary, margin: "0 0 14px" }}
                >
                  {t("quote_body")}
                </p>
                <p className="m-0" style={{ ...font(14, 400, 22, -0.15), color: DS.textMuted }}>
                  {t("quote_support")}
                </p>
              </div>
            </FadeIn>
          </div>

          <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0.5">
            <div
              className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-7 z-0 hidden h-0.5 lg:block"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #eb6a00 20%, #ffa807 80%, transparent)",
              }}
            />
            {steps.map((s, i) => (
              <FadeIn key={s.num} delay={i * 80}>
                <div
                  className="relative z-1 mx-1 rounded-2xl border px-6 py-7 sm:mx-0"
                  style={{
                    background: DS.bgDarkGray,
                    borderColor: DS.bgSurface,
                  }}
                >
                  <div
                    className="mb-5 flex h-14 w-14 items-center justify-center rounded-full"
                    style={{
                      background: "linear-gradient(135deg, #eb6a00, #ffa807)",
                      ...font(18, 800),
                      color: DS.neutralDark,
                      boxShadow: "0 0 0 6px rgba(255,174,66,0.1)",
                    }}
                  >
                    {s.num}
                  </div>
                  <div className="mb-2.5 text-2xl">{s.icon}</div>
                  <h4 style={{ ...font(17, 700, 23, -0.35), color: DS.textPrimary, margin: "0 0 8px" }}>
                    {s.title}
                  </h4>
                  <p className="m-0" style={{ ...font(14, 400, 21, -0.15), color: DS.textMuted }}>
                    {s.body}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 md:px-12 md:py-[100px] lg:px-12">
        <FadeIn>
          <SectionLabel>{t("section_team")}</SectionLabel>
          <div className="mb-10 flex flex-col gap-6 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
            <h2
              className="m-0 text-[clamp(1.75rem,4vw,3rem)] font-extrabold leading-tight tracking-tight"
              style={{ ...font(40, 800, 48, -1.2), color: DS.textPrimary }}
            >
              {t("team_heading_prefix")}{" "}
              <span style={gradientText}>{t("team_heading_highlight")}</span>
            </h2>
            <p
              className="m-0 max-w-[380px] lg:text-right"
              style={{ ...font(16, 400, 25, -0.25), color: DS.textMuted }}
            >
              {t("team_subtitle")}
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 gap-7 lg:grid-cols-2 lg:gap-7">
          <FadeIn delay={0}>
            <TeamCardWeb
              name={t("team_justin_name")}
              role={t("team_justin_role")}
              tagline={t("team_justin_tagline")}
              bio={
                expandedBio === "justin" ? t("team_justin_bio_full") : t("team_justin_bio_short")
              }
              achievements={justinAchievements}
              tags={justinTags}
              imgSrc={TEAM_JUSTIN_PHOTO_SRC}
              imgAlt={t("team_justin_photo_alt")}
              imagePriority
              expanded={expandedBio === "justin"}
              readFullBio={t("read_full_bio")}
              showLess={t("show_less")}
              onToggle={() => setExpandedBio(expandedBio === "justin" ? null : "justin")}
            />
          </FadeIn>
          <FadeIn delay={120}>
            <TeamCardWeb
              name={t("team_prabhjot_name")}
              role={t("team_prabhjot_role")}
              tagline={t("team_prabhjot_tagline")}
              bio={
                expandedBio === "prabhjot"
                  ? t("team_prabhjot_bio_full")
                  : t("team_prabhjot_bio_short")
              }
              achievements={prabhjotAchievements}
              tags={prabhjotTags}
              imgSrc={TEAM_PRABHJOT_PHOTO_SRC}
              imgAlt={t("team_prabhjot_photo_alt")}
              expanded={expandedBio === "prabhjot"}
              readFullBio={t("read_full_bio")}
              showLess={t("show_less")}
              onToggle={() => setExpandedBio(expandedBio === "prabhjot" ? null : "prabhjot")}
            />
          </FadeIn>
        </div>
      </section>

      {/* Mission */}
      <section
        className="border-y"
        style={{ background: DS.bgDark, borderColor: DS.bgSurface }}
      >
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-12 px-4 py-16 sm:px-6 md:px-12 md:py-20 lg:grid-cols-2 lg:gap-[72px] lg:px-12">
          <FadeIn>
            <SectionLabel>{t("section_mission")}</SectionLabel>
            <h2
              className="mb-5 text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold leading-tight tracking-tight"
              style={{ ...font(36, 800, 44, -1), color: DS.textPrimary }}
            >
              {t("mission_title_prefix")}{" "}
              <span style={gradientText}>{t("mission_title_highlight")}</span>
            </h2>
            <p className="mb-8" style={{ ...font(16, 400, 26, -0.25), color: DS.textMuted }}>
              {t("mission_body")}
            </p>
            <Link
              href="/"
              className="inline-block rounded-[11px] px-8 py-3.5 text-center no-underline"
              style={{
                background: DS.accentGradient,
                ...font(15, 700, 20, -0.2),
                color: DS.neutralDark,
              }}
            >
              {t("mission_join_button")}
            </Link>
          </FadeIn>

          <FadeIn delay={120}>
            <p
              className="mb-4"
              style={{
                ...font(13, 700),
                color: DS.accentLightGray,
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              {t("mission_passion_label")}
            </p>
            <div className="mb-9 flex flex-wrap gap-2.5">
              {missionTags.map((tag, index) => (
                <span
                  key={`mission-p-${index}`}
                  className="rounded-full border px-[18px] py-2.5"
                  style={{
                    background: "rgba(255,174,66,0.07)",
                    borderColor: "rgba(255,174,66,0.2)",
                    ...font(15, 500),
                    color: DS.accentPrimary,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <div
              className="rounded-[14px] border border-l-[3px] px-5 py-5"
              style={{
                background: DS.bgDarkest,
                borderColor: DS.bgSurface,
                borderLeftColor: DS.accentPrimary,
              }}
            >
              <p
                className="mb-2.5 italic"
                style={{ ...font(15, 500, 23, -0.2), color: DS.textPrimary, margin: "0 0 10px" }}
              >
                {t("mission_quote_text")}
              </p>
              <span style={{ ...font(13, 600), color: DS.accentPrimary }}>
                {t("mission_quote_attribution")}
              </span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA banner */}
      <section className="px-4 py-16 sm:px-6 md:px-12 md:py-[100px] lg:px-12">
        <div className="mx-auto max-w-[1280px]">
          <FadeIn>
            <div
              className="relative flex flex-col gap-10 overflow-hidden rounded-3xl border px-6 py-12 sm:px-10 sm:py-14 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:px-14 lg:py-[70px]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(235,106,0,0.14) 0%, rgba(255,168,7,0.07) 100%)",
                borderColor: "rgba(255,174,66,0.22)",
              }}
            >
              <div
                className="pointer-events-none absolute -right-20 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(255,174,66,0.06) 0%, transparent 70%)",
                }}
              />
              <div className="relative">
                <div className="mb-4 text-[40px]">{t("cta_emoji")}</div>
                <h2
                  className="mb-3.5 text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold leading-tight tracking-tight"
                  style={{ ...font(36, 800, 44, -1), color: DS.textPrimary }}
                >
                  {t("cta_banner_title_before")}{" "}
                  <span style={gradientText}>{t("cta_banner_title_highlight")}</span>
                </h2>
                <p className="m-0 max-w-[500px]" style={{ ...font(17, 400, 26, -0.25), color: DS.textMuted }}>
                  {t("cta_banner_subtitle")}
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
                  {t("cta_banner_primary")}
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
                  {t("cta_banner_secondary")}
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
