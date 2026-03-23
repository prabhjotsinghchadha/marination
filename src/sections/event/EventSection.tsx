"use client";

import eventData from "@/product/sections/event/data.json";
import type { EventData } from "@/product/sections/event/types";
import { EventMarket } from "./components/EventMarket";

type EventSectionProps = {
  slug: string;
};

const typedEventData = eventData as EventData;

export function EventSection(props: EventSectionProps) {
  const event = typedEventData.events.find(item => item.slug === props.slug);

  if (!event) {
    return null;
  }

  return <EventMarket event={event} />;
}
