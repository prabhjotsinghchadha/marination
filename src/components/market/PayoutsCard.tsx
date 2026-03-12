"use client";

import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { USERS } from "@/libs/constants";
import { fmtUSDC } from "@/libs/formatters";
import { payout, Market } from "@/libs/amm";

interface PayoutsCardProps {
    market: Market;
}

export default function PayoutsCard({ market }: PayoutsCardProps) {
    const traders = USERS.filter((u) => market.positions[u]);

    return (
        <Card>
            <CardHeader title="Payouts" />
            <CardBody className="space-y-0">
                {traders.length === 0 ? (
                    <div className="text-center py-6 text-[12px] text-text-dim">No traders</div>
                ) : (
                    traders.map((u) => {
                        const p = payout(market, u);
                        return (
                            <div
                                key={u}
                                className="flex justify-between py-2 border-b border-border last:border-b-0 text-xs"
                            >
                                <span className="text-text">{u}</span>
                                <span
                                    className={`font-bold ${p > 0 ? "text-yes" : "text-text-dim"}`}
                                >
                                    {p > 0 ? `+${fmtUSDC(p)}` : "—"}
                                </span>
                            </div>
                        );
                    })
                )}
            </CardBody>
        </Card>
    );
}
