// ─── TYPES ────────────────────────────────────────────────────────────────────

export type Side = "YES" | "NO";

export interface Position {
  YES: number;
  NO: number;
  spent: number;
  received: number;
}

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

// ─── ENGINE ───────────────────────────────────────────────────────────────────

/**
 * Create a new CPMM market.
 */
export function createMarket({ initialLiquidity = 1000, fee = 0.02 }: MarketConfig = {}): Market {
  if (initialLiquidity <= 0) throw new Error("initialLiquidity must be positive");
  if (fee < 0 || fee >= 1) throw new Error("fee must be in [0, 1)");

  const MIN_LIQUIDITY = Math.max(1, initialLiquidity * 0.001);

  return {
    yesPool: initialLiquidity,
    noPool: initialLiquidity,
    k: initialLiquidity * initialLiquidity,
    fee,
    feePool: 0,
    volume: 0,
    trades: [],
    failedTrades: 0,
    positions: {},
    lpShares: initialLiquidity,
    lpPositions: {},
    lpCostBasis: {},
    MIN_LIQUIDITY,
    resolved: false,
    outcome: null,
    clock: 0,
  };
}

// ─── PRICING ─────────────────────────────────────────────────────────────────

/**
 * Spot prices for YES and NO tokens (sum to 1).
 * P_yes = noPool / (yesPool + noPool)
 */
export function getPrice(m: Market): Price {
  const total = m.yesPool + m.noPool;
  return { yes: m.noPool / total, no: m.yesPool / total };
}

/**
 * Quote a buy: tokens out, price impact, fee.
 * Uses constant-product formula: k = x * y.
 */
export function getQuote(market: Market, side: Side, amount: number): BuyQuote {
  const feeAmount = amount * market.fee;
  const tradeAmount = amount - feeAmount;
  const { yesPool, noPool, k } = market;

  let tokensOut: number;
  let newYesPool: number;
  let newNoPool: number;

  if (side === "YES") {
    newNoPool = noPool + tradeAmount;
    newYesPool = k / newNoPool;
    tokensOut = yesPool - newYesPool;
  } else {
    newYesPool = yesPool + tradeAmount;
    newNoPool = k / newYesPool;
    tokensOut = noPool - newNoPool;
  }

  const priceBefore = side === "YES" ? getPrice(market).yes : getPrice(market).no;
  const priceAfter =
    side === "YES"
      ? newNoPool / (newYesPool + newNoPool)
      : newYesPool / (newYesPool + newNoPool);

  const priceImpactAbsolute = Math.abs(priceAfter - priceBefore);

  return {
    tokensOut,
    priceBefore,
    priceAfter,
    priceImpactAbsolute,
    priceImpactRelative: priceImpactAbsolute / priceBefore,
    feeAmount,
    spread: feeAmount / tokensOut,
  };
}

/**
 * Quote a sell: how much USDC back, fee deducted from gross.
 */
export function sellQuote(market: Market, side: Side, shares: number): SellQuoteResult {
  const { yesPool, noPool, k } = market;

  let grossOut: number;
  let newYesPool: number;
  let newNoPool: number;

  if (side === "YES") {
    newYesPool = yesPool + shares;
    newNoPool = k / newYesPool;
    grossOut = noPool - newNoPool;
  } else {
    newNoPool = noPool + shares;
    newYesPool = k / newNoPool;
    grossOut = yesPool - newYesPool;
  }

  const feeAmount = grossOut * market.fee;
  const netOut = grossOut - feeAmount;

  const priceBefore = side === "YES" ? getPrice(market).yes : getPrice(market).no;
  const priceAfter =
    side === "YES"
      ? newNoPool / (newYesPool + newNoPool)
      : newYesPool / (newYesPool + newNoPool);

  const priceImpactAbsolute = Math.abs(priceAfter - priceBefore);

  return {
    grossOut,
    feeAmount,
    netOut,
    priceBefore,
    priceAfter,
    priceImpactAbsolute,
    priceImpactRelative: priceImpactAbsolute / priceBefore,
  };
}

// ─── TRADING ─────────────────────────────────────────────────────────────────

