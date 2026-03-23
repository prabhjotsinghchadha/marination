"use client";

import { useState } from "react";
import { DS } from "@/product/design-system/colors";
import type { EventDetails, EventOption } from "@/product/sections/event/types";
import { MarketFooter } from "@/sections/market-discovery/components/MarketFooter";

type EventMarketProps = {
  event: EventDetails;
};

type EventTab = "comments" | "activity";

function formatCurrency(amount: number) {
  return `$${amount.toFixed(2)}`;
}

function buildSeriesPath(points: number[], width: number, height: number, min: number, max: number) {
  if (points.length < 2) {
    return "";
  }

  const xStep = width / (points.length - 1);
  const yRange = Math.max(1, max - min);
  return points
    .map((point, index) => {
      const x = index * xStep;
      const normalized = (point - min) / yRange;
      const y = height - normalized * height;
      return `${x},${y}`;
    })
    .join(" ");
}

function Avatar(props: {
  label: string;
  startColor: string;
  endColor: string;
  size?: number;
}) {
  const size = props.size ?? 40;

  return (
    <div
      className="grid shrink-0 place-items-center rounded-full font-semibold text-[#121212]"
      style={{
        width: size,
        height: size,
        fontSize: size <= 28 ? 10 : 12,
        background: `linear-gradient(135deg, ${props.startColor}, ${props.endColor})`,
      }}
      aria-hidden
    >
      {props.label}
    </div>
  );
}

function OptionRow(props: {
  option: EventOption;
  selectedOptionId: string | null;
  onSelectYes: (optionId: string) => void;
  onSelectNo: (optionId: string) => void;
}) {
  const isSelected = props.selectedOptionId === props.option.id;

  return (
    <div className="flex items-center gap-3 border-b py-3" style={{ borderColor: DS.bgSurface }}>
      <Avatar
        label={props.option.avatarLabel}
        startColor={props.option.avatarStartColor}
        endColor={props.option.avatarEndColor}
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm" style={{ color: DS.textPrimary }}>
          {props.option.name}
        </p>
      </div>

      <p className="w-12 text-right text-base font-bold tabular-nums" style={{ color: DS.textPrimary }}>
        {props.option.probability}%
      </p>

      <button
        type="button"
        onClick={() => props.onSelectYes(props.option.id)}
        className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
        style={{
          borderColor: DS.success,
          color: DS.success,
          background: isSelected ? DS.successBg : "transparent",
        }}
      >
        Yes {props.option.yesPriceCents}
      </button>
      <button
        type="button"
        onClick={() => props.onSelectNo(props.option.id)}
        className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
        style={{
          borderColor: DS.error,
          color: DS.error,
          background: "transparent",
        }}
      >
        No {props.option.noPriceCents}
      </button>
    </div>
  );
}

function MiniChart(props: { event: EventDetails }) {
  const width = 500;
  const height = 160;
  const maxTick = Math.max(...props.event.chart.yTicks, ...props.event.chart.series.flatMap(x => x.points));
  const minTick = Math.min(...props.event.chart.yTicks, ...props.event.chart.series.flatMap(x => x.points));

  return (
    <section className="rounded-xl border p-4" style={{ borderColor: DS.bgSurface, background: DS.bgDark }}>
      <div className="mb-2 flex items-center gap-4">
        {props.event.chart.series.map(series => (
          <div key={series.id} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: series.color }} />
            <span className="text-xs" style={{ color: DS.textPrimary }}>
              {series.label}
            </span>
          </div>
        ))}
      </div>

      <p className="mb-3 text-right text-xs" style={{ color: DS.accentLightGray }}>
        {props.event.chart.volumeLabel}
      </p>

      <svg viewBox={`0 0 ${width} ${height + 24}`} className="w-full">
        {props.event.chart.yTicks.map((tick, index) => {
          const y = ((maxTick - tick) / Math.max(1, maxTick - minTick)) * height;
          return (
            <g key={tick}>
              <line x1={0} y1={y} x2={width} y2={y} stroke={DS.bgSurface} strokeWidth="1" />
              <text x={2} y={y - 2} fill={DS.accentLightGray} fontSize="10">
                {tick}
              </text>
            </g>
          );
        })}

        {props.event.chart.series.map((series, index) => (
          <polyline
            key={series.id}
            fill="none"
            stroke={series.color}
            strokeWidth="2"
            strokeDasharray={index === 1 ? "5 4" : undefined}
            points={buildSeriesPath(series.points, width, height, minTick, maxTick)}
          />
        ))}

        {props.event.chart.labels.map((label, index) => {
          const x = (index / Math.max(1, props.event.chart.labels.length - 1)) * width;
          return (
            <text key={label} x={x} y={height + 16} fill={DS.accentLightGray} fontSize="10" textAnchor="middle">
              {label}
            </text>
          );
        })}
      </svg>
    </section>
  );
}

