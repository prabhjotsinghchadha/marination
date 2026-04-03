import type { EventDetails, EventVisualMode } from "@/product/sections/event/types";

/** Validates and trims an optional public https image URL for event payloads. */
export function normalizeOptionalImageUrl(raw: string | null | undefined): string | undefined {
  if (raw == null) {
    return undefined;
  }
  const s = raw.trim();
  if (s === "") {
    return undefined;
  }
  try {
    const u = new URL(s);
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      return undefined;
    }
    return s;
  } catch {
    return undefined;
  }
}

/**
 * Builds the `EventDetails` payload stored on `market_events` for the public event page.
 */
export function buildEventDetailsFromCreateRequest(props: {
  slug: string;
  question: string;
  description: string | null | undefined;
  endTime: string;
  initialLiquidity: number;
  yesLabel: string;
  noLabel: string;
  visualMode: EventVisualMode;
  heroImageUrl?: string | null;
  yesImageUrl?: string | null;
  noImageUrl?: string | null;
}): EventDetails {
  const endDate = new Date(props.endTime);
  const endTimeText = Number.isNaN(endDate.getTime()) ? "end time" : endDate.toUTCString();

  const yesProbability = 50;
  const noProbability = 50;
  const yesPriceCents = 50;
  const noPriceCents = 50;

  const yesImage = normalizeOptionalImageUrl(props.yesImageUrl);
  const noImage = normalizeOptionalImageUrl(props.noImageUrl);
  const hero = normalizeOptionalImageUrl(props.heroImageUrl);

  const isComparison = props.visualMode === "comparison";

  return {
    slug: props.slug,
    category: "Music prediction market",
    title: props.question,
    summary: props.description ?? props.question,
    notes: props.description ?? "",
    rules: [],
    timelineAndPayout: `The market closes at ${endTimeText}. Winning "${props.yesLabel}" settles at $1.00 and losing "${props.noLabel}" settles at $0.00.`,
    prohibitions: "",
    visualMode: props.visualMode,
    ...(props.visualMode === "single" && hero !== undefined ? { heroImageUrl: hero } : {}),
    options: [
      {
        id: "yes",
        name: props.yesLabel,
        probability: yesProbability,
        yesPriceCents,
        noPriceCents,
        avatarLabel: "YES",
        avatarStartColor: "#F7941D",
        avatarEndColor: "#FFD16F",
        ...(isComparison && yesImage !== undefined ? { imageUrl: yesImage } : {}),
      },
      {
        id: "no",
        name: props.noLabel,
        probability: noProbability,
        yesPriceCents: yesPriceCents,
        noPriceCents: noPriceCents,
        avatarLabel: "NO",
        avatarStartColor: "#6D28D9",
        avatarEndColor: "#C4B5FD",
        ...(isComparison && noImage !== undefined ? { imageUrl: noImage } : {}),
      },
    ],
    chart: {
      labels: ["D-6", "D-5", "D-4", "D-3", "D-2", "D-1", "D-0"],
      yTicks: [60, 50, 40, 30, 20],
      volumeLabel: `$${props.initialLiquidity.toFixed(0)} liquidity`,
      series: [
        {
          id: "yes",
          label: props.yesLabel,
          color: "#FFAE42",
          points: [50, 50, 50, 50, 50, 50, 50],
        },
        {
          id: "no",
          label: props.noLabel,
          color: "#F2F2F7",
          points: [50, 50, 50, 50, 50, 50, 50],
        },
      ],
    },
    relatedMarkets: [],
    comments: [],
  };
}
