"use client";

import { useState } from "react";
import { DS as BaseDS } from "@/product/design-system/colors";
import adminData from "@/product/sections/admin-dashboard/data.json";
import type {
  AdminDashboardMockData,
  AdminLedgerTx,
  AdminMarket,
  AdminMarketStatus,
  AdminTrade,
  AdminUser,
} from "@/product/sections/admin-dashboard/types";

const DS = {
  ...BaseDS,
  // Extra tones used by the admin mock UI.
  warning: "#FFD16F",
  warningBg: "#2a2010",
  info: "#60A5FA",
  infoBg: "#1a2535",
} as const;

type View =
  | "overview"
  | "markets"
  | "create-market"
  | "users"
  | "trades"
  | "ledger"
  | "settings";

type MarketStatus = AdminMarketStatus;
type Market = AdminMarket;

type User = AdminUser;

type Trade = AdminTrade;

type LedgerTx = AdminLedgerTx;

const ADMIN_DASHBOARD_DATA = adminData as AdminDashboardMockData;

const MOCK_MARKETS: Market[] = ADMIN_DASHBOARD_DATA.markets;

const MOCK_USERS: User[] = ADMIN_DASHBOARD_DATA.users;

const MOCK_TRADES: Trade[] = ADMIN_DASHBOARD_DATA.trades;

const MOCK_LEDGER: LedgerTx[] = ADMIN_DASHBOARD_DATA.ledger;

