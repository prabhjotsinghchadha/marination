"use client";

import { useState, useMemo } from "react";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { getQuote, sellQuote, Market } from "@/libs/amm";
import { fmt, fmtPct, fmtUSDC } from "@/libs/formatters";
import { Side } from "@/libs/amm";

// ─── Shared ───────────────────────────────────────────────────────────────────

interface QuoteRowProps {
    label: string;
    value: string;
    colorClass?: string;
}

function QuoteRow({ label, value, colorClass = "text-text" }: QuoteRowProps) {
    return (
        <div className="flex justify-between py-0.5 text-xs text-text-dim">
            <span>{label}</span>
            <strong className={colorClass}>{value}</strong>
        </div>
    );
}

// ─── BUY ─────────────────────────────────────────────────────────────────────

interface BuyTabProps {
    market: Market;
    activeUser: string;
    onBuy: (side: Side, amount: number) => void;
}

function BuyTab({ market, onBuy }: BuyTabProps) {
    const [side, setSide] = useState<Side>("YES");
    const [amount, setAmount] = useState<string>("");

    const quote = useMemo(() => {
        if (!amount || parseFloat(amount) <= 0) return null;
        try {
            return getQuote(market, side, parseFloat(amount));
        } catch {
            return null;
        }
    }, [market, side, amount]);

    const handleBuy = (): void => {
        onBuy(side, parseFloat(amount));
        setAmount("");
    };

    return (
        <div className="p-4 space-y-4">
            <div>
                <label className="block text-[10px] uppercase tracking-widest text-text-dim mb-1.5">
                    Outcome
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                    {(["YES", "NO"] as Side[]).map((s) => (
                        <Button
                            key={s}
                            size="sm"
                            variant={side === s ? (s === "YES" ? "yes" : "no") : "neutral"}
                            onClick={() => setSide(s)}
                        >
                            {s}
                        </Button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-[10px] uppercase tracking-widest text-text-dim mb-1.5">
                    Amount (USDC)
                </label>
                <input
                    type="number"
                    min="0"
                    step="10"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm font-mono text-text outline-none focus:border-accent transition-colors"
                />
            </div>

            {quote && (
                <div className="bg-surface-2 border border-border rounded-lg p-3">
                    <QuoteRow
                        label="Tokens out"
                        value={fmt(quote.tokensOut)}
                        colorClass="text-yes"
                    />
                    <QuoteRow label="Avg price" value={fmtPct(quote.priceAfter)} />
                    <QuoteRow
                        label="Price impact"
                        value={`${(quote.priceImpactAbsolute * 100).toFixed(2)}pp`}
                        colorClass={quote.priceImpactAbsolute > 0.05 ? "text-no" : "text-gold"}
                    />
                    <QuoteRow label="Fee" value={fmtUSDC(quote.feeAmount)} />
                </div>
            )}

            <Button
                variant={side === "YES" ? "yes" : "no"}
                disabled={!amount || parseFloat(amount) <= 0}
                onClick={handleBuy}
            >
                Buy {side}
            </Button>
        </div>
    );
}

// ─── SELL ────────────────────────────────────────────────────────────────────

interface SellTabProps {
    market: Market;
    activeUser: string;
    onSell: (side: Side, shares: number) => void;
}

function SellTab({ market, activeUser, onSell }: SellTabProps) {
    const [side, setSide] = useState<Side>("YES");
    const [shares, setShares] = useState<string>("");

    const position = market.positions[activeUser] ?? { YES: 0, NO: 0, spent: 0, received: 0 };

    const quote = useMemo(() => {
        if (!shares || parseFloat(shares) <= 0) return null;
        try {
            return sellQuote(market, side, parseFloat(shares));
        } catch {
            return null;
        }
    }, [market, side, shares]);

    const handleSell = (): void => {
        onSell(side, parseFloat(shares));
        setShares("");
    };

    return (
        <div className="p-4 space-y-4">
            <div>
                <label className="block text-[10px] uppercase tracking-widest text-text-dim mb-1.5">
                    Token to Sell
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                    {(["YES", "NO"] as Side[]).map((s) => (
                        <Button
                            key={s}
                            size="sm"
                            variant={side === s ? (s === "YES" ? "yes" : "no") : "neutral"}
                            onClick={() => setSide(s)}
                        >
                            {s} ({fmt(position[s])} held)
                        </Button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-[10px] uppercase tracking-widest text-text-dim mb-1.5">
                    Shares to Sell
                </label>
                <input
                    type="number"
                    min="0"
                    placeholder="0.00"
                    value={shares}
                    onChange={(e) => setShares(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm font-mono text-text outline-none focus:border-accent transition-colors"
                />
                {position[side] > 0 && (
                    <button
                        className="mt-1.5 text-[11px] text-text-dim hover:text-text font-mono cursor-pointer"
                        onClick={() => setShares(fmt(position[side]))}
                    >
                        Max ({fmt(position[side])})
                    </button>
                )}
            </div>

            {quote && (
                <div className="bg-surface-2 border border-border rounded-lg p-3">
                    <QuoteRow
                        label="USDC out"
                        value={fmtUSDC(quote.netOut)}
                        colorClass="text-yes"
                    />
                    <QuoteRow label="Gross" value={fmtUSDC(quote.grossOut)} />
                    <QuoteRow label="Fee" value={fmtUSDC(quote.feeAmount)} />
                    <QuoteRow
                        label="Price impact"
                        value={`${(quote.priceImpactAbsolute * 100).toFixed(2)}pp`}
                        colorClass={quote.priceImpactAbsolute > 0.05 ? "text-no" : "text-gold"}
                    />
                </div>
            )}

            <Button
                variant="danger"
                disabled={!shares || parseFloat(shares) <= 0 || parseFloat(shares) > position[side]}
                onClick={handleSell}
            >
                Sell {side}
            </Button>
        </div>
    );
}

// ─── LIQUIDITY ───────────────────────────────────────────────────────────────

interface LiquidityTabProps {
    market: Market;
    activeUser: string;
    onAdd: (amount: number) => void;
    onRemove: (shares: number) => void;
}

function LiquidityTab({ market, activeUser, onAdd, onRemove }: LiquidityTabProps) {
    const [addAmt, setAddAmt] = useState<string>("");
    const [removeShares, setRemoveShares] = useState<string>("");
    const userLP = market.lpPositions[activeUser] ?? 0;

    return (
        <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-2">
                {(
                    [
                        ["Your LP Shares", fmt(userLP), "text-accent"],
                        ["Total Shares", fmt(market.lpShares), "text-text"],
                        [
                            "Pool Share",
                            market.lpShares > 0
                                ? `${((userLP / market.lpShares) * 100).toFixed(1)}%`
                                : "0%",
                            "text-text",
                        ],
                        ["Fee Pool", fmtUSDC(market.feePool), "text-gold"],
                    ] as const
                ).map(([label, value, color]) => (
                    <div key={label} className="bg-surface-2 border border-border rounded-lg p-2.5">
                        <div className="text-[9px] uppercase tracking-widest text-text-dim mb-1">
                            {label}
                        </div>
                        <div className={`text-sm font-bold ${color}`}>{value}</div>
                    </div>
                ))}
            </div>

            <div className="border-t border-border pt-4">
                <div className="text-[10px] uppercase tracking-widest text-text-dim mb-3 text-center">
                    Add Liquidity
                </div>
                <label className="block text-[10px] uppercase tracking-widest text-text-dim mb-1.5">
                    Amount (USDC)
                </label>
                <input
                    type="number"
                    placeholder="0.00"
                    value={addAmt}
                    onChange={(e) => setAddAmt(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm font-mono text-text outline-none focus:border-accent transition-colors mb-3"
                />
                <Button
                    variant="neutral"
                    disabled={!addAmt || parseFloat(addAmt) <= 0}
                    onClick={() => {
                        onAdd(parseFloat(addAmt));
                        setAddAmt("");
                    }}
                >
                    + Add Liquidity
                </Button>
            </div>

            <div className="border-t border-border pt-4">
                <div className="text-[10px] uppercase tracking-widest text-text-dim mb-3 text-center">
                    Remove Liquidity
                </div>
                <label className="block text-[10px] uppercase tracking-widest text-text-dim mb-1.5">
                    LP Shares to Remove
                </label>
                <input
                    type="number"
                    placeholder="0.00"
                    value={removeShares}
                    onChange={(e) => setRemoveShares(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm font-mono text-text outline-none focus:border-accent transition-colors mb-1.5"
                />
                {userLP > 0 && (
                    <button
                        className="text-[11px] text-text-dim hover:text-text font-mono mb-3 block cursor-pointer"
                        onClick={() => setRemoveShares(fmt(userLP * 0.5))}
                    >
                        50% ({fmt(userLP * 0.5)})
                    </button>
                )}
                <Button
                    variant="danger"
                    disabled={
                        !removeShares ||
                        parseFloat(removeShares) <= 0 ||
                        parseFloat(removeShares) > userLP
                    }
                    onClick={() => {
                        onRemove(parseFloat(removeShares));
                        setRemoveShares("");
                    }}
                >
                    − Remove Liquidity
                </Button>
            </div>
        </div>
    );
}

// ─── RESOLVE ─────────────────────────────────────────────────────────────────

interface ResolveTabProps {
    onResolve: (outcome: Side) => void;
}

function ResolveTab({ onResolve }: ResolveTabProps) {
    const [outcome, setOutcome] = useState<Side>("YES");

    return (
        <div className="p-4 space-y-4">
            <Alert variant="info">
                Resolve the market to distribute payouts. This action is irreversible.
            </Alert>
            <div>
                <label className="block text-[10px] uppercase tracking-widest text-text-dim mb-1.5">
                    Winning Outcome
                </label>
                <div className="grid grid-cols-2 gap-2">
                    {(["YES", "NO"] as Side[]).map((o) => (
                        <Button
                            key={o}
                            variant={outcome === o ? (o === "YES" ? "yes" : "no") : "neutral"}
                            onClick={() => setOutcome(o)}
                        >
                            {o}
                        </Button>
                    ))}
                </div>
            </div>
            <Button variant="resolve" onClick={() => onResolve(outcome)}>
                ⚖️ Resolve as {outcome}
            </Button>
        </div>
    );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

type TabId = "buy" | "sell" | "liquidity" | "resolve";

const TABS: { id: TabId; label: string }[] = [
    { id: "buy", label: "Buy" },
    { id: "sell", label: "Sell" },
    { id: "liquidity", label: "Liquidity" },
    { id: "resolve", label: "Resolve" },
];

interface TradePanelProps {
    market: Market;
    activeUser: string;
    onBuy: (side: Side, amount: number) => void;
    onSell: (side: Side, shares: number) => void;
    onAddLiquidity: (amount: number) => void;
    onRemoveLiquidity: (shares: number) => void;
    onResolve: (outcome: Side) => void;
}

export default function TradePanel({
    market,
    activeUser,
    onBuy,
    onSell,
    onAddLiquidity,
    onRemoveLiquidity,
    onResolve,
}: TradePanelProps) {
    const [activeTab, setActiveTab] = useState<TabId>("buy");

    return (
        <div>
            <div className="flex gap-0.5 px-3 py-2.5 border-b border-border flex-wrap">
                {TABS.map(({ id, label }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`px-3 py-1.5 text-[11px] font-bold tracking-wide rounded-md transition-all font-mono cursor-pointer
              ${
                  activeTab === id
                      ? "bg-surface-3 text-white"
                      : "text-text-dim hover:text-text hover:bg-surface-3"
              }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {activeTab === "buy" && (
                <BuyTab market={market} activeUser={activeUser} onBuy={onBuy} />
            )}
            {activeTab === "sell" && (
                <SellTab market={market} activeUser={activeUser} onSell={onSell} />
            )}
            {activeTab === "liquidity" && (
                <LiquidityTab
                    market={market}
                    activeUser={activeUser}
                    onAdd={onAddLiquidity}
                    onRemove={onRemoveLiquidity}
                />
            )}
            {activeTab === "resolve" && <ResolveTab onResolve={onResolve} />}
        </div>
    );
}
