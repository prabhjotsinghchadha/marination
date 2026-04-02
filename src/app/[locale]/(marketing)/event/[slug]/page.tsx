import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { EventSection } from "@/sections/event/EventSection";
import type { EventDetails } from "@/product/sections/event/types";
import { db } from "@/libs/DB";
import { marketEvents, markets } from "@/models/Schema";
import { and, eq } from "drizzle-orm";

type EventSlugPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

const EVENT_TYPE_MARKET_CREATED = "MARKET_CREATED";

export async function generateMetadata(props: EventSlugPageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const event = await getEventDetailsFromDb(slug);

  return {
    title: event?.title ?? "Event",
    description: event?.summary ?? "Event market details",
  };
}

async function getEventDetailsFromDb(slug: string): Promise<EventDetails | null> {
  const market = await db.query.markets.findFirst({
    where: eq(markets.slug, slug),
    columns: { id: true },
  });

  if (!market) return null;

  const marketEvent = await db.query.marketEvents.findFirst({
    where: and(eq(marketEvents.marketId, market.id), eq(marketEvents.eventType, EVENT_TYPE_MARKET_CREATED)),
    columns: { payload: true },
  });

  if (!marketEvent?.payload) return null;
  return marketEvent.payload as unknown as EventDetails;
}

export default async function EventSlugPage(props: EventSlugPageProps) {
  const { locale, slug } = await props.params;
  setRequestLocale(locale);

  const event = await getEventDetailsFromDb(slug);

  if (!event) {
    notFound();
  }

  return <EventSection event={event} />;
}

export const dynamicParams = true;
export const dynamic = "force-dynamic";
