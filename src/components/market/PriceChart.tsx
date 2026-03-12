"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ReferenceLine,
    ResponsiveContainer,
    TooltipProps,
} from "recharts";
import { Card, CardHeader } from "@/components/ui/Card";
import { fmtPct } from "@/libs/formatters";
import { COLORS } from "@/libs/constants";
import { Trade } from "@/libs/amm";

interface ChartDataPoint {
    timestamp: number;
    yesPrice: number;
}

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload as ChartDataPoint;
    return (
        <div className="bg-surface border border-border rounded-lg px-3 py-2 text-[11px]">
            <div className="font-bold text-yes">YES: {fmtPct(d.yesPrice)}</div>
            <div className="text-no">NO: {fmtPct(1 - d.yesPrice)}</div>
            <div className="text-text-dim mt-0.5">Tick #{d.timestamp}</div>
        </div>
    );
}

interface PriceChartProps {
    trades: Trade[];
    currentPrice: number;
}

export default function PriceChart({ trades, currentPrice }: PriceChartProps) {
    const chartData: ChartDataPoint[] =
        trades.length > 0
            ? trades.map((t) => ({ timestamp: t.timestamp, yesPrice: t.yesPrice }))
            : [{ timestamp: 0, yesPrice: currentPrice }];

    return (
        <Card>
            <CardHeader
                title="YES Price Chart"
                right={<span className="text-[11px] text-text-dim">{trades.length} trades</span>}
            />
            <div className="h-[200px] px-2 py-3">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                        <defs>
                            <linearGradient id="yesGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.yes} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={COLORS.yes} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="timestamp"
                            tick={{ fontSize: 9, fill: COLORS.textDim, fontFamily: "Space Mono" }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            domain={[0, 1]}
                            tickFormatter={(v: number) => `${(v * 100).toFixed(0)}¢`}
                            tick={{ fontSize: 9, fill: COLORS.textDim, fontFamily: "Space Mono" }}
                            axisLine={false}
                            tickLine={false}
                            width={36}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine
                            y={0.5}
                            stroke="rgba(255,255,255,0.1)"
                            strokeDasharray="4 4"
                        />
                        <Area
                            type="monotone"
                            dataKey="yesPrice"
                            stroke={COLORS.yes}
                            strokeWidth={2}
                            fill="url(#yesGrad)"
                            dot={false}
                            activeDot={{ r: 4, fill: COLORS.yes }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