const fmtUSD = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(2)}M`
    : n >= 1_000
      ? `$${(n / 1_000).toFixed(1)}K`
      : `$${n}`;

type BadgeColor = { text: string; bg: string; dot: string };

const statusColor: Record<string, BadgeColor> = {
  OPEN: { text: DS.success, bg: DS.successBg, dot: DS.success },
  DRAFT: { text: DS.accentGray, bg: "#202020", dot: DS.accentGray },
  CLOSED: { text: DS.accentLightGray, bg: "#252525", dot: DS.accentLightGray },
  RESOLVED: { text: DS.accentDarker, bg: "#2a1a00", dot: DS.accentDarker },
  POSTED: { text: DS.success, bg: DS.successBg, dot: DS.success },
  PENDING: { text: DS.warning, bg: DS.warningBg, dot: DS.warning },
  SEEN: { text: DS.info, bg: DS.infoBg, dot: DS.info },
};

function StatusBadge(props: { status: string }) {
  const { status } = props;
  const c =
    statusColor[status] ?? {
      text: DS.accentGray,
      bg: DS.bgSurface,
      dot: DS.accentGray,
    };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: c.bg,
        color: c.text,
        fontSize: 11,
        fontWeight: 700,
        padding: "3px 9px",
        borderRadius: 20,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: c.dot,
          flexShrink: 0,
        }}
      />
      {status}
    </span>
  );
}

const NAV: Array<{ id: View; label: string; icon: string; indent?: boolean }> = [
  { id: "overview", label: "Overview", icon: "◈" },
  { id: "markets", label: "Markets", icon: "⊞" },
  { id: "create-market", label: "Create Market", icon: "＋", indent: true },
  { id: "users", label: "Users", icon: "◉" },
  { id: "trades", label: "Trades", icon: "⇄" },
  { id: "ledger", label: "Ledger", icon: "▤" },
  { id: "settings", label: "Settings", icon: "⚙" },
];

function OverviewPage(props: { onNavigate: (v: View) => void }) {
  const totalVolume = MOCK_MARKETS.reduce((s, m) => s + m.volume, 0);
  const activeMarkets = MOCK_MARKETS.filter((m) => m.status === "OPEN").length;
  const totalTrades = MOCK_MARKETS.reduce((s, m) => s + m.trades, 0);
  const totalUsers = MOCK_USERS.length;

  const stats = [
    {
      label: "Total Volume",
      value: fmtUSD(totalVolume),
      sub: "+12.4% this week",
      icon: "◈",
      up: true,
    },
    {
      label: "Active Markets",
      value: String(activeMarkets),
      sub: `of ${MOCK_MARKETS.length} total`,
      icon: "⊞",
      up: null,
    },
    {
      label: "Total Trades",
      value: totalTrades.toLocaleString(),
      sub: "+340 today",
      icon: "⇄",
      up: true,
    },
    {
      label: "Registered Users",
      value: String(totalUsers),
      sub: "+2 this week",
      icon: "◉",
      up: true,
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 26,
            fontWeight: 700,
            color: DS.textPrimary,
            letterSpacing: "-0.02em",
          }}
        >
          Overview
        </h1>
        <p style={{ fontSize: 13, color: DS.textSecondary, marginTop: 4 }}>
          Marination Music · Prediction Market Admin
        </p>
      </div>

      {/* Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              background: DS.bgDark,
              border: `1px solid ${DS.bgSurface}`,
              borderRadius: 14,
              padding: "20px 22px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: 60,
                height: 60,
                background: DS.accentGradient,
                opacity: 0.07,
                borderRadius: "0 14px 0 60px",
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: DS.textSecondary,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {s.label}
              </span>
              <span style={{ fontSize: 18, color: DS.accentDarker }}>{s.icon}</span>
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: DS.textPrimary,
                fontFamily: "'DM Mono', monospace",
                letterSpacing: "-0.03em",
                marginBottom: 6,
              }}
            >
              {s.value}
            </div>
            <div style={{ fontSize: 12, color: s.up === true ? DS.success : DS.textSecondary }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Two-column row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }}>
        {/* Recent Markets */}
        <div
          style={{
            background: DS.bgDark,
            border: `1px solid ${DS.bgSurface}`,
            borderRadius: 14,
          }}
        >
          <div
            style={{
              padding: "18px 20px 12px",
              borderBottom: `1px solid ${DS.bgSurface}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 13, color: DS.textPrimary, letterSpacing: "0.02em" }}>
              Recent Markets
            </span>
            <button
              type="button"
              onClick={() => props.onNavigate("markets")}
              style={{
                background: "none",
                border: "none",
                color: DS.accentDarker,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              View all →
            </button>
          </div>

          {MOCK_MARKETS.slice(0, 4).map((m, i) => (
            <div
              key={m.id}
              style={{
                padding: "13px 20px",
                borderBottom: i < 3 ? `1px solid ${DS.bgDarkest}` : "none",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: DS.textPrimary,
                    marginBottom: 3,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {m.question}
                </p>
                <p style={{ fontSize: 11, color: DS.textSecondary }}>
                  {fmtUSD(m.volume)} · {m.trades} trades
                </p>
              </div>
              <StatusBadge status={m.status} />
            </div>
          ))}
        </div>

        {/* Recent Trades */}
        <div
          style={{
            background: DS.bgDark,
            border: `1px solid ${DS.bgSurface}`,
            borderRadius: 14,
          }}
        >
          <div style={{ padding: "18px 20px 12px", borderBottom: `1px solid ${DS.bgSurface}` }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: DS.textPrimary }}>Live Trade Feed</span>
          </div>

          {MOCK_TRADES.slice(0, 5).map((t, i) => {
            const createdTime = t.createdAt.split(" ")[1] ?? "";
            return (
              <div
                key={t.id}
                style={{
                  padding: "11px 20px",
                  borderBottom: i < 4 ? `1px solid ${DS.bgDarkest}` : "none",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: t.outcome === "YES" ? DS.success : DS.error,
                    }}
                  >
                    {t.outcome}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: DS.textPrimary, fontFamily: "'DM Mono', monospace" }}>
                    ${t.collateralIn}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span
                    style={{
                      fontSize: 11,
                      color: DS.textSecondary,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: 140,
                    }}
                  >
                    {t.user} · {t.marketQuestion}
                  </span>
                  <span style={{ fontSize: 11, color: DS.accentGray }}>{createdTime}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MarketsPage(props: { onNavigate: (v: View) => void; onResolve: (id: string) => void }) {
  const [filter, setFilter] = useState<MarketStatus | "ALL">("ALL");
  const [search, setSearch] = useState<string>("");

  const filtered = MOCK_MARKETS.filter(
    (m) => (filter === "ALL" || m.status === filter) && m.question.toLowerCase().includes(search.toLowerCase()),
  );

  const FILTERS: Array<MarketStatus | "ALL"> = ["ALL", "OPEN", "DRAFT", "CLOSED", "RESOLVED"];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 26,
              fontWeight: 700,
              color: DS.textPrimary,
              letterSpacing: "-0.02em",
            }}
          >
            Markets
          </h1>
          <p style={{ fontSize: 13, color: DS.textSecondary, marginTop: 4 }}>
            {MOCK_MARKETS.length} markets · {MOCK_MARKETS.filter((m) => m.status === "OPEN").length} active
          </p>
        </div>
        <button
          type="button"
          onClick={() => props.onNavigate("create-market")}
          style={{
            background: DS.accentGradient,
            color: DS.neutralDark,
            fontWeight: 700,
            fontSize: 13,
            padding: "10px 20px",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
          }}
        >
          + Create Market
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: DS.accentGray, fontSize: 13 }}>
            🔍
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search markets..."
            style={{
              background: DS.bgDark,
              border: `1px solid ${DS.bgSurface}`,
              borderRadius: 8,
              padding: "9px 12px 9px 34px",
              color: DS.textPrimary,
              fontSize: 13,
              width: "100%",
              outline: "none",
              fontFamily: "'Inter', sans-serif",
            }}
          />
        </div>

        {FILTERS.map((f) => (
          <button
            // TypeScript sees `f` as a union; we still only use it in button key/style.
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            style={{
              background: filter === f ? DS.accentGradient : DS.bgDark,
              color: filter === f ? DS.neutralDark : DS.accentGray,
              border: `1px solid ${filter === f ? "transparent" : DS.bgSurface}`,
              borderRadius: 8,
              padding: "8px 14px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: DS.bgDark, border: `1px solid ${DS.bgSurface}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 100px 110px 90px 90px 120px", gap: 0, padding: "11px 20px", borderBottom: `1px solid ${DS.bgSurface}` }}>
          {["Question", "Status", "Volume", "Trades", "End Date", "Actions"].map((h) => (
            <span key={h} style={{ fontSize: 10, fontWeight: 700, color: DS.textSecondary, textTransform: "uppercase", letterSpacing: "0.07em" }}>
              {h}
            </span>
          ))}
        </div>

        {filtered.length === 0 && <div style={{ padding: "40px 20px", textAlign: "center", color: DS.textSecondary, fontSize: 13 }}>No markets found</div>}

        {filtered.map((m, i) => (
          <div
            key={m.id}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 100px 110px 90px 90px 120px",
              alignItems: "center",
              gap: 0,
              padding: "14px 20px",
              borderBottom: i < filtered.length - 1 ? `1px solid ${DS.bgDarkest}` : "none",
              transition: "background 0.15s",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: DS.textPrimary, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {m.question}
              </p>
              <p style={{ fontSize: 11, color: DS.textSecondary, fontFamily: "'DM Mono', monospace" }}>/ {m.slug}</p>
            </div>
            <div>
              <StatusBadge status={m.status} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: DS.textPrimary, fontFamily: "'DM Mono', monospace" }}>{fmtUSD(m.volume)}</span>
            <span style={{ fontSize: 13, color: DS.textSecondary, fontFamily: "'DM Mono', monospace" }}>{m.trades.toLocaleString()}</span>
            <span style={{ fontSize: 12, color: DS.textSecondary }}>{m.endTime}</span>
            <div style={{ display: "flex", gap: 6 }}>
              {m.status === "OPEN" && (
                <button
                  type="button"
                  onClick={() => props.onResolve(m.id)}
                  style={{
                    background: "rgba(247,148,29,0.12)",
                    border: `1px solid ${DS.accentDarker}`,
                    color: DS.accentDarker,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "5px 10px",
                    borderRadius: 6,
                    cursor: "pointer",
                  }}
                >
                  Resolve
                </button>
              )}
              {m.status === "DRAFT" && (
                <button
                  type="button"
                  style={{
                    background: DS.successBg,
                    border: `1px solid ${DS.success}`,
                    color: DS.success,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "5px 10px",
                    borderRadius: 6,
                    cursor: "pointer",
                  }}
                >
                  Publish
                </button>
              )}
              <button
                type="button"
                style={{
                  background: DS.bgSurface,
                  border: "none",
                  color: DS.textSecondary,
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "5px 10px",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type CreateMarketForm = {
  question: string;
  description: string;
  slug: string;
  model: "CPMM_BINARY";
  collateralAsset: "USDC";
  startTime: string;
  endTime: string;
  feeBps: string;
  yesLabel: string;
  noLabel: string;
  initialLiquidity: string;
};

function CreateMarketPage(props: { onCreated: () => void }) {
  const [form, setForm] = useState<CreateMarketForm>({
    question: "",
    description: "",
    slug: "",
    model: "CPMM_BINARY",
    collateralAsset: "USDC",
    startTime: "",
    endTime: "",
    feeBps: "200",
    yesLabel: "Yes",
    noLabel: "No",
    initialLiquidity: "1000",
  });
  const [step, setStep] = useState<number>(1);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const setField = <K extends keyof CreateMarketForm>(key: K, value: CreateMarketForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const autoSlug = (q: string) =>
    q
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 60);

  const handleCreate = async (): Promise<void> => {
    setIsCreating(true);
    setCreateError(null);

    try {
      // Admin API route is mounted at `/api/admin/markets/create` (no locale prefix).
      const res = await fetch(`/api/admin/markets/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: form.question,
          description: form.description,
          slug: form.slug,
          model: form.model,
          collateralAsset: form.collateralAsset,
          startTime: form.startTime || null,
          endTime: form.endTime,
          feeBps: Number(form.feeBps),
          initialLiquidity: Number(form.initialLiquidity),
          yesLabel: form.yesLabel,
          noLabel: form.noLabel,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        const message = json?.message ?? "Failed to create market";
        throw new Error(message);
      }

      setSubmitted(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create market";
      setCreateError(message);
    } finally {
      setIsCreating(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 16 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: DS.successBg,
            border: `2px solid ${DS.success}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
          }}
        >
          ✓
        </div>
        <h2 style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, color: DS.textPrimary, fontWeight: 700 }}>Market Created!</h2>
        <p style={{ color: DS.textSecondary, fontSize: 13, textAlign: "center", maxWidth: 340 }}>
          Your market has been saved as a draft. Publish it from the Markets page when ready.
        </p>
        <button
          type="button"
          onClick={props.onCreated}
          style={{
            background: DS.accentGradient,
            color: DS.neutralDark,
            fontWeight: 700,
            fontSize: 13,
            padding: "11px 24px",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            marginTop: 8,
          }}
        >
          Go to Markets
        </button>
      </div>
    );
  }

  const STEPS = ["Market Details", "Outcomes & Liquidity", "Review"] as const;

  const inputStyle = {
    background: DS.bgDarkest,
    border: `1px solid ${DS.bgSurface}`,
    borderRadius: 8,
    padding: "10px 14px",
    color: DS.textPrimary,
    fontSize: 13,
    width: "100%",
    outline: "none",
    fontFamily: "'Inter', sans-serif",
    boxSizing: "border-box" as const,
  };
  const labelStyle = {
    fontSize: 11,
    fontWeight: 700,
    color: DS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    marginBottom: 6,
    display: "block",
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'DM Mono', monospace", fontSize: 26, fontWeight: 700, color: DS.textPrimary, letterSpacing: "-0.02em" }}>Create Market</h1>
        <p style={{ fontSize: 13, color: DS.textSecondary, marginTop: 4 }}>Define a new CPMM binary prediction market</p>
      </div>

      {/* Stepper */}
      <div style={{ display: "flex", gap: 0, marginBottom: 28, background: DS.bgDark, border: `1px solid ${DS.bgSurface}`, borderRadius: 12, padding: 6, width: "fit-content" }}>
        {STEPS.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(i + 1)}
            style={{
              background: step === i + 1 ? DS.accentGradient : "none",
              color: step === i + 1 ? DS.neutralDark : DS.textSecondary,
              border: "none",
              borderRadius: 8,
              padding: "8px 20px",
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
              letterSpacing: "0.04em",
            }}
          >
            {i + 1}. {s}
          </button>
        ))}
      </div>

      <div style={{ background: DS.bgDark, border: `1px solid ${DS.bgSurface}`, borderRadius: 14, padding: 28, maxWidth: 720 }}>
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={labelStyle}>Market Question *</label>
              <textarea
                value={form.question}
                onChange={(e) => {
                  const v = e.target.value;
                  setField("question", v);
                  setField("slug", autoSlug(v));
                }}
                placeholder="e.g. Will Bad Bunny's new album hit 1B streams within 30 days?"
                rows={3}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Provide resolution criteria, data sources, and context..."
                rows={4}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Slug *</label>
                <input value={form.slug} onChange={(e) => setField("slug", e.target.value)} style={inputStyle} placeholder="auto-generated-from-question" />
              </div>
              <div>
                <label style={labelStyle}>Market Model</label>
                <select
                  value={form.model}
                  onChange={(e) => setField("model", e.target.value as CreateMarketForm["model"])}
                  style={{ ...inputStyle, appearance: "none" }}
                >
                  <option value="CPMM_BINARY">CPMM Binary (Yes/No)</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Collateral Asset</label>
                <select
                  value={form.collateralAsset}
                  onChange={(e) => setField("collateralAsset", e.target.value as CreateMarketForm["collateralAsset"])}
                  style={{ ...inputStyle, appearance: "none" }}
                >
                  <option value="USDC">USDC</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Start Time</label>
                <input type="datetime-local" value={form.startTime} onChange={(e) => setField("startTime", e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>End Time *</label>
                <input type="datetime-local" value={form.endTime} onChange={(e) => setField("endTime", e.target.value)} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setStep(2)}
                style={{
                  background: DS.accentGradient,
                  color: DS.neutralDark,
                  fontWeight: 700,
                  fontSize: 13,
                  padding: "10px 24px",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Next: Outcomes →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={{ ...labelStyle, marginBottom: 12 }}>Outcome Labels</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ ...labelStyle, color: DS.success }}>YES Outcome Label</label>
                  <input value={form.yesLabel} onChange={(e) => setField("yesLabel", e.target.value)} style={{ ...inputStyle, borderColor: DS.successBg }} />
                </div>
                <div>
                  <label style={{ ...labelStyle, color: DS.error }}>NO Outcome Label</label>
                  <input value={form.noLabel} onChange={(e) => setField("noLabel", e.target.value)} style={{ ...inputStyle, borderColor: DS.dangerBg }} />
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Protocol Fee (basis points)</label>
                <input
                  value={form.feeBps}
                  onChange={(e) => setField("feeBps", e.target.value)}
                  type="number"
                  min="0"
                  max="9999"
                  style={inputStyle}
                />
                <p style={{ fontSize: 11, color: DS.textSecondary, marginTop: 5 }}>{(Number(form.feeBps) / 100).toFixed(2)}% fee per trade</p>
              </div>
              <div>
                <label style={labelStyle}>Initial Liquidity (USDC)</label>
                <input
                  value={form.initialLiquidity}
                  onChange={(e) => setField("initialLiquidity", e.target.value)}
                  type="number"
                  min="100"
                  style={inputStyle}
                />
                <p style={{ fontSize: 11, color: DS.textSecondary, marginTop: 5 }}>Seeded equally into YES & NO pools</p>
              </div>
            </div>

            {/* Pool preview */}
            <div style={{ background: DS.bgDarkest, borderRadius: 10, padding: "16px 18px", border: `1px solid ${DS.bgSurface}` }}>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: DS.textSecondary,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  marginBottom: 12,
                }}
              >
                Pool Preview
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {[
                  { label: "YES Pool", val: `${(Number(form.initialLiquidity) / 2).toFixed(0)} USDC`, color: DS.success },
                  { label: "NO Pool", val: `${(Number(form.initialLiquidity) / 2).toFixed(0)} USDC`, color: DS.error },
                  { label: "Initial Price", val: "50.0%", color: DS.accentDarker },
                ].map((p) => (
                  <div key={p.label} style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 11, color: DS.textSecondary, marginBottom: 4 }}>{p.label}</p>
                    <p style={{ fontSize: 16, fontWeight: 800, color: p.color, fontFamily: "'DM Mono', monospace" }}>{p.val}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  background: DS.bgSurface,
                  border: "none",
                  color: DS.textSecondary,
                  fontWeight: 700,
                  fontSize: 13,
                  padding: "10px 24px",
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                style={{
                  background: DS.accentGradient,
                  color: DS.neutralDark,
                  fontWeight: 700,
                  fontSize: 13,
                  padding: "10px 24px",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Next: Review →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: DS.textPrimary, marginBottom: 8 }}>Confirm & Create</p>
            {[
              { label: "Question", val: form.question || "—" },
              { label: "Slug", val: form.slug || "—" },
              { label: "Model", val: form.model },
              { label: "Collateral", val: form.collateralAsset },
              { label: "End Time", val: form.endTime || "—" },
              { label: "Fee", val: `${(Number(form.feeBps) / 100).toFixed(2)}%` },
              { label: "Initial Liquidity", val: `$${form.initialLiquidity} USDC` },
              { label: "YES Label", val: form.yesLabel },
              { label: "NO Label", val: form.noLabel },
            ].map((r) => (
              <div
                key={r.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: `1px solid ${DS.bgDarkest}`,
                }}
              >
                <span style={{ fontSize: 12, color: DS.textSecondary, fontWeight: 600 }}>{r.label}</span>
                <span
                  style={{
                    fontSize: 13,
                    color: DS.textPrimary,
                    fontWeight: 600,
                    fontFamily: "'DM Mono', monospace",
                    textAlign: "right",
                    maxWidth: "60%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {r.val}
                </span>
              </div>
            ))}

            <div
              style={{
                background: DS.warningBg,
                border: `1px solid ${DS.warning}30`,
                borderRadius: 8,
                padding: "11px 14px",
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
                marginTop: 8,
              }}
            >
              <span style={{ fontSize: 14, marginTop: 1 }}>⚠</span>
              <p style={{ fontSize: 12, color: DS.warning, lineHeight: 1.5 }}>
                Market will be saved as <strong>DRAFT</strong>. You must publish it from the Markets page to allow trading.
              </p>
            </div>

            {createError && (
              <p
                style={{
                  fontSize: 12,
                  color: DS.error,
                  background: DS.bgDarkest,
                  border: `1px solid ${DS.dangerBg}`,
                  borderRadius: 8,
                  padding: "10px 12px",
                }}
              >
                {createError}
              </p>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setStep(2)}
                style={{
                  background: DS.bgSurface,
                  border: "none",
                  color: DS.textSecondary,
                  fontWeight: 700,
                  fontSize: 13,
                  padding: "10px 24px",
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={isCreating}
                style={{
                  background: DS.accentGradient,
                  color: DS.neutralDark,
                  fontWeight: 700,
                  fontSize: 13,
                  padding: "10px 28px",
                  borderRadius: 10,
                  border: "none",
                  cursor: isCreating ? "not-allowed" : "pointer",
                  opacity: isCreating ? 0.7 : 1,
                }}
              >
                {isCreating ? "Creating..." : "✓ Create Market"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UsersPage() {
  const [search, setSearch] = useState<string>("");
  const filtered = MOCK_USERS.filter(
    (u) => u.displayName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'DM Mono', monospace", fontSize: 26, fontWeight: 700, color: DS.textPrimary, letterSpacing: "-0.02em" }}>Users</h1>
          <p style={{ fontSize: 13, color: DS.textSecondary, marginTop: 4 }}>{MOCK_USERS.length} registered accounts</p>
        </div>
      </div>

      <div style={{ marginBottom: 16, position: "relative", maxWidth: 320 }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: DS.accentGray, fontSize: 13 }}>🔍</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          style={{
            background: DS.bgDark,
            border: `1px solid ${DS.bgSurface}`,
            borderRadius: 8,
            padding: "9px 12px 9px 34px",
            color: DS.textPrimary,
            fontSize: 13,
            width: "100%",
            outline: "none",
            fontFamily: "'Inter', sans-serif",
          }}
        />
      </div>

      <div style={{ background: DS.bgDark, border: `1px solid ${DS.bgSurface}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 80px 110px 110px 90px 100px", padding: "11px 20px", borderBottom: `1px solid ${DS.bgSurface}` }}>
          {["User", "Email", "Auth", "Available", "Reserved", "Trades", "Joined"].map((h) => (
            <span key={h} style={{ fontSize: 10, fontWeight: 700, color: DS.textSecondary, textTransform: "uppercase", letterSpacing: "0.07em" }}>
              {h}
            </span>
          ))}
        </div>

        {filtered.map((u, i) => {
          const initial = u.displayName.slice(0, 1) || "•";
          return (
            <div
              key={u.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 1fr 80px 110px 110px 90px 100px",
                alignItems: "center",
                padding: "13px 20px",
                borderBottom: i < filtered.length - 1 ? `1px solid ${DS.bgDarkest}` : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: DS.accentGradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 800,
                    color: DS.neutralDark,
                    flexShrink: 0,
                  }}
                >
                  {initial}
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: DS.textPrimary }}>{u.displayName}</span>
              </div>
              <span style={{ fontSize: 12, color: DS.textSecondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: DS.accentGray, textTransform: "uppercase", letterSpacing: "0.04em" }}>{u.authProvider}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: DS.textPrimary, fontFamily: "'DM Mono', monospace" }}>${u.balance.toLocaleString()}</span>
              <span style={{ fontSize: 13, color: DS.textSecondary, fontFamily: "'DM Mono', monospace" }}>${u.reserved.toLocaleString()}</span>
              <span style={{ fontSize: 13, color: DS.textSecondary, fontFamily: "'DM Mono', monospace" }}>{u.trades}</span>
              <span style={{ fontSize: 12, color: DS.textSecondary }}>{u.createdAt}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TradesPage() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'DM Mono', monospace", fontSize: 26, fontWeight: 700, color: DS.textPrimary, letterSpacing: "-0.02em" }}>Trade Audit Log</h1>
        <p style={{ fontSize: 13, color: DS.textSecondary, marginTop: 4 }}>All AMM transactions across markets</p>
      </div>
      <div style={{ background: DS.bgDark, border: `1px solid ${DS.bgSurface}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 100px 80px 90px 80px 80px 80px 130px", padding: "11px 20px", borderBottom: `1px solid ${DS.bgSurface}` }}>
          {["Market", "User", "Type", "Outcome", "In (USDC)", "Shares", "Fee", "Timestamp"].map((h) => (
            <span key={h} style={{ fontSize: 10, fontWeight: 700, color: DS.textSecondary, textTransform: "uppercase", letterSpacing: "0.07em" }}>
              {h}
            </span>
          ))}
        </div>
        {MOCK_TRADES.map((t, i) => {
          return (
            <div
              key={t.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 100px 80px 90px 80px 80px 80px 130px",
                alignItems: "center",
                padding: "13px 20px",
                borderBottom: i < MOCK_TRADES.length - 1 ? `1px solid ${DS.bgDarkest}` : "none",
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 600, color: DS.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.marketQuestion}</span>
              <span style={{ fontSize: 12, color: DS.textSecondary }}>{t.user}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: t.type === "AMM_BUY" ? DS.success : DS.accentDarker, textTransform: "uppercase", letterSpacing: "0.03em" }}>
                {t.type.replace("AMM_", "")}
              </span>
              <span style={{ fontSize: 13, fontWeight: 800, color: t.outcome === "YES" ? DS.success : DS.error }}>{t.outcome}</span>
              <span style={{ fontSize: 13, fontFamily: "'DM Mono', monospace", color: DS.textPrimary }}>${t.collateralIn}</span>
              <span style={{ fontSize: 13, fontFamily: "'DM Mono', monospace", color: DS.textSecondary }}>{t.sharesOut}</span>
              <span style={{ fontSize: 13, fontFamily: "'DM Mono', monospace", color: DS.textSecondary }}>${t.fee}</span>
              <span style={{ fontSize: 11, color: DS.accentGray, fontFamily: "'DM Mono', monospace" }}>{t.createdAt}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LedgerPage() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'DM Mono', monospace", fontSize: 26, fontWeight: 700, color: DS.textPrimary, letterSpacing: "-0.02em" }}>Balance Ledger</h1>
        <p style={{ fontSize: 13, color: DS.textSecondary, marginTop: 4 }}>All ledger transactions — deposits, trades, payouts, withdrawals</p>
      </div>
      <div style={{ background: DS.bgDark, border: `1px solid ${DS.bgSurface}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "90px 110px 130px 1fr 100px", padding: "11px 20px", borderBottom: `1px solid ${DS.bgSurface}` }}>
          {["Type", "User", "Amount", "Reference", "Status"].map((h) => (
            <span key={h} style={{ fontSize: 10, fontWeight: 700, color: DS.textSecondary, textTransform: "uppercase", letterSpacing: "0.07em" }}>
              {h}
            </span>
          ))}
        </div>

        {MOCK_LEDGER.map((l, i) => (
          <div
            key={l.id}
            style={{
              display: "grid",
              gridTemplateColumns: "90px 110px 130px 1fr 100px",
              alignItems: "center",
              padding: "13px 20px",
              borderBottom: i < MOCK_LEDGER.length - 1 ? `1px solid ${DS.bgDarkest}` : "none",
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: DS.accentGray, textTransform: "uppercase", letterSpacing: "0.04em" }}>{l.txType}</span>
            <span style={{ fontSize: 12, color: DS.textSecondary }}>{l.user}</span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 800,
                fontFamily: "'DM Mono', monospace",
                color: l.amount > 0 ? DS.success : DS.error,
              }}
            >
              {l.amount > 0 ? "+" : ""}{fmtUSD(Math.abs(l.amount))}
            </span>
            <span style={{ fontSize: 11, color: DS.accentGray, fontFamily: "'DM Mono', monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {l.ref}
            </span>
            <StatusBadge status={l.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsPage() {
  const inputStyle = {
    background: DS.bgDarkest,
    border: `1px solid ${DS.bgSurface}`,
    borderRadius: 8,
    padding: "10px 14px",
    color: DS.textPrimary,
    fontSize: 13,
    width: "100%",
    outline: "none",
    fontFamily: "'DM Mono', monospace",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    fontSize: 11,
    fontWeight: 700,
    color: DS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    marginBottom: 6,
    display: "block",
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'DM Mono', monospace", fontSize: 26, fontWeight: 700, color: DS.textPrimary, letterSpacing: "-0.02em" }}>Settings</h1>
        <p style={{ fontSize: 13, color: DS.textSecondary, marginTop: 4 }}>Platform configuration</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 600 }}>
        {[
          {
            section: "Platform",
            fields: [
              { label: "App Name", val: "Marination Music" },
              { label: "Default Collateral Asset", val: "USDC" },
              { label: "Default Fee (bps)", val: "200" },
            ],
          },
          {
            section: "CPMM Defaults",
            fields: [
              { label: "Min Initial Liquidity (USDC)", val: "500" },
              { label: "Max Fee (bps)", val: "500" },
            ],
          },
        ].map(({ section, fields }) => (
          <div key={section} style={{ background: DS.bgDark, border: `1px solid ${DS.bgSurface}`, borderRadius: 14, padding: "20px 22px" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: DS.textSecondary, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 18 }}>{section}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {fields.map((f) => (
                <div key={f.label}>
                  <label style={labelStyle}>{f.label}</label>
                  <input defaultValue={f.val} style={inputStyle} />
                </div>
              ))}
            </div>
          </div>
        ))}

        <button
          type="button"
          style={{
            background: DS.accentGradient,
            color: DS.neutralDark,
            fontWeight: 700,
            fontSize: 13,
            padding: "11px 24px",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            alignSelf: "flex-start",
          }}
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}

function ResolveModal(props: { marketId: string; onClose: () => void }) {
  const market = MOCK_MARKETS.find((m) => m.id === props.marketId);
  const [outcome, setOutcome] = useState<"YES" | "NO" | "">("YES");
  const [done, setDone] = useState<boolean>(false);

  if (!market) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ background: DS.bgDark, border: `1px solid ${DS.bgSurface}`, borderRadius: 18, padding: 32, maxWidth: 440, width: "90%", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
        {done ? (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: DS.successBg,
                border: `2px solid ${DS.success}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                margin: "0 auto 16px",
              }}
            >
              ✓
            </div>
            <h3 style={{ fontFamily: "'DM Mono', monospace", fontSize: 18, color: DS.textPrimary, marginBottom: 8 }}>Market Resolved</h3>
            <p style={{ fontSize: 13, color: DS.textSecondary, marginBottom: 20 }}>
              Resolved as{" "}
              <strong style={{ color: outcome === "YES" ? DS.success : DS.error }}>{outcome}</strong>. Payouts will be processed automatically.
            </p>
            <button
              type="button"
              onClick={props.onClose}
              style={{
                background: DS.accentGradient,
                color: DS.neutralDark,
                fontWeight: 700,
                fontSize: 13,
                padding: "10px 24px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <h3 style={{ fontFamily: "'DM Mono', monospace", fontSize: 17, color: DS.textPrimary, marginBottom: 8 }}>Resolve Market</h3>
            <p style={{ fontSize: 13, color: DS.textSecondary, marginBottom: 20, lineHeight: 1.5 }}>{market.question}</p>
            <p style={{ fontSize: 11, fontWeight: 700, color: DS.textSecondary, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>
              Select Winning Outcome
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
              {(["YES", "NO"] as const).map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setOutcome(o)}
                  style={{
                    background: outcome === o ? (o === "YES" ? DS.successBg : DS.dangerBg) : DS.bgDarkest,
                    border: `2px solid ${outcome === o ? (o === "YES" ? DS.success : DS.error) : DS.bgSurface}`,
                    color: outcome === o ? (o === "YES" ? DS.success : DS.error) : DS.textSecondary,
                    borderRadius: 10,
                    padding: "16px",
                    fontWeight: 800,
                    fontSize: 16,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {o === "YES" ? "✓ YES" : "✕ NO"}
                </button>
              ))}
            </div>

            <div style={{ background: DS.dangerBg, borderRadius: 8, padding: "10px 14px", marginBottom: 20, border: `1px solid ${DS.error}30` }}>
              <p style={{ fontSize: 12, color: DS.error, lineHeight: 1.5 }}>
                ⚠ This action is irreversible. All winning share holders will receive payouts at 1:1 collateral ratio.
              </p>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={props.onClose}
                style={{
                  flex: 1,
                  background: DS.bgSurface,
                  border: "none",
                  color: DS.textSecondary,
                  fontWeight: 700,
                  fontSize: 13,
                  padding: "11px",
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setDone(true)}
                disabled={!outcome}
                style={{
                  flex: 2,
                  background: outcome ? DS.accentGradient : DS.bgSurface,
                  color: outcome ? DS.neutralDark : DS.textSecondary,
                  fontWeight: 700,
                  fontSize: 13,
                  padding: "11px",
                  borderRadius: 10,
                  border: "none",
                  cursor: outcome ? "pointer" : "not-allowed",
                }}
              >
                Resolve as {outcome || "…"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const [view, setView] = useState<View>("overview");
  const [resolveId, setResolveId] = useState<string | null>(null);

  const navigate = (v: View) => setView(v);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: DS.bgDarkest, minHeight: "100vh", display: "flex", color: DS.textPrimary }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500;700&display=swap');
        input, select, textarea { color-scheme: dark; }
        ::-webkit-scrollbar { width: 4px; background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${DS.bgSurface}; border-radius: 4px; }
        select option { background: ${DS.bgDark}; }
      `}</style>

      {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
      <aside
        style={{
          width: 230,
          flexShrink: 0,
          background: DS.bgDark,
          borderRight: `1px solid ${DS.bgSurface}`,
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        {/* Logo */}
        <div style={{ padding: "22px 20px 18px", borderBottom: `1px solid ${DS.bgSurface}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: DS.accentGradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              🎵
            </div>
            <div>
              <p style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em" }}>
                Mari<span style={{ color: DS.accentDarker }}>Nation</span>
              </p>
              <p style={{ fontSize: 10, color: DS.textSecondary, fontWeight: 500, letterSpacing: "0.04em" }}>ADMIN PANEL</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "14px 10px" }}>
          {NAV.map((item) => {
            const isActive = view === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: item.indent ? "8px 8px 8px 28px" : "10px 12px",
                  background: isActive ? "rgba(247,148,29,0.12)" : "transparent",
                  border: isActive ? `1px solid rgba(247,148,29,0.25)` : "1px solid transparent",
                  borderRadius: 9,
                  cursor: "pointer",
                  marginBottom: 2,
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: item.indent ? 13 : 15, color: isActive ? DS.accentDarker : DS.accentGray }}>{item.icon}</span>
                <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? DS.textPrimary : DS.accentGray }}>
                  {item.label}
                </span>
                {item.id === "markets" && (
                  <span
                    style={{
                      marginLeft: "auto",
                      background: DS.bgSurface,
                      color: DS.textSecondary,
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 7px",
                      borderRadius: 20,
                    }}
                  >
                    {MOCK_MARKETS.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: "14px 16px", borderTop: `1px solid ${DS.bgSurface}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: DS.accentGradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 800,
                color: DS.neutralDark,
              }}
            >
              A
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: DS.textPrimary }}>Admin</p>
              <p style={{ fontSize: 10, color: DS.textSecondary }}>admin@marination.io</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ────────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: "32px 36px", overflowY: "auto", minHeight: "100vh" }}>
        {view === "overview" && <OverviewPage onNavigate={navigate} />}
        {view === "markets" && <MarketsPage onNavigate={navigate} onResolve={setResolveId} />}
        {view === "create-market" && <CreateMarketPage onCreated={() => navigate("markets")} />}
        {view === "users" && <UsersPage />}
        {view === "trades" && <TradesPage />}
        {view === "ledger" && <LedgerPage />}
        {view === "settings" && <SettingsPage />}
      </main>

      {/* ── RESOLVE MODAL ───────────────────────────────────────────────── */}
      {resolveId && <ResolveModal marketId={resolveId} onClose={() => setResolveId(null)} />}
    </div>
  );
}

