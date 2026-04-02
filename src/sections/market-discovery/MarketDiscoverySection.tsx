"use client";

import { useEffect, useState } from "react";
import data from "@/product/sections/market-discovery/data.json";
import type { Market } from "@/product/sections/market-discovery/types";
import { useDiscoverSearch } from "@/sections/shell/DiscoverSearchContext";
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
  const [activeFilterPill, setActiveFilterPill] = useState<string>("All");
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const {
    searchQuery,
    setSearchQuery,
    setDiscoverSearchActive,
  } = useDiscoverSearch();

  useEffect(() => {
    setDiscoverSearchActive(true);
    return () => {
      setDiscoverSearchActive(false);
      setSearchQuery("");
    };
  }, [setDiscoverSearchActive, setSearchQuery]);

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => setIsLoadingMore(false), 1200);
  };

  return (
    <MarketDiscovery
      markets={expandedMarkets}
      categories={data.categories}
      filterPills={data.filterPills}
      activeCategory={activeCategory}
      activeFilterPill={activeFilterPill}
      searchQuery={searchQuery}
      isLoadingMore={isLoadingMore}
      hasMore
      breakingNews={data.breakingNews as any}
      hotTopics={data.hotTopics}
      onSearchChange={setSearchQuery}
      onCategoryChange={setActiveCategory}
      onFilterPillChange={setActiveFilterPill}
      onMarketClick={(id) => console.log("View market:", id)}
      onYesClick={(id, index) => console.log("YES on market:", id, "outcome:", index)}
      onNoClick={(id, index) => console.log("NO on market:", id, "outcome:", index)}
      onLoadMore={handleLoadMore}
    />
  );
}

