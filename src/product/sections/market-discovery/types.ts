export type MarketType = 'binary' | 'multi';

export type SortOption = 'trending' | 'volume' | 'newest' | 'closing-soon';

export interface SortOptionItem {
  value: SortOption;
  label: string;
}

export interface MarketOutcome {
  label: string;
  /** Integer 0–100 */
  probability: number;
}

export interface Market {
  id: string;
  /** Display variant: binary (yes/no) or multi (multiple outcomes) */
  type: MarketType;
  /** Emoji icon shown on the card */
  icon: string;
  question: string;
  category: string;
  artist: string;
  /** For binary markets: YES probability as a decimal (0–1); for multi: top-outcome probability */
  yesProbability: number;
  /** For multi-outcome markets: list of outcomes */
  outcomes?: MarketOutcome[];
  /** Total dollar volume traded */
  volume: number;
  liquidity: number;
  /** ISO 8601 resolution deadline */
  closingDate: string;
  createdAt: string;
  /** Percentage-point price change since last period */
  priceMovement: number;
  /** YES probability values (0–1), oldest first, for sparklines */
  priceHistory: number[];
  isTrending: boolean;
  isNew: boolean;
}

export interface BreakingNewsItem {
  id: string;
  question: string;
  /** Integer 0–100 */
  probability: number;
  change: number;
  direction: 'up' | 'down';
}

export interface HotTopic {
  label: string;
  volume: string;
  isHot: boolean;
}

export interface MarketDiscoveryProps {
  markets: Market[];
  categories: string[];
  filterPills: string[];
  activeCategory: string;
  activeFilterPill: string;
  searchQuery: string;
  isLoadingMore: boolean;
  hasMore: boolean;
  breakingNews: BreakingNewsItem[];
  hotTopics: HotTopic[];
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: string) => void;
  onFilterPillChange: (pill: string) => void;
  onMarketClick: (marketId: string) => void;
  /** outcomeIndex is provided for multi-outcome markets */
  onYesClick: (marketId: string, outcomeIndex?: number) => void;
  onNoClick: (marketId: string, outcomeIndex?: number) => void;
  onLoadMore: () => void;
}

