import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import eventData from "@/product/sections/event/data.json";
import type { EventData } from "@/product/sections/event/types";
import { routing } from "@/libs/I18nRouting";
import { EventSection } from "@/sections/event/EventSection";

type EventSlugPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

const typedEventData = eventData as EventData;

export function generateStaticParams() {
  return routing.locales
    .map(locale => typedEventData.events.map(event => ({ locale, slug: event.slug })))
    .flat(1);
}

export async function generateMetadata(props: EventSlugPageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const event = typedEventData.events.find(item => item.slug === slug);

  return {
    title: event?.title ?? "Event",
    description: event?.summary ?? "Event market details",
  };
}

export default async function EventSlugPage(props: EventSlugPageProps) {
  const { locale, slug } = await props.params;
  setRequestLocale(locale);

  const event = typedEventData.events.find(item => item.slug === slug);

  if (!event) {
    notFound();
  }

  return <EventSection slug={slug} />;
}

export const dynamicParams = false;
