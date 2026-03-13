"use client";

import { useState } from "react";
import data from "@/product/sections/market-discovery/data.json";
import type { SortOption, Market } from "@/product/sections/market-discovery/types";
import { MarketDiscovery } from "./components/MarketDiscovery";

const expandedMarkets = [
  ...data.markets,
  ...data.markets.map((market) => ({
    ...market,
    id: `${market.id}-b`,
    yesProbability: Math.max(0.05, Math.min(0.95, market.yesProbability + 0.04)),
    outcomes: market.outcomes?.map((outcome) => ({
      ...outcome,
      probability: Math.max(1, Math.min(95, outcome.probability + 2)),
    })),
  })),
] as Market[];

export function MarketDiscoverySection() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeSort, setActiveSort] = useState<SortOption>("trending");
  const [activeFilterPill, setActiveFilterPill] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => setIsLoadingMore(false), 1200);
  };

  return (
    <MarketDiscovery
      markets={expandedMarkets}
      categories={data.categories}
      filterPills={data.filterPills}
      sortOptions={data.sortOptions as any}
      activeCategory={activeCategory}
      activeSort={activeSort}
      activeFilterPill={activeFilterPill}
      searchQuery={searchQuery}
      isLoadingMore={isLoadingMore}
      hasMore
      breakingNews={data.breakingNews as any}
      hotTopics={data.hotTopics}
      onSearchChange={setSearchQuery}
      onCategoryChange={setActiveCategory}
      onSortChange={setActiveSort}
      onFilterPillChange={setActiveFilterPill}
      onMarketClick={(id) => console.log("View market:", id)}
      onYesClick={(id, index) => console.log("YES on market:", id, "outcome:", index)}
      onNoClick={(id, index) => console.log("NO on market:", id, "outcome:", index)}
      onLoadMore={handleLoadMore}
    />
  );
}

