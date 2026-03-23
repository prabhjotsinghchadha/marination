export interface EventOption {
  id: string;
  name: string;
  probability: number;
  yesPriceCents: number;
  noPriceCents: number;
  avatarLabel: string;
  avatarStartColor: string;
  avatarEndColor: string;
}

export interface EventChartSeries {
  id: string;
  label: string;
  color: string;
  points: number[];
}

export interface EventChart {
  labels: string[];
  yTicks: number[];
  volumeLabel: string;
  series: EventChartSeries[];
}

export interface EventComment {
  id: string;
  username: string;
  pick: string;
  timeAgo: string;
  avatarLabel: string;
  avatarStartColor: string;
  avatarEndColor: string;
}

export interface EventRelatedMarket {
  id: string;
  title: string;
  category: string;
}

export interface EventDetails {
  slug: string;
  category: string;
  title: string;
  summary: string;
  notes: string;
  rules: string[];
  timelineAndPayout: string;
  prohibitions: string;
  options: EventOption[];
  chart: EventChart;
  relatedMarkets: EventRelatedMarket[];
  comments: EventComment[];
}

export interface EventData {
  events: EventDetails[];
}
