// ─── TYPES ────────────────────────────────────────────────────────────────────

export type Side = "YES" | "NO";

export interface Position {
  YES: number;
  NO: number;
  spent: number;
  received: number;
}

type AtomicPosition = {
  YES: bigint;
  NO: bigint;
  spent: bigint;
  received: bigint;
};

export type MarketAtomicState = {
  yesPool: bigint;
  noPool: bigint;
  k: bigint;
  feeBps: bigint; // fee in basis points (1bp = 0.01%)
  feePool: bigint;
  volume: bigint;
  positions: Record<string, AtomicPosition>;

  lpShares: bigint;
  lpPositions: Record<string, bigint>;
  lpCostBasis: Record<string, bigint>;
  minLiquidity: bigint;

  resolved: boolean;
  outcome: Side | null;
  clock: bigint;
};

export interface Trade {
  user: string;
  side: Side;
  amount?: number;
  shares?: number;
  tokensOut?: number;
  netOut?: number;
  yesPrice: number;
  yesPool: number;
  noPool: number;
  type: "buy" | "sell";
  timestamp: number;
}

export interface Market {
  yesPool: number;
  noPool: number;
  k: number;
  fee: number;
  feePool: number;
  volume: number;
  trades: Trade[];
  failedTrades: number;
  positions: Record<string, Position>;
  lpShares: number;
  lpPositions: Record<string, number>;
  lpCostBasis: Record<string, number>;
  MIN_LIQUIDITY: number;
  resolved: boolean;
  outcome: Side | null;
  clock: number;

  /**
   * Internal atomic state backing the bigint math engine.
   * UI fields above remain `number` for rendering.
   */
  _atomic?: MarketAtomicState;
}

export interface Price {
  yes: number;
  no: number;
}

export interface BuyQuote {
  tokensOut: number;
  priceBefore: number;
  priceAfter: number;
  priceImpactAbsolute: number;
  priceImpactRelative: number;
  feeAmount: number;
  spread: number;
}

export interface SellQuoteResult {
  grossOut: number;
  feeAmount: number;
  netOut: number;
  priceBefore: number;
  priceAfter: number;
  priceImpactAbsolute: number;
  priceImpactRelative: number;
}

export interface LiquidityRemoval {
  yesTokens: number;
  noTokens: number;
  fees: number;
}

export interface PnLEntry {
  user: string;
  YES: number;
  NO: number;
  spent: number;
  received: number;
  markValue: number;
  netInvested: number;
  unrealizedPnL: number;
}

export interface MarketConfig {
  initialLiquidity?: number;
  fee?: number;
}

const PRICE_SCALE = BigInt("1000000000000000000"); // 1e18 fixed-point probability
const BPS_DENOM = BigInt(10_000);

function absBigInt(n: bigint): bigint {
  return n < BigInt(0) ? -n : n;
}

function mulDivFloor(a: bigint, b: bigint, denom: bigint): bigint {
  return (a * b) / denom;
}

function toUSDCAtomic(amount: number): bigint {
  // UI uses `number`; we convert to integer atomic units with rounding.
  return BigInt(Math.round(amount * 1_000_000));
}

function fromUSDCAtomic(amountAtomic: bigint): number {
  return Number(amountAtomic) / 1_000_000;
}

function feeToBps(fee: number): bigint {
  const feeBps = Math.round(fee * 10_000);
  if (feeBps < 0 || feeBps >= 10_000) throw new Error("fee must be in [0, 1)");
  return BigInt(feeBps);
}

function toPriceScaledFromPools(yesPool: bigint, noPool: bigint): { yes: bigint; no: bigint } {
  const total = yesPool + noPool;
  if (total <= BigInt(0)) return { yes: BigInt(0), no: BigInt(0) };

  // yes = noPool / (yesPool + noPool)
  const yesScaled = mulDivFloor(noPool, PRICE_SCALE, total);
  const noScaled = mulDivFloor(yesPool, PRICE_SCALE, total);
  return { yes: yesScaled, no: noScaled };
}

