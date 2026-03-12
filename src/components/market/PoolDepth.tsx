"use client";

import { fmt, fmtPct, fmtUSDC } from "@/libs/formatters";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Market } from "@/libs/amm";

interface PoolDepthProps {
    market: Market;
}

export default function PoolDepth({ market }: PoolDepthProps) {
    const totalPoolValue = market.yesPool + market.noPool;
    const yesPoolPct = (market.yesPool / totalPoolValue) * 100;
    const noPoolPct = (market.noPool / totalPoolValue) * 100;

    return (
        <Card>
            <CardHeader title="Pool Depth" />
            <CardBody>
                <div className="mb-3">
                    <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-yes">YES Pool</span>
                        <span className="text-yes">
                            {fmt(market.yesPool)} ({fmt(yesPoolPct, 1)}%)
                        </span>
                    </div>
                    <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-yes rounded-full transition-all duration-500"
                            style={{ width: `${yesPoolPct}%` }}
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-no">NO Pool</span>
                        <span className="text-no">
                            {fmt(market.noPool)} ({fmt(noPoolPct, 1)}%)
                        </span>
                    </div>
                    <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-no rounded-full transition-all duration-500"
                            style={{ width: `${noPoolPct}%` }}
                        />
                    </div>
                </div>

                <div className="border-t border-border pt-3 grid grid-cols-4 gap-2">
                    {(
                        [
                            ["Total Value", fmtUSDC(totalPoolValue)],
                            ["k invariant", fmt(market.k, 0)],
                            ["Fee Rate", fmtPct(market.fee)],
                            ["Fee Earned", fmtUSDC(market.feePool)],
                        ] as const
                    ).map(([label, value]) => (
                        <div
                            key={label}
                            className="bg-surface-2 border border-border rounded-lg p-2.5"
                        >
                            <div className="text-[9px] uppercase tracking-widest text-text-dim mb-1">
                                {label}
                            </div>
                            <div className="text-xs font-bold text-text">{value}</div>
                        </div>
                    ))}
                </div>
            </CardBody>
        </Card>
    );
}
