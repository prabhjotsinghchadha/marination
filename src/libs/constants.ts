/** Simulated traders available in the testbed */
export const USERS = ["Alice", "Bob", "Carol", "Dave", "Eve"] as const;
export type UserName = (typeof USERS)[number];

/** Default market creation values */
export const DEFAULT_MARKET_CONFIG = {
  name: "Will ETH exceed $5000 by EOY 2025?",
  liquidity: "1000",
  fee: "2",
} as const;

/** Max slippage allowed before a trade is rejected (15 percentage points) */
export const MAX_SLIPPAGE = 0.15;

/** Colour tokens — mirrors Tailwind config for use in JS (e.g. recharts) */
export const COLORS = {
  yes: "#00e5a0",
  no: "#ff4b6e",
  accent: "#3b82f6",
  gold: "#f5a623",
  textDim: "#5a6a7a",
  surface: "#0e1520",
} as const;
