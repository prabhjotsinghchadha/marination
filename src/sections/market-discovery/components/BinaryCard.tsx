import type { Market } from "@/product/sections/market-discovery/types";
import { MiniChart } from "./MiniChart";

const COLORS = {
  yesText: "#6ee7b7",
  yesBg: "#0a2e1c",
  yesHover: "#0f3d24",
  noText: "#f4a4a4",
  noBg: "#2d0a0a",
  noHover: "#3d1010",
  cardBg: "#161621",
  cardHover: "#1b1b27",
  border: "#1e1e2a",
  borderHover: "#272736",
} as const;

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
  return "exp";
}

interface BinaryCardProps {
  market: Market;
  onClick: () => void;
  onYes: () => void;
  onNo: () => void;
}

export function BinaryCard(props: BinaryCardProps) {
  const { market, onClick, onYes, onNo } = props;

  const yesPercent = Math.round(market.yesProbability * 100);
  const noPercent = 100 - yesPercent;
  const chartColor = market.yesProbability >= 0.5 ? "#34d399" : "#e07878";

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
        <span className="text-[17px] leading-none shrink-0 mt-0.5 opacity-80">
          {market.icon}
        </span>
        <div className="flex-1 min-w-0 flex gap-2">
          <p className="flex-1 text-[12px] font-medium leading-[1.45] text-gray-300 group-hover:text-gray-100 transition-colors">
            {market.question}
          </p>
          <div className="shrink-0 text-right">
            <div
              className="text-[20px] font-extrabold leading-none tabular-nums"
              style={{ color: "#fff", fontFamily: "JetBrains Mono, monospace" }}
            >
              {yesPercent}%
            </div>
            <div className="text-[9px] mt-0.5 font-medium tracking-wide" style={{ color: "#6b7280" }}>
              chance
            </div>
          </div>
        </div>
      </div>

      <MiniChart data={market.priceHistory} color={chartColor} width={190} height={22} />

      <div className="flex gap-1.5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onYes();
          }}
          className="flex-1 py-[6px] text-[11px] font-semibold rounded-md transition-colors"
          style={{ color: COLORS.yesText, background: COLORS.yesBg }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = COLORS.yesHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = COLORS.yesBg;
          }}
        >
          Yes {yesPercent}¢
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNo();
          }}
          className="flex-1 py-[6px] text-[11px] font-semibold rounded-md transition-colors"
          style={{ color: COLORS.noText, background: COLORS.noBg }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = COLORS.noHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = COLORS.noBg;
          }}
        >
          No {noPercent}¢
        </button>
      </div>

      <div className="flex items-center gap-2 pt-1.5 border-t" style={{ borderColor: "#17172280" }}>
        <span
          className="text-[10px] tabular-nums"
          style={{ color: "#4b5563", fontFamily: "JetBrains Mono, monospace" }}
        >
          {formatVolume(market.volume)} vol
        </span>
        <span className="text-[10px]" style={{ color: "#30303f" }}>
          ·
        </span>
        <span
          className="text-[10px] tabular-nums"
          style={{ color: "#4b5563", fontFamily: "JetBrains Mono, monospace" }}
        >
          {timeUntil(market.closingDate)}
        </span>
      </div>
    </article>
  );
}