function ensureAtomic(market: Market): MarketAtomicState {
  if (market._atomic) return market._atomic;

  const feeBps = feeToBps(market.fee);

  const positionsAtomic: Record<string, AtomicPosition> = {};
  for (const [user, pos] of Object.entries(market.positions)) {
    positionsAtomic[user] = {
      YES: toUSDCAtomic(pos.YES),
      NO: toUSDCAtomic(pos.NO),
      spent: toUSDCAtomic(pos.spent),
      received: toUSDCAtomic(pos.received),
    };
  }

  market._atomic = {
    yesPool: toUSDCAtomic(market.yesPool),
    noPool: toUSDCAtomic(market.noPool),
    k: toUSDCAtomic(market.yesPool) * toUSDCAtomic(market.noPool),
    feeBps,
    feePool: toUSDCAtomic(market.feePool),
    volume: toUSDCAtomic(market.volume),
    positions: positionsAtomic,

    lpShares: toUSDCAtomic(market.lpShares),
    lpPositions: Object.fromEntries(
      Object.entries(market.lpPositions).map(([user, v]) => [user, toUSDCAtomic(v)]),
    ),
    lpCostBasis: Object.fromEntries(
      Object.entries(market.lpCostBasis).map(([user, v]) => [user, toUSDCAtomic(v)]),
    ),
    minLiquidity: toUSDCAtomic(market.MIN_LIQUIDITY),

    resolved: market.resolved,
    outcome: market.outcome,
    clock: BigInt(market.clock),
  };

  return market._atomic;
}

function syncMarketFromAtomic(market: Market, st: MarketAtomicState): void {
  market.yesPool = fromUSDCAtomic(st.yesPool);
  market.noPool = fromUSDCAtomic(st.noPool);

  // UI-only approximation; calculations use bigint `st.k`.
  const kApprox = Number(st.k) / 1_000_000 / 1_000_000;
  market.k = kApprox;

  market.feePool = fromUSDCAtomic(st.feePool);
  market.volume = fromUSDCAtomic(st.volume);

  market.lpShares = fromUSDCAtomic(st.lpShares);
  market.MIN_LIQUIDITY = fromUSDCAtomic(st.minLiquidity);

  market.resolved = st.resolved;
  market.outcome = st.outcome;
  market.clock = Number(st.clock);

  market.positions = { ...market.positions };
  for (const [user, posA] of Object.entries(st.positions)) {
    market.positions[user] = {
      YES: fromUSDCAtomic(posA.YES),
      NO: fromUSDCAtomic(posA.NO),
      spent: fromUSDCAtomic(posA.spent),
      received: fromUSDCAtomic(posA.received),
    };
  }

  market.lpPositions = { ...market.lpPositions };
  market.lpCostBasis = { ...market.lpCostBasis };
  for (const [user, sharesA] of Object.entries(st.lpPositions)) {
    market.lpPositions[user] = fromUSDCAtomic(sharesA);
  }
  for (const [user, costA] of Object.entries(st.lpCostBasis)) {
    market.lpCostBasis[user] = fromUSDCAtomic(costA);
  }
}

// ─── ENGINE ───────────────────────────────────────────────────────────────────

/**
 * Create a new CPMM market.
 */
export function createMarket({ initialLiquidity = 1000, fee = 0.02 }: MarketConfig = {}): Market {
  if (initialLiquidity <= 0) throw new Error("initialLiquidity must be positive");
  if (fee < 0 || fee >= 1) throw new Error("fee must be in [0, 1)");

  const feeBps = feeToBps(fee);
  const initialAtomic = toUSDCAtomic(initialLiquidity);
  const minLiquidityAtomic = initialAtomic / BigInt(1000);
  const minLiquidityAtomicNonZero =
    minLiquidityAtomic > BigInt(0) ? minLiquidityAtomic : BigInt(1);
  const MIN_LIQUIDITY = fromUSDCAtomic(minLiquidityAtomicNonZero);

  const initial = fromUSDCAtomic(initialAtomic);

  return {
    yesPool: initial,
    noPool: initial,
    k: initial * initial,
    fee,
    feePool: 0,
    volume: 0,
    trades: [],
    failedTrades: 0,
    positions: {},
    lpShares: initial,
    lpPositions: {},
    lpCostBasis: {},
    MIN_LIQUIDITY,
    resolved: false,
    outcome: null,
    clock: 0,

    _atomic: {
      yesPool: initialAtomic,
      noPool: initialAtomic,
      k: initialAtomic * initialAtomic,
      feeBps,
      feePool: BigInt(0),
      volume: BigInt(0),
      positions: {},
      lpShares: initialAtomic,
      lpPositions: {},
      lpCostBasis: {},
      minLiquidity: minLiquidityAtomicNonZero,
      resolved: false,
      outcome: null,
      clock: BigInt(0),
    },
  };
}

