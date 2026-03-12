"use client";

import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { USERS } from "@/libs/constants";
import { fmt, fmtUSDC } from "@/libs/formatters";
import { getPrice, payout, Market } from "@/libs/amm";

interface ActiveTraderProps {
    market: Market;
    activeUser: string;
    onSelectUser: (user: string) => void;
}

export default function ActiveTrader({ market, activeUser, onSelectUser }: ActiveTraderProps) {
    const price = getPrice(market);
    const pos = market.positions[activeUser] ?? { YES: 0, NO: 0, spent: 0, received: 0 };
    const userLP = market.lpPositions[activeUser] ?? 0;
    const markValue = pos.YES * price.yes + pos.NO * price.no;
    const netInvested = pos.spent - pos.received;
    const unrealizedPnL = markValue - netInvested;
    const userPayout = market.resolved ? payout(market, activeUser) : null;
    const hasPosition = pos.spent > 0 || userLP > 0;

    return (
        <Card>
            <CardHeader title="Active Trader" />
            <CardBody>
                <div className="flex gap-1.5 flex-wrap">
                    {USERS.map((u) => (
                        <button
                            key={u}
                            onClick={() => onSelectUser(u)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all font-mono cursor-pointer
                ${
                    activeUser === u
                        ? "bg-accent-dim text-blue-300 border-blue-500/40"
                        : "bg-surface-2 text-text-dim border-border hover:text-text hover:border-white/20"
                }`}
                        >
                            {u}
                        </button>
                    ))}
                </div>

                {hasPosition && (
                    <div className="border-t border-border mt-3 pt-3">
                        <div className="text-[11px] text-text-dim mb-2">
                            {activeUser}&apos;s Position
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                            {(
                                [
                                    ["YES", fmt(pos.YES), "text-yes"],
                                    ["NO", fmt(pos.NO), "text-no"],
                                    [
                                        "Unrealized PnL",
                                        `${unrealizedPnL >= 0 ? "+" : ""}${fmtUSDC(unrealizedPnL)}`,
                                        unrealizedPnL >= 0 ? "text-yes" : "text-no",
                                    ],
                                    ["Spent", fmtUSDC(pos.spent), "text-text"],
                                    ["Mark Value", fmtUSDC(markValue), "text-text"],
                                ] as const
                            ).map(([label, value, color]) => (
                                <div
                                    key={label}
                                    className="bg-surface border border-border rounded-md p-2"
                                >
                                    <div className="text-[9px] uppercase tracking-widest text-text-dim mb-0.5">
                                        {label}
                                    </div>
                                    <div className={`text-[13px] font-bold ${color}`}>{value}</div>
                                </div>
                            ))}
                            {userLP > 0 && (
                                <div className="bg-surface border border-border rounded-md p-2">
                                    <div className="text-[9px] uppercase tracking-widest text-text-dim mb-0.5">
                                        LP Shares
                                    </div>
                                    <div className="text-[13px] font-bold text-accent">
                                        {fmt(userLP)}
                                    </div>
                                </div>
                            )}
                        </div>

                        {market.resolved && userPayout != null && userPayout > 0 && (
                            <div className="mt-2.5 bg-yes-dim border border-yes-border rounded-lg px-3 py-2 text-xs text-yes">
                                🎉 Payout: {fmtUSDC(userPayout)} (outcome: {market.outcome})
                            </div>
                        )}
                    </div>
                )}
            </CardBody>
        </Card>
    );
}
