"use client";

import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Market } from "@/lib/amm";

interface HeaderProps {
  market: Market | null;
  marketName: string;
  onNewMarket: () => void;
}

export default function Header({ market, marketName, onNewMarket }: HeaderProps) {
  return (
    <header className="border-b border-border py-5 mb-6 flex items-center gap-5 flex-wrap">
      <h1 className="font-display text-[22px] font-extrabold tracking-tight text-white">
        AMM <span className="text-yes">TESTBED</span>
      </h1>

      {market && (
        <>
          <span className="text-[11px] px-2.5 py-1 rounded bg-white/5 border border-border text-white max-w-xs truncate">
            {marketName}
          </span>
          <Badge variant={market.resolved ? "resolved" : "live"}>
            {market.resolved ? `RESOLVED: ${market.outcome}` : "● LIVE"}
          </Badge>
        </>
      )}

      <div className="ml-auto flex items-center gap-2">
        <Link
          href="/AMM"
          className="px-3 py-1.5 bg-surface-3 text-text border border-border rounded-md text-[11px] font-bold font-mono hover:text-white transition-colors"
        >
          AMM Stress Test →
        </Link>
        <Link
          href="/glossary"
          className="px-3 py-1.5 bg-surface-3 text-text border border-border rounded-md text-[11px] font-bold font-mono hover:text-white transition-colors"
        >
          Glossary →
        </Link>
        <Button variant="neutral" size="sm" onClick={onNewMarket}>
          {market ? "New Market" : "Create Market"}
        </Button>
      </div>
    </header>
  );
}