export function EventMarket(props: EventMarketProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(props.event.options[0]?.id ?? null);
  const [activeTab, setActiveTab] = useState<EventTab>("comments");
  const [amount, setAmount] = useState(0);
  const [comment, setComment] = useState("");
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isProhibitionsOpen, setIsProhibitionsOpen] = useState(false);

  const selectedOption =
    props.event.options.find(option => option.id === selectedOptionId) ?? props.event.options[0];
  const rewardMultiple = selectedOption ? 1 / (selectedOption.yesPriceCents / 100) : 1;
  const potentialReward = amount > 0 ? amount * rewardMultiple : 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: DS.bgDarkest, color: DS.textPrimary }}>
      <main className="mx-auto w-full max-w-3xl px-4 pb-10 pt-6 sm:px-6">
        <p className="mb-2 text-sm" style={{ color: DS.accentGray }}>
          {props.event.category}
        </p>
        <h1 className="mb-4 text-2xl font-bold leading-tight sm:text-3xl">{props.event.title}</h1>
        <p className="mb-5 text-sm leading-6" style={{ color: DS.textSecondary }}>
          {props.event.summary}
        </p>

        <MiniChart event={props.event} />

        <div className="mt-4 rounded-xl border p-4" style={{ borderColor: DS.bgSurface, background: DS.bgDark }}>
          <div className="mb-2 flex justify-end">
            <span className="text-xs" style={{ color: DS.accentGray }}>
              Odds
            </span>
          </div>
          {props.event.options.map(option => (
            <OptionRow
              key={option.id}
              option={option}
              selectedOptionId={selectedOptionId}
              onSelectYes={setSelectedOptionId}
              onSelectNo={setSelectedOptionId}
            />
          ))}
        </div>

        <section className="mt-4 rounded-xl border p-4" style={{ borderColor: DS.bgSurface, background: DS.bgDark }}>
          <p className="mb-4 text-sm font-semibold">{props.event.title}</p>

          <div className="mb-4 flex gap-2">
            {props.event.options.map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedOptionId(option.id)}
                className="flex-1 rounded-lg border px-3 py-2 text-xs font-semibold"
                style={{
                  borderColor: selectedOptionId === option.id ? DS.success : DS.bgSurface,
                  color: selectedOptionId === option.id ? DS.success : DS.textPrimary,
                  background: selectedOptionId === option.id ? DS.successBg : "transparent",
                }}
              >
                {option.name} {option.yesPriceCents}c
              </button>
            ))}
          </div>

          <div className="mb-3 flex items-end justify-between">
            <p className="text-sm font-semibold">Amount</p>
            <p className="text-3xl font-bold tabular-nums" style={{ color: DS.accentLightGray }}>
              {formatCurrency(amount)}
            </p>
          </div>

          <div className="mb-4 flex gap-2">
            {[1, 20, 100].map(preset => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(previous => previous + preset)}
                className="flex-1 rounded-lg border px-3 py-2 text-xs font-semibold"
                style={{ borderColor: DS.bgSurface }}
              >
                +${preset}
              </button>
            ))}
          </div>

          <div className="mb-4 flex items-end justify-between border-t pt-3" style={{ borderColor: DS.bgSurface }}>
            <p className="text-sm font-semibold">Potential reward</p>
            <p className="text-lg font-bold tabular-nums" style={{ color: DS.success }}>
              {formatCurrency(potentialReward)}
            </p>
          </div>

          <button
            type="button"
            className="w-full rounded-lg py-3 text-sm font-semibold"
            style={{ background: DS.accentPrimary, color: DS.neutralDark }}
          >
            Submit
          </button>
        </section>

        <section className="mt-4 rounded-xl border p-4" style={{ borderColor: DS.bgSurface, background: DS.bgDark }}>
          <h2 className="mb-2 text-xl font-bold">Rule summary</h2>
          <p className="text-sm leading-6" style={{ color: DS.textSecondary }}>
            {props.event.summary}
          </p>
          <p className="mt-2 text-sm leading-6" style={{ color: DS.textSecondary }}>
            {props.event.notes}
          </p>

          <ul className="mt-3 space-y-2 text-sm leading-6" style={{ color: DS.textSecondary }}>
            {props.event.rules.map(rule => (
              <li key={rule}>- {rule}</li>
            ))}
          </ul>
        </section>

        <section className="mt-4 rounded-xl border" style={{ borderColor: DS.bgSurface, background: DS.bgDark }}>
          <button
            type="button"
            onClick={() => setIsTimelineOpen(current => !current)}
            className="flex w-full items-center justify-between px-4 py-3 text-left"
          >
            <span className="text-lg font-bold">Timeline and payout</span>
            <span style={{ color: DS.accentGray }}>{isTimelineOpen ? "−" : "+"}</span>
          </button>
          {isTimelineOpen && (
            <p className="border-t px-4 pb-4 pt-3 text-sm leading-6" style={{ borderColor: DS.bgSurface, color: DS.textSecondary }}>
              {props.event.timelineAndPayout}
            </p>
          )}
        </section>

        <section className="mt-3 rounded-xl border" style={{ borderColor: DS.bgSurface, background: DS.bgDark }}>
          <button
            type="button"
            onClick={() => setIsProhibitionsOpen(current => !current)}
            className="flex w-full items-center justify-between px-4 py-3 text-left"
          >
            <span className="text-lg font-bold">Predicting prohibitions</span>
            <span style={{ color: DS.accentGray }}>{isProhibitionsOpen ? "−" : "+"}</span>
          </button>
          {isProhibitionsOpen && (
            <p className="border-t px-4 pb-4 pt-3 text-sm leading-6" style={{ borderColor: DS.bgSurface, color: DS.textSecondary }}>
              {props.event.prohibitions}
            </p>
          )}
        </section>

        <section className="mt-4 rounded-xl border p-4" style={{ borderColor: DS.bgSurface, background: DS.bgDark }}>
          <h2 className="mb-2 text-xl font-bold">People also predicting</h2>
          <div className="space-y-3">
            {props.event.relatedMarkets.map(market => (
              <div key={market.id} className="rounded-lg border p-3" style={{ borderColor: DS.bgSurface }}>
                <p className="text-xs uppercase tracking-wide" style={{ color: DS.accentGray }}>
                  {market.category}
                </p>
                <p className="mt-1 text-sm">{market.title}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-4 rounded-xl border p-4" style={{ borderColor: DS.bgSurface, background: DS.bgDark }}>
          <div className="mb-4 flex gap-6 border-b" style={{ borderColor: DS.bgSurface }}>
            <button
              type="button"
              onClick={() => setActiveTab("comments")}
              className="pb-2 text-lg font-bold"
              style={{
                color: activeTab === "comments" ? DS.textPrimary : DS.accentGray,
                borderBottom: `2px solid ${activeTab === "comments" ? DS.accentPrimary : "transparent"}`,
              }}
            >
              Comments
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("activity")}
              className="pb-2 text-lg font-bold"
              style={{
                color: activeTab === "activity" ? DS.textPrimary : DS.accentGray,
                borderBottom: `2px solid ${activeTab === "activity" ? DS.accentPrimary : "transparent"}`,
              }}
            >
              Activity
            </button>
          </div>

          <div className="mb-4 flex gap-2 rounded-xl border p-2" style={{ borderColor: DS.bgSurface }}>
            <input
              value={comment}
              onChange={event => setComment(event.target.value)}
              placeholder="Add a comment"
              className="w-full bg-transparent px-2 text-sm outline-none"
              style={{ color: DS.textPrimary }}
            />
            <button
              type="button"
              className="rounded-lg px-3 py-1.5 text-xs font-semibold"
              style={{ background: DS.accentPrimary, color: DS.neutralDark }}
            >
              Post
            </button>
          </div>

          {activeTab === "comments" ? (
            <div className="space-y-3">
              {props.event.comments.map(item => (
                <div key={item.id} className="flex gap-3 rounded-lg border p-3" style={{ borderColor: DS.bgSurface }}>
                  <Avatar
                    label={item.avatarLabel}
                    startColor={item.avatarStartColor}
                    endColor={item.avatarEndColor}
                    size={32}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{item.username}</p>
                      <p className="text-xs" style={{ color: DS.accentGray }}>
                        {item.timeAgo}
                      </p>
                    </div>
                    <p className="mt-1 text-sm" style={{ color: DS.textSecondary }}>
                      {item.pick}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: DS.textSecondary }}>
              Recent order and fill activity will appear here.
            </p>
          )}
        </section>
      </main>

      <MarketFooter />
    </div>
  );
}