// ─── PRICING ─────────────────────────────────────────────────────────────────

/**
 * Spot prices for YES and NO tokens (sum to 1).
 * P_yes = noPool / (yesPool + noPool)
 */
export function getPrice(m: Market): Price {
  const st = ensureAtomic(m);
  const priceScaled = toPriceScaledFromPools(st.yesPool, st.noPool);
  return {
    yes: Number(priceScaled.yes) / 1_000_000_000_000_000_000,
    no: Number(priceScaled.no) / 1_000_000_000_000_000_000,
  };
}

/**
 * Quote a buy: tokens out, price impact, fee.
 * Uses constant-product formula: k = x * y.
 */
export function getQuote(market: Market, side: Side, amount: number): BuyQuote {
  const st = ensureAtomic(market);
  const amountAtomic = toUSDCAtomic(amount);
  const feeAmountAtomic = mulDivFloor(amountAtomic, st.feeBps, BPS_DENOM);
  const tradeAmountAtomic = amountAtomic - feeAmountAtomic;

  const { yesPool, noPool, k } = st;

  let tokensOutAtomic: bigint;
  let newYesPool: bigint;
  let newNoPool: bigint;

  if (side === "YES") {
    newNoPool = noPool + tradeAmountAtomic;
    newYesPool = k / newNoPool;
    tokensOutAtomic = yesPool - newYesPool;
  } else {
    newYesPool = yesPool + tradeAmountAtomic;
    newNoPool = k / newYesPool;
    tokensOutAtomic = noPool - newNoPool;
  }

  const priceBeforeScaled = toPriceScaledFromPools(yesPool, noPool);
  const priceAfterScaled = toPriceScaledFromPools(newYesPool, newNoPool);

  const priceBeforeScaledChosen = side === "YES" ? priceBeforeScaled.yes : priceBeforeScaled.no;
  const priceAfterScaledChosen = side === "YES" ? priceAfterScaled.yes : priceAfterScaled.no;

  const priceImpactScaled = absBigInt(priceAfterScaledChosen - priceBeforeScaledChosen);
  const priceBefore = Number(priceBeforeScaledChosen) / 1_000_000_000_000_000_000;
  const priceAfter = Number(priceAfterScaledChosen) / 1_000_000_000_000_000_000;
  const priceImpactAbsolute = Number(priceImpactScaled) / 1_000_000_000_000_000_000;

  const tokensOut = fromUSDCAtomic(tokensOutAtomic);
  const feeAmount = fromUSDCAtomic(feeAmountAtomic);

  return {
    tokensOut,
    priceBefore,
    priceAfter,
    priceImpactAbsolute,
    priceImpactRelative: priceBefore > 0 ? priceImpactAbsolute / priceBefore : 0,
    feeAmount,
    spread: tokensOut > 0 ? feeAmount / tokensOut : 0,
  };
}

/**
 * Quote a sell: how much USDC back, fee deducted from gross.
 */
