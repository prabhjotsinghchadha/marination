import type { EventDetails } from "@/product/sections/event/types";

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
}): EventDetails {
  const endDate = new Date(props.endTime);
  const endTimeText = Number.isNaN(endDate.getTime()) ? "end time" : endDate.toUTCString();

  const yesProbability = 50;
  const noProbability = 50;
  const yesPriceCents = 50;
  const noPriceCents = 50;

  return {
    slug: props.slug,
    category: "Music prediction market",
    title: props.question,
    summary: props.description ?? props.question,
    notes: props.description ?? "",
    rules: [],
    timelineAndPayout: `The market closes at ${endTimeText}. Winning "${props.yesLabel}" settles at $1.00 and losing "${props.noLabel}" settles at $0.00.`,
    prohibitions: "",
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
