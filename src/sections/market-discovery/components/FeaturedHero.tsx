"use client";

import type { Market } from "@/product/sections/market-discovery/types";
import { DS } from "@/product/design-system/colors";
import Image from "next/image";
import { useState } from "react";

const COLORS = {
  yesText: DS.success,
  yesBg: DS.successBg,
  yesHover: DS.successBg,
  noText: DS.error,
  noBg: DS.dangerBg,
  noHover: DS.dangerBg,
} as const;

const OUTCOME_COLORS = [
  DS.accentPrimary,
  DS.accentMedium,
  DS.accentDarker,
  DS.accentGray,
  DS.success,
  DS.accentLightGray,
];

function formatVolume(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${Math.round(v / 1_000)}K`;
  return `$${v}`;
}

function timeUntil(dateStr: string): string {
  const days = Math.floor((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
  if (days > 365) return `${Math.floor(days / 365)}y`;
  if (days > 30) return `${Math.floor(days / 30)}mo`;
  if (days > 0) return `${days}d`;
  return "Expired";
}

function deriveHistory(primary: number[], thisProb: number, primaryProb: number, seed: number): number[] {
  const scale = thisProb / Math.max(primaryProb, 0.01);
  return primary.map((v, i) => {
    const wiggle = Math.sin((i * 7.3) + (seed * 13.7)) * 0.025;
    return Math.max(0.01, Math.min(0.99, v * scale + wiggle));
  });
}

function MultiLineChart(props: { market: Market }) {
  const { market } = props;
  const outcomes = market.outcomes ?? [];
  const width = 320;
  const height = 120;

  if (outcomes.length === 0 || !market.priceHistory?.length) return null;

  const firstOutcome = outcomes[0];
  const primaryProb = firstOutcome ? firstOutcome.probability / 100 : market.yesProbability;

  const histories = outcomes.map((o, i) =>
    i === 0 ? market.priceHistory : deriveHistory(market.priceHistory, o.probability / 100, primaryProb, i),
  );

  const lines = histories.map((hist) => {
    const min = Math.min(...hist);
    const max = Math.max(...hist);
    const range = max - min || 0.01;
    const pts = hist.map((v, i): [number, number] => [
      (i / (hist.length - 1)) * width,
      3 + ((1 - (v - min) / range) * (height - 6)),
    ]);
    return pts
      .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
      .join(" ");
  });

  return (
    <svg width={width} height={height}>
      {[75, 50, 25].map((v) => {
        const y = 3 + ((1 - v / 100) * (height - 6));
        return (
          <line
            key={v}
            x1={0}
            y1={y}
            x2={width}
            y2={y}
            stroke={DS.bgSurface}
            strokeWidth={1}
            strokeDasharray="3,4"
          />
        );
      })}

      {lines.map((line, i) => (
        <path
          key={line}
          d={line}
          fill="none"
          stroke={OUTCOME_COLORS[i] ?? "#60a5fa"}
          strokeWidth={i === 0 ? 2 : 1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={i === 0 ? 1 : 0.6}
        />
      ))}

      {[75, 50, 25].map((v) => (
        <text
          key={v}
          x={width - 2}
          y={3 + ((1 - v / 100) * (height - 6)) - 3}
          fill={DS.textSecondary}
          fontSize={8}
          textAnchor="end"
          fontFamily="monospace"
        >
          {v}%
        </text>
      ))}
    </svg>
  );
}

interface FeaturedHeroProps {
  market: Market;
  onMarketClick: (id: string) => void;
  onYesClick: (id: string, outcomeIndex?: number) => void;
  onNoClick: (id: string, outcomeIndex?: number) => void;
}

export function FeaturedHero(props: FeaturedHeroProps) {
  const { market, onMarketClick, onYesClick, onNoClick } = props;

  const spotlightMarket: Market = {
    id: "hero-nicki-trump-01",
    type: "binary",
    icon: "👑",
    question: "Will Nicki Minaj gain 100K+ Instagram followers within 24 hours of endorsing Trump?",
    category: "Awards",
    artist: "Nicki Minaj",
    yesProbability: 0.6,
    volume: 15010311,
    liquidity: 4200000,
    closingDate: "2026-03-21T00:00:00Z",
    createdAt: "2026-03-20T00:00:00Z",
    priceMovement: 2.4,
    priceHistory: [0.52, 0.55, 0.56, 0.58, 0.59, 0.6, 0.6],
    isTrending: true,
    isNew: true,
  };

  const carouselItems = [spotlightMarket, market] as const;

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const activeMarket = carouselItems[activeIndex] ?? carouselItems[0];
  const [spotlightNewsExpanded, setSpotlightNewsExpanded] = useState<boolean>(false);

  const isSpotlightMarket = activeMarket.id === spotlightMarket.id;

  const spotlightNewsText =
    'News • Nicki Minaj met with Donald Trump after the State of the Union address. She fully endorses president Trump and even went so far to say that she is his "biggest fan". While most of Hollywood and the performing arts in entertainment are heavily liberal, she stands by the president and is not afraid to voice her opinion for Trump. Nicki Minaj is one of the biggest female artists in music and has paved the way for all female rappers in the new music era. Her new album is set to be released in late 2026.';

  const formatVolumeWithCommas = (v: number): string => Intl.NumberFormat("en-US").format(v);

  const goToIndex = (nextIndex: number) => {
    const normalizedIndex =
      ((nextIndex % carouselItems.length) + carouselItems.length) % carouselItems.length;
    const nextMarket = carouselItems[normalizedIndex] ?? carouselItems[0];
    setActiveIndex(normalizedIndex);
    if (nextMarket.id === spotlightMarket.id) setSpotlightNewsExpanded(false);
  };

  const outcomes = activeMarket.outcomes ?? [];
  const isMulti = activeMarket.type === "multi" && outcomes.length > 0;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className="text-[10px] font-semibold tracking-widest uppercase"
          style={{ color: DS.accentGray }}
        >
          Featured market
        </span>
        <div className="flex-1 h-px" style={{ background: DS.bgDarkGray }} />

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous featured market"
            onClick={() => goToIndex((activeIndex - 1 + carouselItems.length) % carouselItems.length)}
            className="w-7 h-7 rounded-lg text-white/90 border border-white/10 transition-opacity hover:opacity-90"
            style={{ background: "rgba(0,0,0,0.08)" }}
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next featured market"
            onClick={() => goToIndex((activeIndex + 1) % carouselItems.length)}
            className="w-7 h-7 rounded-lg text-white/90 border border-white/10 transition-opacity hover:opacity-90"
            style={{ background: "rgba(0,0,0,0.08)" }}
          >
            ›
          </button>
        </div>
      </div>

      <div
        onClick={() => onMarketClick(activeMarket.id)}
        className="rounded-xl overflow-hidden cursor-pointer transition-all duration-200"
        style={{ background: DS.bgDark, border: `1px solid ${DS.bgSurface}` }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = DS.accentGray;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = DS.bgSurface;
        }}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: DS.bgDarkGray }}>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
            style={{ background: "rgba(255,174,66,0.18)", border: `1px solid ${DS.accentDarker}` }}
          >
            {activeMarket.icon}
          </div>
          <div className="flex-1 min-w-0">
            {!isSpotlightMarket && (
              <p
                className="text-[10px] font-medium uppercase tracking-widest mb-0.5"
                style={{ color: DS.accentGray }}
              >
                {activeMarket.category}
              </p>
            )}
            <h2
              className="text-[15px] font-bold text-white leading-snug wrap-break-word"
              style={{ maxWidth: isSpotlightMarket ? 540 : undefined }}
            >
              {activeMarket.question}
            </h2>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row">
          <div className="flex-1 p-4 flex flex-col gap-2.5">
            {isSpotlightMarket ? (
              spotlightNewsExpanded ? (
                <div className="flex flex-col gap-3 w-full max-w-[460px] sm:max-w-[520px] md:max-w-[600px] xl:max-w-[680px]">
                  <div className="grid grid-cols-[1fr_0.9fr_1.4fr] items-end gap-3">
                    <div className="text-[11px] font-semibold" style={{ color: DS.accentGray }}>
                      Market
                    </div>
                    <div className="text-[11px] font-semibold text-right" style={{ color: DS.accentGray }}>
                      Payout
                    </div>
                    <div className="text-[11px] font-semibold text-right" style={{ color: DS.accentGray }}>
                      Odds
                    </div>
                  </div>

                  <div className="grid grid-cols-[1fr_0.9fr_1.4fr] items-center gap-3">
                    <div className="text-[12px] font-medium" style={{ color: DS.textPrimary }}>
                      Yes
                    </div>
                    <div className="text-[12px] font-semibold text-right tabular-nums" style={{ color: DS.textPrimary }}>
                      1.50x
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onYesClick(activeMarket.id);
                      }}
                      className="text-[11px] font-semibold rounded whitespace-nowrap transition-colors w-[118px] text-center justify-self-end"
                      style={{
                        padding: "7px 16px",
                        color: DS.textPrimary,
                        background: "rgba(0,0,0,0.15)",
                        border: `1px solid ${DS.accentDarker}`,
                      }}
                    >
                      Yes {Math.round(activeMarket.yesProbability * 100)}¢
                    </button>
                  </div>

                  <div className="grid grid-cols-[1fr_0.9fr_1.4fr] items-center gap-3">
                    <div className="text-[12px] font-medium" style={{ color: DS.textPrimary }}>
                      No
                    </div>
                    <div className="text-[12px] font-semibold text-right tabular-nums" style={{ color: DS.textPrimary }}>
                      4.12x
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNoClick(activeMarket.id);
                      }}
                      className="text-[11px] font-semibold rounded whitespace-nowrap transition-colors w-[118px] text-center justify-self-end"
                      style={{
                        padding: "7px 16px",
                        color: DS.textPrimary,
                        background: "rgba(0,0,0,0.15)",
                        border: `1px solid ${DS.error}`,
                      }}
                    >
                      No {100 - Math.round(activeMarket.yesProbability * 100)}¢
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] font-semibold tabular-nums" style={{ color: DS.textSecondary }}>
                      Volume ${formatVolumeWithCommas(activeMarket.volume)}
                    </span>
                    <span className="text-[11px] font-semibold tabular-nums" style={{ color: DS.textSecondary }}>
                      2 markets
                    </span>
                  </div>

                  <div className="h-px" style={{ background: `${DS.bgDarkGray}80` }} />

                  <p className="text-[12px] leading-[1.4]" style={{ color: DS.accentGray }}>
                    {spotlightNewsText}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 w-full max-w-[460px] sm:max-w-[520px] md:max-w-[600px] xl:max-w-[680px]">
                  <div className="grid grid-cols-[1fr_0.9fr_1.4fr] items-end gap-3">
                    <div className="text-[11px] font-semibold" style={{ color: DS.accentGray }}>
                      Market
                    </div>
                    <div className="text-[11px] font-semibold text-right" style={{ color: DS.accentGray }}>
                      Payout
                    </div>
                    <div className="text-[11px] font-semibold text-right" style={{ color: DS.accentGray }}>
                      Odds
                    </div>
                  </div>

                  <div className="grid grid-cols-[1fr_0.9fr_1.4fr] items-center gap-3">
                    <div className="text-[12px] font-medium" style={{ color: DS.textPrimary }}>
                      Yes
                    </div>
                    <div className="text-[12px] font-semibold text-right tabular-nums" style={{ color: DS.textPrimary }}>
                      1.50x
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onYesClick(activeMarket.id);
                      }}
                      className="text-[11px] font-semibold rounded whitespace-nowrap transition-colors w-[118px] text-center justify-self-end"
                      style={{
                        padding: "7px 16px",
                        color: DS.textPrimary,
                        background: "rgba(0,0,0,0.15)",
                        border: `1px solid ${DS.accentDarker}`,
                      }}
                    >
                      Yes {Math.round(activeMarket.yesProbability * 100)}¢
                    </button>
                  </div>

                  <div className="grid grid-cols-[1fr_0.9fr_1.4fr] items-center gap-3">
                    <div className="text-[12px] font-medium" style={{ color: DS.textPrimary }}>
                      No
                    </div>
                    <div className="text-[12px] font-semibold text-right tabular-nums" style={{ color: DS.textPrimary }}>
                      4.12x
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNoClick(activeMarket.id);
                      }}
                      className="text-[11px] font-semibold rounded whitespace-nowrap transition-colors w-[118px] text-center justify-self-end"
                      style={{
                        padding: "7px 16px",
                        color: DS.textPrimary,
                        background: "rgba(0,0,0,0.15)",
                        border: `1px solid ${DS.error}`,
                      }}
                    >
                      No {100 - Math.round(activeMarket.yesProbability * 100)}¢
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] font-semibold tabular-nums" style={{ color: DS.textSecondary }}>
                      Volume ${formatVolumeWithCommas(activeMarket.volume)}
                    </span>
                    <span className="text-[11px] font-semibold tabular-nums" style={{ color: DS.textSecondary }}>
                      2 markets
                    </span>
                  </div>

                  <div className="h-px" style={{ background: `${DS.bgDarkGray}80` }} />

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSpotlightNewsExpanded(true);
                    }}
                    className="text-left"
                    style={{ cursor: "pointer" }}
                    aria-label="Expand spotlight news"
                  >
                    <p
                      className="text-[12px] leading-[1.4]"
                      style={{
                        color: DS.accentGray,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {spotlightNewsText}
                    </p>
                    <span className="text-[12px] font-semibold" style={{ color: DS.accentPrimary }}>
                      ...
                    </span>
                  </button>
                </div>
              )
            ) : isMulti ? (
              <>
                {outcomes.map((outcome, i) => (
                  <div key={outcome.label} className="flex items-center gap-2.5">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: OUTCOME_COLORS[i] ?? "#60a5fa" }}
                    />
                    <span className="flex-1 text-[12px] truncate" style={{ color: DS.textSecondary }}>
                      {outcome.label}
                    </span>
                    <span
                      className="text-[15px] font-extrabold tabular-nums min-w-[38px] text-right"
                      style={{ color: "#fff", fontFamily: "JetBrains Mono, monospace" }}
                    >
                      {outcome.probability}%
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onYesClick(activeMarket.id, i);
                      }}
                      className="text-[11px] font-semibold rounded whitespace-nowrap transition-colors"
                      style={{
                        padding: "3px 10px",
                        lineHeight: "20px",
                        color: COLORS.yesText,
                        background: COLORS.yesBg,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = COLORS.yesHover;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = COLORS.yesBg;
                      }}
                    >
                      Yes {outcome.probability}¢
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNoClick(activeMarket.id, i);
                      }}
                      className="text-[11px] font-semibold rounded whitespace-nowrap transition-colors"
                      style={{
                        padding: "3px 10px",
                        lineHeight: "20px",
                        color: COLORS.noText,
                        background: COLORS.noBg,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = COLORS.noHover;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = COLORS.noBg;
                      }}
                    >
                      No {100 - outcome.probability}¢
                    </button>
                  </div>
                ))}

                {outcomes.length > 1 && (
                  <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
                    {outcomes.map((outcome, i) => (
                      <span
                        key={outcome.label}
                        className="flex items-center gap-1 text-[9px]"
                        style={{ color: DS.accentGray }}
                      >
                        <span
                          className="inline-block w-1.5 h-1.5 rounded-full"
                          style={{ background: OUTCOME_COLORS[i] ?? DS.accentPrimary }}
                        />
                        {outcome.label}
                      </span>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-3">
                <span
                  className="text-4xl font-extrabold tabular-nums leading-none"
                  style={{ color: "#fff", fontFamily: "JetBrains Mono, monospace" }}
                >
                  {Math.round(activeMarket.yesProbability * 100)}%
                </span>
                <div className="flex flex-col gap-1.5 flex-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onYesClick(activeMarket.id);
                    }}
                    className="px-3 py-1.5 text-[11px] font-semibold rounded transition-colors"
                    style={{ color: COLORS.yesText, background: COLORS.yesBg }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = COLORS.yesHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = COLORS.yesBg;
                    }}
                  >
                    Yes {Math.round(activeMarket.yesProbability * 100)}¢
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNoClick(activeMarket.id);
                    }}
                    className="px-3 py-1.5 text-[11px] font-semibold rounded transition-colors"
                    style={{ color: COLORS.noText, background: COLORS.noBg }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = COLORS.noHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = COLORS.noBg;
                    }}
                  >
                    No {100 - Math.round(activeMarket.yesProbability * 100)}¢
                  </button>
                </div>
              </div>
            )}

            {!isSpotlightMarket && (
              <div
                className="text-[10px] tabular-nums pt-1"
                style={{ color: DS.accentGray, fontFamily: "JetBrains Mono, monospace" }}
              >
                {formatVolume(activeMarket.volume)} vol · {timeUntil(activeMarket.closingDate)}
              </div>
            )}
          </div>

          <div
            className="hidden sm:flex items-center justify-center sm:w-[360px] shrink-0 px-4 py-3"
            style={{ background: DS.bgDarkest, borderLeft: `1px solid ${DS.bgDarkGray}` }}
          >
            {activeMarket.id === spotlightMarket.id ? (
              <div className="relative w-full h-full min-h-[168px]">
                <Image
                  src="/assets/hero-section/nicki.jpg"
                  alt="Spotlight featured image"
                  fill
                  sizes="(max-width: 640px) 100vw, 360px"
                  style={{ objectFit: "cover", objectPosition: "center" }}
                  priority
                />
              </div>
            ) : (
              isMulti && <MultiLineChart market={activeMarket} />
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 pt-3">
        {carouselItems.map((_, i) => (
          <button
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            type="button"
            aria-label={`Go to featured slide ${i + 1}`}
            onClick={() => goToIndex(i)}
            className="w-2.5 h-2.5 rounded-full transition-opacity"
            style={{
              background: i === activeIndex ? DS.accentPrimary : DS.bgDarkGray,
              opacity: i === activeIndex ? 1 : 0.7,
              border: "none",
              cursor: "pointer",
            }}
          />
        ))}
      </div>
    </div>
  );
}

