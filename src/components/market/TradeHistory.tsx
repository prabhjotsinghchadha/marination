"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { fmt, fmtPct, fmtUSDC } from "@/libs/formatters";
import { Trade } from "@/libs/amm";

interface TradeHistoryProps {
    trades: Trade[];
}

export default function TradeHistory({ trades }: TradeHistoryProps) {
    return (
        <Card>
            <CardHeader
                title="Trade History"
                right={<span className="text-[11px] text-text-dim">{trades.length} events</span>}
            />
            {trades.length === 0 ? (
                <div className="text-center py-10 text-[12px] text-text-dim">No trades yet</div>
            ) : (
                <div className="max-h-80 overflow-y-auto scrollbar-thin">
                    <table className="w-full text-[11px] border-collapse">
                        <thead>
                            <tr>
                                {["#", "User", "Type", "Side", "In", "Out", "YES Price"].map(
                                    (h) => (
                                        <th
                                            key={h}
                                            className="px-2.5 py-2 text-left text-[9px] uppercase tracking-widest text-text-dim border-b border-border font-bold"
                                        >
                                            {h}
                                        </th>
                                    )
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {[...trades].reverse().map((t, i) => (
                                <tr key={i} className="hover:bg-surface-2 transition-colors">
                                    <td className="px-2.5 py-2 text-text-dim">{t.timestamp}</td>
                                    <td className="px-2.5 py-2 font-bold">{t.user}</td>
                                    <td
                                        className={`px-2.5 py-2 ${t.type === "buy" ? "text-blue-300" : "text-gold"}`}
                                    >
                                        {t.type}
                                    </td>
                                    <td
                                        className={`px-2.5 py-2 ${t.side === "YES" ? "text-yes" : "text-no"}`}
                                    >
                                        {t.side}
                                    </td>
                                    <td className="px-2.5 py-2">
                                        {t.type === "buy" && t.amount != null
                                            ? fmtUSDC(t.amount)
                                            : `${fmt(t.shares ?? 0)} sh`}
                                    </td>
                                    <td className="px-2.5 py-2">
                                        {t.type === "buy" && t.tokensOut != null
                                            ? `${fmt(t.tokensOut)} tk`
                                            : fmtUSDC(t.netOut ?? 0)}
                                    </td>
                                    <td className="px-2.5 py-2 text-text-dim">
                                        {fmtPct(t.yesPrice)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
}
