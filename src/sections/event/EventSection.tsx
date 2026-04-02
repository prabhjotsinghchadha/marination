"use client";

import { EventMarket } from "./components/EventMarket";
import type { EventDetails } from "@/product/sections/event/types";

type EventSectionProps = {
  event: EventDetails;
};

export function EventSection(props: EventSectionProps) {
  return <EventMarket event={props.event} />;
}