export function sellQuote(market: Market, side: Side, shares: number): SellQuoteResult {
  const st = ensureAtomic(market);
  const sharesAtomic = toUSDCAtomic(shares);

  const { yesPool, noPool, k } = st;

  let grossOutAtomic: bigint;
  let newYesPool: bigint;
  let newNoPool: bigint;

  if (side === "YES") {
    newYesPool = yesPool + sharesAtomic;
    newNoPool = k / newYesPool;
    grossOutAtomic = noPool - newNoPool;
  } else {
    newNoPool = noPool + sharesAtomic;
    newYesPool = k / newNoPool;
    grossOutAtomic = yesPool - newYesPool;
  }

  const feeAmountAtomic = mulDivFloor(grossOutAtomic, st.feeBps, BPS_DENOM);
  const netOutAtomic = grossOutAtomic - feeAmountAtomic;

  const priceBeforeScaled = toPriceScaledFromPools(yesPool, noPool);
  const priceAfterScaled = toPriceScaledFromPools(newYesPool, newNoPool);

  const priceBeforeScaledChosen = side === "YES" ? priceBeforeScaled.yes : priceBeforeScaled.no;
  const priceAfterScaledChosen = side === "YES" ? priceAfterScaled.yes : priceAfterScaled.no;

  const priceImpactScaled = absBigInt(priceAfterScaledChosen - priceBeforeScaledChosen);
  const priceBefore = Number(priceBeforeScaledChosen) / 1_000_000_000_000_000_000;
  const priceAfter = Number(priceAfterScaledChosen) / 1_000_000_000_000_000_000;
  const priceImpactAbsolute = Number(priceImpactScaled) / 1_000_000_000_000_000_000;

  return {
    grossOut: fromUSDCAtomic(grossOutAtomic),
    feeAmount: fromUSDCAtomic(feeAmountAtomic),
    netOut: fromUSDCAtomic(netOutAtomic),
    priceBefore,
    priceAfter,
    priceImpactAbsolute,
    priceImpactRelative: priceBefore > 0 ? priceImpactAbsolute / priceBefore : 0,
  };
}

// ─── TRADING ─────────────────────────────────────────────────────────────────

function upsertAtomicPosition(st: MarketAtomicState, user: string): AtomicPosition {
  if (!st.positions[user]) {
    st.positions[user] = { YES: BigInt(0), NO: BigInt(0), spent: BigInt(0), received: BigInt(0) };
  }
  return st.positions[user];
}

/**
 * Buy YES or NO tokens. Mutates market in place.
 * @returns tokensOut
 */
export function buy(
  market: Market,
  user: string,
  side: Side,
  amount: number,
  maxSlippage = 0.15
): number {
  if (market.resolved) throw new Error("Market is resolved");
  if (amount <= 0) throw new Error("Amount must be positive");

  const st = ensureAtomic(market);
  const amountAtomic = toUSDCAtomic(amount);
  const feeAmountAtomic = mulDivFloor(amountAtomic, st.feeBps, BPS_DENOM);
  const tradeAmountAtomic = amountAtomic - feeAmountAtomic;

  let tokensOutAtomic: bigint;
  let newYesPool: bigint;
  let newNoPool: bigint;

  if (side === "YES") {
    newNoPool = st.noPool + tradeAmountAtomic;
    newYesPool = st.k / newNoPool;
    tokensOutAtomic = st.yesPool - newYesPool;
  } else {
    newYesPool = st.yesPool + tradeAmountAtomic;
    newNoPool = st.k / newYesPool;
    tokensOutAtomic = st.noPool - newNoPool;
  }

  const priceBefore = toPriceScaledFromPools(st.yesPool, st.noPool);
  const priceAfter = toPriceScaledFromPools(newYesPool, newNoPool);
  const priceBeforeChosenScaled = side === "YES" ? priceBefore.yes : priceBefore.no;
  const priceAfterChosenScaled = side === "YES" ? priceAfter.yes : priceAfter.no;
  const priceImpactScaled = absBigInt(priceAfterChosenScaled - priceBeforeChosenScaled);
  const priceImpactAbsolute = Number(priceImpactScaled) / 1_000_000_000_000_000_000;

  if (priceImpactAbsolute > maxSlippage) {
    throw new Error(
      `Slippage ${(priceImpactAbsolute * 100).toFixed(2)}pp exceeds max ${(maxSlippage * 100).toFixed(2)}pp`
    );
  }

  // Apply trade to atomic state.
  st.feePool += feeAmountAtomic;
  st.volume += amountAtomic;

  st.yesPool = newYesPool;
  st.noPool = newNoPool;

  const pos = upsertAtomicPosition(st, user);
  pos[side] += tokensOutAtomic;
  pos.spent += amountAtomic;

  st.clock += BigInt(1);

  syncMarketFromAtomic(market, st);

  const yesPriceScaled = toPriceScaledFromPools(st.yesPool, st.noPool).yes;
  const yesPrice = Number(yesPriceScaled) / 1_000_000_000_000_000_000;

  market.trades.push({
    user,
    side,
    amount: fromUSDCAtomic(amountAtomic),
    tokensOut: fromUSDCAtomic(tokensOutAtomic),
    yesPrice,
    yesPool: market.yesPool,
    noPool: market.noPool,
    type: "buy",
    timestamp: market.clock,
  });

  return fromUSDCAtomic(tokensOutAtomic);
}

