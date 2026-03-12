/** Round to `d` decimal places */
export const fmt = (n: number, d = 2): string =>
  typeof n === "number" ? n.toFixed(d) : "-";

/** 0.753 → "75.3%" */
export const fmtPct = (n: number): string => `${(n * 100).toFixed(1)}%`;

/** 42.5 → "$42.50" */
export const fmtUSDC = (n: number): string => `$${fmt(n, 2)}`;

/** Cents display: 0.65 → "65.0¢" */
export const fmtCents = (n: number): string => `${(n * 100).toFixed(1)}¢`;

/** Compact large numbers: 1_234_567 → "1.2M" */
export const fmtCompact = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return fmt(n, 0);
};
