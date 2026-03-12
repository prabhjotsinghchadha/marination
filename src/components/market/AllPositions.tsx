"use client";

import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { fmt, fmtUSDC } from "@/libs/formatters";
import { PnLEntry } from "@/libs/amm";

interface AllPositionsProps {
    pnlData: PnLEntry[];
}

export default function AllPositions({ pnlData }: AllPositionsProps) {
    return (
        <Card>
            <CardHeader title="All Positions & PnL" />
            {pnlData.length === 0 ? (
                <div className="text-center py-10 text-[12px] text-text-dim">No positions yet</div>
            ) : (
                <CardBody className="space-y-3">
                    {pnlData.map((p) => (
                        <div
                            key={p.user}
                            className="bg-surface-2 border border-border rounded-xl p-3.5"
                        >
                            <div className="font-display font-bold text-[13px] text-white mb-3">
                                {p.user}
                            </div>
                            <div className="grid grid-cols-3 gap-1.5">
                                {(
                                    [
                                        ["YES", fmt(p.YES), "text-yes"],
                                        ["NO", fmt(p.NO), "text-no"],
                                        ["Mark Value", fmtUSDC(p.markValue), "text-text"],
                                        ["Net Invested", fmtUSDC(p.netInvested), "text-text"],
                                    ] as const
                                ).map(([label, value, color]) => (
                                    <div
                                        key={label}
                                        className="bg-surface border border-border rounded-md p-2"
                                    >
                                        <div className="text-[9px] uppercase tracking-widest text-text-dim mb-0.5">
                                            {label}
                                        </div>
                                        <div className={`text-[13px] font-bold ${color}`}>
                                            {value}
                                        </div>
                                    </div>
                                ))}
                                <div className="col-span-2 bg-surface border border-border rounded-md p-2">
                                    <div className="text-[9px] uppercase tracking-widest text-text-dim mb-0.5">
                                        Unrealized PnL
                                    </div>
                                    <div
                                        className={`text-[13px] font-bold ${p.unrealizedPnL >= 0 ? "text-yes" : "text-no"}`}
                                    >
                                        {p.unrealizedPnL >= 0 ? "+" : ""}
                                        {fmtUSDC(p.unrealizedPnL)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </CardBody>
            )}
        </Card>
    );
}