/**
 * Sell YES or NO shares back to the pool. Mutates market in place.
 * @returns netOut — USDC received after fees
 */
export function sell(
  market: Market,
  user: string,
  side: Side,
  shares: number,
  maxSlippage = 0.15
): number {
  if (market.resolved) throw new Error("Market is resolved — use payout() instead");
  if (shares <= 0) throw new Error("Shares must be positive");

  const st = ensureAtomic(market);
  const sharesAtomic = toUSDCAtomic(shares);
  const pos = st.positions[user];
  if (!pos || pos[side] < sharesAtomic) throw new Error(`Insufficient ${side} shares`);

  let grossOutAtomic: bigint;
  let newYesPool: bigint;
  let newNoPool: bigint;

  if (side === "YES") {
    newYesPool = st.yesPool + sharesAtomic;
    newNoPool = st.k / newYesPool;
    grossOutAtomic = st.noPool - newNoPool;
  } else {
    newNoPool = st.noPool + sharesAtomic;
    newYesPool = st.k / newNoPool;
    grossOutAtomic = st.yesPool - newYesPool;
  }

  const feeAmountAtomic = mulDivFloor(grossOutAtomic, st.feeBps, BPS_DENOM);
  const netOutAtomic = grossOutAtomic - feeAmountAtomic;

  const priceBefore = toPriceScaledFromPools(st.yesPool, st.noPool);
  const priceAfter = toPriceScaledFromPools(newYesPool, newNoPool);
  const priceBeforeChosenScaled = side === "YES" ? priceBefore.yes : priceBefore.no;
  const priceAfterChosenScaled = side === "YES" ? priceAfter.yes : priceAfter.no;
  const priceImpactScaled = absBigInt(priceAfterChosenScaled - priceBeforeChosenScaled);
  const priceImpactAbsolute = Number(priceImpactScaled) / 1_000_000_000_000_000_000;

  if (priceImpactAbsolute > maxSlippage) {
    throw new Error(`Sell slippage ${(priceImpactAbsolute * 100).toFixed(2)}pp exceeds max`);
  }

  // Apply trade to atomic state.
  st.feePool += feeAmountAtomic;
  st.volume += grossOutAtomic;

  st.yesPool = newYesPool;
  st.noPool = newNoPool;

  pos[side] -= sharesAtomic;
  pos.received += netOutAtomic;

  st.clock += BigInt(1);

  syncMarketFromAtomic(market, st);

  const yesPriceScaled = toPriceScaledFromPools(st.yesPool, st.noPool).yes;
  const yesPrice = Number(yesPriceScaled) / 1_000_000_000_000_000_000;

  market.trades.push({
    user,
    side,
    shares: fromUSDCAtomic(sharesAtomic),
    netOut: fromUSDCAtomic(netOutAtomic),
    yesPrice,
    yesPool: market.yesPool,
    noPool: market.noPool,
    type: "sell",
    timestamp: market.clock,
  });

  return fromUSDCAtomic(netOutAtomic);
}

// ─── LIQUIDITY ────────────────────────────────────────────────────────────────

/**
 * Add proportional liquidity. Returns new LP shares minted.
 */
export function addLiquidity(market: Market, user: string, amount: number): number {
  if (market.resolved) throw new Error("Market is resolved");

  const st = ensureAtomic(market);
  const amountAtomic = toUSDCAtomic(amount);
  const totalPoolAtomic = st.yesPool + st.noPool;
  if (totalPoolAtomic <= BigInt(0)) throw new Error("Pool must be initialized");

  // Proportional liquidity:
  // deltaPool = pool * amount / totalPool
  const yesDelta = mulDivFloor(st.yesPool, amountAtomic, totalPoolAtomic);
  const noDelta = mulDivFloor(st.noPool, amountAtomic, totalPoolAtomic);
  const newYesPool = st.yesPool + yesDelta;
  const newNoPool = st.noPool + noDelta;

  const mintedLpShares = mulDivFloor(st.lpShares, amountAtomic, totalPoolAtomic);

  st.yesPool = newYesPool;
  st.noPool = newNoPool;
  st.k = st.yesPool * st.noPool;
  st.lpShares += mintedLpShares;
  st.lpPositions[user] = (st.lpPositions[user] ?? BigInt(0)) + mintedLpShares;
  st.lpCostBasis[user] = (st.lpCostBasis[user] ?? BigInt(0)) + amountAtomic;

  syncMarketFromAtomic(market, st);

  return fromUSDCAtomic(mintedLpShares);
}

