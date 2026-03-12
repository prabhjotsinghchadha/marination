"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { DEFAULT_MARKET_CONFIG } from "@/libs/constants";
import { fmtUSDC } from "@/libs/formatters";

export interface CreateMarketConfig {
    name: string;
    liquidity: number;
    fee: number;
}

interface CreateMarketModalProps {
    onClose: () => void;
    onCreate: (config: CreateMarketConfig) => void;
}

export default function CreateMarketModal({ onClose, onCreate }: CreateMarketModalProps) {
    const [name, setName] = useState<string>(DEFAULT_MARKET_CONFIG.name);
    const [liquidity, setLiquidity] = useState<string>(DEFAULT_MARKET_CONFIG.liquidity);
    const [fee, setFee] = useState<string>(DEFAULT_MARKET_CONFIG.fee);

    const totalPool = fmtUSDC(parseFloat(liquidity) * 2 || 0);

    const handleCreate = (): void => {
        onCreate({
            name,
            liquidity: parseFloat(liquidity),
            fee: parseFloat(fee) / 100,
        });
    };

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
            onClick={onClose}
        >
            <div
                className="bg-surface border border-border rounded-2xl p-6 w-[400px] max-w-[calc(100vw-2rem)]"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="font-display text-[18px] font-extrabold text-white mb-5">
                    ⚡ Create Market
                </h2>

                <div className="mb-4">
                    <label className="block text-[10px] uppercase tracking-widest text-text-dim mb-1.5">
                        Market Question
                    </label>
                    <input
                        className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-text text-sm font-mono outline-none focus:border-accent transition-colors"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Will X happen?"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-[10px] uppercase tracking-widest text-text-dim mb-1.5">
                        Initial Liquidity (USDC per side)
                    </label>
                    <input
                        type="number"
                        min="10"
                        className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-text text-sm font-mono outline-none focus:border-accent transition-colors"
                        value={liquidity}
                        onChange={(e) => setLiquidity(e.target.value)}
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-[10px] uppercase tracking-widest text-text-dim mb-1.5">
                        Fee (%)
                    </label>
                    <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-text text-sm font-mono outline-none focus:border-accent transition-colors"
                        value={fee}
                        onChange={(e) => setFee(e.target.value)}
                    />
                </div>

                <Alert variant="info" className="mb-4">
                    Starts at 50/50. Pool = {totalPool} total. Alice is the initial LP.
                </Alert>

                <Button variant="yes" onClick={handleCreate}>
                    Create Market
                </Button>
            </div>
        </div>
    );
}
