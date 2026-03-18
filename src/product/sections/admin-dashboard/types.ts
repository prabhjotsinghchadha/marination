export type AdminDashboardView =
  | "overview"
  | "markets"
  | "create-market"
  | "users"
  | "trades"
  | "ledger"
  | "settings";

export type AdminMarketStatus = "DRAFT" | "OPEN" | "CLOSED" | "RESOLVED";
export type AdminResolvedOutcome = "YES" | "NO";

export type AdminMarketModel = "CPMM_BINARY";

export interface AdminMarket {
  id: string;
  question: string;
  slug: string;
  status: AdminMarketStatus;
  model: AdminMarketModel;
  volume: number;
  yesPool: number;
  noPool: number;
  trades: number;
  endTime: string;
  createdAt: string;
  resolvedOutcome?: AdminResolvedOutcome;
}

export type AdminAuthProvider = "google" | "twitter" | "apple";

export interface AdminUser {
  id: string;
  displayName: string;
  email: string;
  authProvider: AdminAuthProvider;
  balance: number;
  reserved: number;
  trades: number;
  createdAt: string;
}

export type AdminTradeType = "AMM_BUY" | "AMM_SELL";
export type AdminTradeOutcome = "YES" | "NO";

export interface AdminTrade {
  id: string;
  marketQuestion: string;
  user: string;
  type: AdminTradeType;
  outcome: AdminTradeOutcome;
  collateralIn: number;
  sharesOut: number;
  fee: number;
  price: number;
  createdAt: string;
}

export type AdminLedgerTxType = "DEPOSIT" | "AMM_TRADE" | "WITHDRAWAL" | "PAYOUT";
export type AdminLedgerTxStatus = "POSTED" | "PENDING";

export interface AdminLedgerTx {
  id: string;
  txType: AdminLedgerTxType;
  user: string;
  amount: number;
  status: AdminLedgerTxStatus;
  ref: string;
  createdAt: string;
}

export type AdminAnyStatus = AdminMarketStatus | AdminLedgerTxStatus | "SEEN";

export interface AdminDashboardMockData {
  markets: AdminMarket[];
  users: AdminUser[];
  trades: AdminTrade[];
  ledger: AdminLedgerTx[];
}

