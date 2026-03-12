"use client";

import { fmtPct, fmtUSDC, fmt } from "@/libs/formatters";
import { getPrice, Market } from "@/libs/amm";

interface PriceGaugeProps {
    market: Market;
}

export default function PriceGauge({ market }: PriceGaugeProps) {
    const price = getPrice(market);

    return (
        <div>
            <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border">
                <span className="font-display text-[11px] font-bold tracking-widest uppercase text-text-dim">
                    Live Price
                </span>
                <div className="flex gap-4 text-[11px] font-mono text-text-dim">
                    <span>
                        Vol <span className="text-text">{fmtUSDC(market.volume)}</span>
                    </span>
                    <span>
                        Fees <span className="text-text">{fmtUSDC(market.feePool)}</span>
                    </span>
                </div>
            </div>

            <div className="px-4 pt-5 pb-4 text-center">
                {market.resolved && (
                    <div className="bg-gold-dim border border-gold-border rounded-xl px-4 py-3 mb-4 text-center">
                        <div className="text-[10px] uppercase tracking-widest text-gold mb-1">
                            Market Resolved
                        </div>
                        <div
                            className={`font-display text-4xl font-extrabold ${
                                market.outcome === "YES" ? "text-yes" : "text-no"
                            }`}
                        >
                            {market.outcome}
                        </div>
                    </div>
                )}

                <div className="relative h-2.5 rounded-full bg-no-dim border border-no-border overflow-hidden mb-2.5">
                    <div
                        className="price-fill absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-yes to-[#00c888] transition-all duration-500"
                        style={{ width: `${price.yes * 100}%` }}
                    />
                </div>

                <div className="flex justify-between text-[11px] text-text-dim mb-4">
                    <span className="text-yes">YES</span>
                    <span>50¢</span>
                    <span className="text-no">NO</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-yes-dim border border-yes-border rounded-lg p-2.5 text-center">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-yes mb-1">
                            YES
                        </div>
                        <div className="font-display text-3xl font-extrabold text-yes leading-none">
                            {(price.yes * 100).toFixed(1)}¢
                        </div>
                        <div className="text-[10px] text-text-dim mt-0.5">
                            {fmtPct(price.yes)} implied
                        </div>
                    </div>
                    <div className="bg-no-dim border border-no-border rounded-lg p-2.5 text-center">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-no mb-1">
                            NO
                        </div>
                        <div className="font-display text-3xl font-extrabold text-no leading-none">
                            {(price.no * 100).toFixed(1)}¢
                        </div>
                        <div className="text-[10px] text-text-dim mt-0.5">
                            {fmtPct(price.no)} implied
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 border-t border-border">
                {(
                    [
                        ["YES Pool", fmt(market.yesPool), "text-yes"],
                        ["NO Pool", fmt(market.noPool), "text-no"],
                        ["k = x·y", fmt(market.k, 0), "text-text"],
                    ] as const
                ).map(([label, value, color]) => (
                    <div key={label} className="px-3 py-2.5 border-r last:border-r-0 border-border">
                        <div className="text-[9px] uppercase tracking-widest text-text-dim mb-1">
                            {label}
                        </div>
                        <div className={`text-[13px] font-bold ${color}`}>{value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
