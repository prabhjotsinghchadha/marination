import type { Market } from "@/product/sections/market-discovery/types";

const COLORS = {
  yesText: "#6ee7b7",
  yesBg: "#0a2e1c",
  yesHover: "#0f3d24",
  noText: "#f4a4a4",
  noBg: "#2d0a0a",
  noHover: "#3d1010",
} as const;

const OUTCOME_COLORS = ["#60a5fa", "#fbbf24", "#a78bfa", "#f472b6", "#34d399", "#fb923c"];

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
            stroke="#1e1e2e"
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
          fill="#383850"
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

  const outcomes = market.outcomes ?? [];
  const isMulti = market.type === "multi" && outcomes.length > 0;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className="text-[10px] font-semibold tracking-widest uppercase"
          style={{ color: "#4b5563" }}
        >
          Featured market
        </span>
        <div className="flex-1 h-px" style={{ background: "#1a1a28" }} />
      </div>

      <div
        onClick={() => onMarketClick(market.id)}
        className="rounded-xl overflow-hidden cursor-pointer transition-all duration-200"
        style={{ background: "#161621", border: "1px solid #1e1e2a" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#272736";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#1e1e2a";
        }}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "#191924" }}>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
            style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.2)" }}
          >
            {market.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-[10px] font-medium uppercase tracking-widest mb-0.5"
              style={{ color: "#4b5563" }}
            >
              {market.category}
            </p>
            <h2 className="text-[15px] font-bold text-white leading-snug">{market.question}</h2>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row">
          <div className="flex-1 p-4 flex flex-col gap-2.5">
            {isMulti ? (
              <>
                {outcomes.map((outcome, i) => (
                  <div key={outcome.label} className="flex items-center gap-2.5">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: OUTCOME_COLORS[i] ?? "#60a5fa" }}
                    />
                    <span className="flex-1 text-[12px] truncate" style={{ color: "#d1d5db" }}>
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
                        onYesClick(market.id, i);
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
                        onNoClick(market.id, i);
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
                        style={{ color: "#6b7280" }}
                      >
                        <span
                          className="inline-block w-1.5 h-1.5 rounded-full"
                          style={{ background: OUTCOME_COLORS[i] ?? "#60a5fa" }}
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
                  {Math.round(market.yesProbability * 100)}%
                </span>
                <div className="flex flex-col gap-1.5 flex-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onYesClick(market.id);
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
                    Yes {Math.round(market.yesProbability * 100)}¢
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNoClick(market.id);
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
                    No {100 - Math.round(market.yesProbability * 100)}¢
                  </button>
                </div>
              </div>
            )}

            <div
              className="text-[10px] tabular-nums pt-1"
              style={{ color: "#4b5563", fontFamily: "JetBrains Mono, monospace" }}
            >
              {formatVolume(market.volume)} vol · {timeUntil(market.closingDate)}
            </div>
          </div>

          <div
            className="hidden sm:flex items-center justify-center sm:w-[360px] shrink-0 px-4 py-3"
            style={{ background: "#0d0d17", borderLeft: "1px solid #191924" }}
          >
            {isMulti && <MultiLineChart market={market} />}
          </div>
        </div>
      </div>
    </div>
  );
}

