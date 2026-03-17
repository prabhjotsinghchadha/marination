import type { Market } from "@/product/sections/market-discovery/types";
import { DS } from "@/product/design-system/colors";

const COLORS = {
  yesText: DS.success,
  yesBg: DS.successBg,
  yesHover: DS.successBg,
  noText: DS.error,
  noBg: DS.dangerBg,
  noHover: DS.dangerBg,
  cardBg: DS.bgDark,
  cardHover: DS.bgDarkGray,
  border: DS.bgSurface,
  borderHover: DS.accentGray,
} as const;

function formatVolume(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${Math.round(v / 1_000)}K`;
  return `$${v}`;
}

interface MultiCardProps {
  market: Market;
  onClick: () => void;
  onYes: (outcomeIndex: number) => void;
  onNo: (outcomeIndex: number) => void;
}

export function MultiCard(props: MultiCardProps) {
  const { market, onClick, onYes, onNo } = props;
  const outcomes = market.outcomes ?? [];

  return (
    <article
      onClick={onClick}
      className="group flex flex-col gap-2 rounded-xl p-3 cursor-pointer transition-all duration-150"
      style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}` }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = COLORS.cardHover;
        e.currentTarget.style.borderColor = COLORS.borderHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = COLORS.cardBg;
        e.currentTarget.style.borderColor = COLORS.border;
      }}
    >
      <div className="flex gap-2 items-start">
        <span className="text-[17px] leading-none shrink-0 opacity-80">{market.icon}</span>
        <p className="text-[12px] font-medium leading-[1.45] text-gray-300 group-hover:text-gray-100 transition-colors">
          {market.question}
        </p>
      </div>

      <div className="flex flex-col gap-1">
        {outcomes.map((outcome, i) => (
          <div key={outcome.label} className="flex items-center gap-1.5">
            <span className="flex-1 text-[11px] truncate min-w-0" style={{ color: DS.textSecondary }}>
              {outcome.label}
            </span>
            <span
              className="text-[13px] font-bold tabular-nums min-w-[34px] text-right"
              style={{ color: DS.textPrimary, fontFamily: "JetBrains Mono, monospace" }}
            >
              {outcome.probability}%
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onYes(i);
              }}
              className="text-[10px] font-semibold rounded whitespace-nowrap transition-colors"
              style={{ padding: "2px 7px", lineHeight: "18px", color: COLORS.yesText, background: COLORS.yesBg }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = COLORS.yesHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = COLORS.yesBg;
              }}
            >
              Yes
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNo(i);
              }}
              className="text-[10px] font-semibold rounded whitespace-nowrap transition-colors"
              style={{ padding: "2px 7px", lineHeight: "18px", color: COLORS.noText, background: COLORS.noBg }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = COLORS.noHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = COLORS.noBg;
              }}
            >
              No
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center pt-1.5 border-t" style={{ borderColor: `${DS.bgDarkGray}80` }}>
        <span
          className="text-[10px] tabular-nums"
          style={{ color: DS.accentGray, fontFamily: "JetBrains Mono, monospace" }}
        >
          {formatVolume(market.volume)} vol
        </span>
      </div>
    </article>
  );
}