function upsertPosition(market: Market, user: string): Position {
  if (!market.positions[user]) {
    market.positions[user] = { YES: 0, NO: 0, spent: 0, received: 0 };
  }
  return market.positions[user];
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

  const { tokensOut, priceImpactAbsolute, feeAmount } = getQuote(market, side, amount);

  if (priceImpactAbsolute > maxSlippage) {
    throw new Error(
      `Slippage ${(priceImpactAbsolute * 100).toFixed(2)}pp exceeds max ${(maxSlippage * 100).toFixed(2)}pp`
    );
  }

  const tradeAmount = amount - feeAmount;
  market.feePool += feeAmount;
  market.volume += amount;

  if (side === "YES") {
    market.noPool += tradeAmount;
    market.yesPool = market.k / market.noPool;
  } else {
    market.yesPool += tradeAmount;
    market.noPool = market.k / market.yesPool;
  }

  const pos = upsertPosition(market, user);
  pos[side] += tokensOut;
  pos.spent += amount;
  market.clock++;

  market.trades.push({
    user, side, amount, tokensOut,
    yesPrice: getPrice(market).yes,
    yesPool: market.yesPool,
    noPool: market.noPool,
    type: "buy",
    timestamp: market.clock,
  });

  return tokensOut;
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

  const pos = market.positions[user];
  if (!pos || pos[side] < shares) throw new Error(`Insufficient ${side} shares`);

  const { netOut, feeAmount, grossOut, priceImpactAbsolute } = sellQuote(market, side, shares);

  if (priceImpactAbsolute > maxSlippage) {
    throw new Error(`Sell slippage ${(priceImpactAbsolute * 100).toFixed(2)}pp exceeds max`);
  }

  if (side === "YES") {
    const ny = market.yesPool + shares;
    market.yesPool = ny;
    market.noPool = market.k / ny;
  } else {
    const nn = market.noPool + shares;
    market.noPool = nn;
    market.yesPool = market.k / nn;
  }

  market.feePool += feeAmount;
  market.volume += grossOut;
  pos[side] -= shares;
  pos.received += netOut;
  market.clock++;

  market.trades.push({
    user, side, shares, netOut,
    yesPrice: getPrice(market).yes,
    yesPool: market.yesPool,
    noPool: market.noPool,
    type: "sell",
    timestamp: market.clock,
  });

  return netOut;
}

// ─── LIQUIDITY ────────────────────────────────────────────────────────────────

/**
 * Add proportional liquidity. Returns new LP shares minted.
 */
export function addLiquidity(market: Market, user: string, amount: number): number {
  if (market.resolved) throw new Error("Market is resolved");

  const totalPool = market.yesPool + market.noPool;
  const ratio = amount / totalPool;

  market.yesPool += market.yesPool * ratio;
  market.noPool += market.noPool * ratio;
  market.k = market.yesPool * market.noPool;

  const newShares = market.lpShares * ratio;
  market.lpShares += newShares;

  market.lpPositions[user] = (market.lpPositions[user] ?? 0) + newShares;
  market.lpCostBasis[user] = (market.lpCostBasis[user] ?? 0) + amount;

  return newShares;
}

/**
 * Remove LP shares, receiving proportional YES + NO + fees.
 */
export function removeLiquidity(market: Market, user: string, shares: number): LiquidityRemoval {
  if (!market.lpPositions[user] || market.lpPositions[user] < shares) {
    throw new Error("Insufficient LP shares");
  }

  const remaining = market.lpShares - shares;
  if (remaining < market.MIN_LIQUIDITY) {
    throw new Error(`Pool drain guard: need ${market.MIN_LIQUIDITY.toFixed(2)} shares remaining`);
  }

  const fraction = shares / market.lpShares;
  const getYes = market.yesPool * fraction;
  const getNo = market.noPool * fraction;
  const getFees = market.feePool * fraction;

  market.yesPool -= getYes;
  market.noPool -= getNo;
  market.feePool -= getFees;
  market.k = market.yesPool * market.noPool;
  market.lpShares -= shares;
  market.lpPositions[user] -= shares;

  return { yesTokens: getYes, noTokens: getNo, fees: getFees };
}

// ─── RESOLUTION ───────────────────────────────────────────────────────────────

/**
 * Resolve the market. outcome must be "YES" | "NO".
 */
export function resolveMarket(market: Market, outcome: Side): void {
  if (market.resolved) throw new Error("Already resolved");
  market.resolved = true;
  market.outcome = outcome;
}

/**
 * Returns how many winning tokens the user holds (= USDC payout 1:1).
 */
export function payout(market: Market, user: string): number {
  if (!market.resolved) throw new Error("Not resolved yet");
  const pos = market.positions[user];
  if (!pos || !market.outcome) return 0;
  return pos[market.outcome] ?? 0;
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────

/**
 * Calculate mark-to-market PnL for every user who has traded.
 */
export function calculatePnL(market: Market): PnLEntry[] {
  const price = getPrice(market);

  return Object.entries(market.positions).map(([user, pos]) => {
    const markValue = pos.YES * price.yes + pos.NO * price.no;
    const netInvested = pos.spent - pos.received;

    return {
      user,
      YES: pos.YES,
      NO: pos.NO,
      spent: pos.spent,
      received: pos.received,
      markValue,
      netInvested,
      unrealizedPnL: markValue - netInvested,
    };
  });
}
