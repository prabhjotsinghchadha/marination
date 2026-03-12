"use client";

import { useState, useCallback, useRef } from "react";
import {
    createMarket,
    addLiquidity,
    buy,
    sell,
    resolveMarket,
    removeLiquidity,
    calculatePnL,
    getPrice,
    Market,
    Side,
} from "@/libs/amm";
import { fmtUSDC, fmt } from "@/libs/formatters";
import Header from "@/components/layout/Header";
import PriceGauge from "@/components/market/PriceGauge";
import ActiveTrader from "@/components/market/ActiveTrader";
import TradePanel from "@/components/market/TradePanel";
import PriceChart from "@/components/market/PriceChart";
import PoolDepth from "@/components/market/PoolDepth";
import TradeHistory from "@/components/market/TradeHistory";
import AllPositions from "@/components/market/AllPositions";
import PayoutsCard from "@/components/market/PayoutsCard";
import CreateMarketModal, { CreateMarketConfig } from "@/components/modals/CreateMarketModal";

interface Toast {
    msg: string;
    type: "success" | "error";
}

export default function AMMTestbed() {
    const [market, setMarket] = useState<Market | null>(null);
    const [marketName, setMarketName] = useState<string>("");
    const [activeUser, setActiveUser] = useState<string>("Alice");
    const [showModal, setShowModal] = useState<boolean>(false);
    const [toast, setToast] = useState<Toast | null>(null);
    const toastTimer = useRef<ReturnType<typeof setTimeout>>();

    // ── Toast ────────────────────────────────────────────────────────────────
    const showToast = useCallback((msg: string, type: Toast["type"] = "success") => {
        clearTimeout(toastTimer.current);
        setToast({ msg, type });
        toastTimer.current = setTimeout(() => setToast(null), 3000);
    }, []);

    // ── Deep-clone + mutate pattern ──────────────────────────────────────────
    const mutate = useCallback((fn: (m: Market) => void) => {
        setMarket((prev) => {
            if (!prev) return prev;
            const copy: Market = JSON.parse(JSON.stringify(prev));
            fn(copy);
            return copy;
        });
    }, []);

    // ── Market creation ───────────────────────────────────────────────────────
    const handleCreate = useCallback(
        ({ name, liquidity, fee }: CreateMarketConfig) => {
            try {
                const m = createMarket({ initialLiquidity: liquidity, fee });
                m.lpPositions["Alice"] = m.lpShares;
                m.lpCostBasis["Alice"] = liquidity * 2;
                setMarket(m);
                setMarketName(name);
                setShowModal(false);
                showToast(`Market created: ${name}`);
            } catch (e) {
                showToast((e as Error).message, "error");
            }
        },
        [showToast]
    );

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleBuy = useCallback(
        (side: Side, amount: number) => {
            try {
                mutate((m) => {
                    const tokens = buy(m, activeUser, side, amount);
                    showToast(`Bought ${tokens.toFixed(2)} ${side} tokens for ${fmtUSDC(amount)}`);
                });
            } catch (e) {
                showToast((e as Error).message, "error");
            }
        },
        [activeUser, mutate, showToast]
    );

    const handleSell = useCallback(
        (side: Side, shares: number) => {
            try {
                mutate((m) => {
                    const out = sell(m, activeUser, side, shares);
                    showToast(`Sold ${shares.toFixed(2)} ${side} shares → ${fmtUSDC(out)}`);
                });
            } catch (e) {
                showToast((e as Error).message, "error");
            }
        },
        [activeUser, mutate, showToast]
    );

    const handleAddLiquidity = useCallback(
        (amount: number) => {
            try {
                mutate((m) => {
                    const shares = addLiquidity(m, activeUser, amount);
                    showToast(`Added $${amount} liquidity → ${shares.toFixed(2)} LP shares`);
                });
            } catch (e) {
                showToast((e as Error).message, "error");
            }
        },
        [activeUser, mutate, showToast]
    );

    const handleRemoveLiquidity = useCallback(
        (shares: number) => {
            try {
                mutate((m) => {
                    const { yesTokens, noTokens, fees } = removeLiquidity(m, activeUser, shares);
                    showToast(
                        `Removed LP: ${fmt(yesTokens)} YES + ${fmt(noTokens)} NO + $${fees.toFixed(2)} fees`
                    );
                });
            } catch (e) {
                showToast((e as Error).message, "error");
            }
        },
        [activeUser, mutate, showToast]
    );

    const handleResolve = useCallback(
        (outcome: Side) => {
            try {
                mutate((m) => resolveMarket(m, outcome));
                showToast(`Market resolved: ${outcome} wins!`);
            } catch (e) {
                showToast((e as Error).message, "error");
            }
        },
        [mutate, showToast]
    );

    // ── Derived ───────────────────────────────────────────────────────────────
    const price = market ? getPrice(market) : { yes: 0.5, no: 0.5 };
    const pnlData = market ? calculatePnL(market) : [];

    return (
        <div className="bg-bg min-h-screen font-mono text-text">
            <div className="max-w-app mx-auto px-4 pb-20">
                <Header
                    market={market}
                    marketName={marketName}
                    onNewMarket={() => setShowModal(true)}
                />

                {/* ── Empty state ── */}
                {!market ? (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
                        <div className="text-5xl mb-2">🏦</div>
                        <h2 className="font-display text-2xl font-extrabold text-white">
                            No Market Yet
                        </h2>
                        <p className="text-[13px] text-text-dim max-w-xs leading-relaxed">
                            Create a prediction market to start testing your AMM engine with live
                            trading, liquidity, and resolution.
                        </p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="mt-2 px-8 py-3 bg-yes text-black font-display font-extrabold uppercase tracking-wide rounded-lg hover:bg-[#00ffb3] hover:shadow-[0_0_20px_rgba(0,229,160,0.4)] transition-all cursor-pointer"
                        >
                            ⚡ Create First Market
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4 items-start">
                        {/* Left panel */}
                        <div className="flex flex-col gap-4">
                            <div className="bg-surface border border-border rounded-xl overflow-hidden">
                                <PriceGauge market={market} />
                            </div>
                            <ActiveTrader
                                market={market}
                                activeUser={activeUser}
                                onSelectUser={setActiveUser}
                            />
                            {!market.resolved && (
                                <div className="bg-surface border border-border rounded-xl overflow-hidden">
                                    <TradePanel
                                        market={market}
                                        activeUser={activeUser}
                                        onBuy={handleBuy}
                                        onSell={handleSell}
                                        onAddLiquidity={handleAddLiquidity}
                                        onRemoveLiquidity={handleRemoveLiquidity}
                                        onResolve={handleResolve}
                                    />
                                </div>
                            )}
                            {market.resolved && <PayoutsCard market={market} />}
                        </div>

                        {/* Right panel */}
                        <div className="flex flex-col gap-4">
                            <PriceChart trades={market.trades} currentPrice={price.yes} />
                            <PoolDepth market={market} />
                            <TradeHistory trades={market.trades} />
                            <AllPositions pnlData={pnlData} />
                        </div>
                    </div>
                )}
            </div>

            {showModal && (
                <CreateMarketModal onClose={() => setShowModal(false)} onCreate={handleCreate} />
            )}

            {toast && (
                <div
                    className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl text-xs font-bold border z-50 max-w-[300px] animate-slideIn
            ${
                toast.type === "success"
                    ? "bg-yes-dim text-yes border-yes-border"
                    : "bg-no-dim text-no border-no-border"
            }`}
                >
                    {toast.msg}
                </div>
            )}
        </div>
    );
}