/**
 * Remove LP shares, receiving proportional YES + NO + fees.
 */
export function removeLiquidity(market: Market, user: string, shares: number): LiquidityRemoval {
  const st = ensureAtomic(market);
  const sharesAtomic = toUSDCAtomic(shares);

  if (!st.lpPositions[user] || st.lpPositions[user] < sharesAtomic) {
    throw new Error("Insufficient LP shares");
  }

  const remaining = st.lpShares - sharesAtomic;
  if (remaining < st.minLiquidity) {
    throw new Error(`Pool drain guard: need ${fromUSDCAtomic(st.minLiquidity).toFixed(2)} shares remaining`);
  }

  // Proportional withdrawal:
  // getX = poolX * shares / lpShares
  const getYesAtomic = mulDivFloor(st.yesPool, sharesAtomic, st.lpShares);
  const getNoAtomic = mulDivFloor(st.noPool, sharesAtomic, st.lpShares);
  const getFeesAtomic = mulDivFloor(st.feePool, sharesAtomic, st.lpShares);

  st.yesPool -= getYesAtomic;
  st.noPool -= getNoAtomic;
  st.feePool -= getFeesAtomic;
  st.k = st.yesPool * st.noPool;
  st.lpShares -= sharesAtomic;
  st.lpPositions[user] -= sharesAtomic;

  syncMarketFromAtomic(market, st);

  return {
    yesTokens: fromUSDCAtomic(getYesAtomic),
    noTokens: fromUSDCAtomic(getNoAtomic),
    fees: fromUSDCAtomic(getFeesAtomic),
  };
}

// ─── RESOLUTION ───────────────────────────────────────────────────────────────

/**
 * Resolve the market. outcome must be "YES" | "NO".
 */
export function resolveMarket(market: Market, outcome: Side): void {
  if (market.resolved) throw new Error("Already resolved");
  market.resolved = true;
  market.outcome = outcome;

  const st = ensureAtomic(market);
  st.resolved = true;
  st.outcome = outcome;
}

/**
 * Returns how many winning tokens the user holds (= USDC payout 1:1).
 */
export function payout(market: Market, user: string): number {
  if (!market.resolved) throw new Error("Not resolved yet");
  const st = ensureAtomic(market);
  if (!st.outcome) return 0;
  const posA = st.positions[user];
  if (!posA) return 0;
  return fromUSDCAtomic(posA[st.outcome]);
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────

/**
 * Calculate mark-to-market PnL for every user who has traded.
 */
export function calculatePnL(market: Market): PnLEntry[] {
  const st = ensureAtomic(market);
  const priceScaled = toPriceScaledFromPools(st.yesPool, st.noPool);

  return Object.entries(st.positions).map(([user, posA]) => {
    const markValueAtomic =
      mulDivFloor(posA.YES, priceScaled.yes, PRICE_SCALE) +
      mulDivFloor(posA.NO, priceScaled.no, PRICE_SCALE);

    const netInvestedAtomic = posA.spent - posA.received;

    return {
      user,
      YES: fromUSDCAtomic(posA.YES),
      NO: fromUSDCAtomic(posA.NO),
      spent: fromUSDCAtomic(posA.spent),
      received: fromUSDCAtomic(posA.received),
      markValue: fromUSDCAtomic(markValueAtomic),
      netInvested: fromUSDCAtomic(netInvestedAtomic),
      unrealizedPnL: fromUSDCAtomic(markValueAtomic - netInvestedAtomic),
    };
  });
}

/**
 * Returns the integer atomic state used by the bigint AMM engine.
 * This is the representation that should be persisted to Postgres/Neon (`bigint` columns).
 */
export function getMarketAtomicState(market: Market): MarketAtomicState {
  return ensureAtomic(market);
}
