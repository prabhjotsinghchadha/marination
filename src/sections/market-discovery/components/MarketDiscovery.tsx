import type {
    MarketDiscoveryProps,
    Market,
    SortOption,
} from "@/product/sections/market-discovery/types";
import { DS } from "@/product/design-system/colors";
import { FeaturedHero } from "./FeaturedHero";
import { BinaryCard } from "./BinaryCard";
import { MultiCard } from "./MultiCard";
import { MarketFooter } from "./MarketFooter";
import { Link } from "@/libs/I18nNavigation";

function applySort(markets: Market[], sort: SortOption): Market[] {
    return [...markets].sort((a, b) => {
        switch (sort) {
            case "volume":
                return b.volume - a.volume;
            case "newest":
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case "closing-soon":
                return new Date(a.closingDate).getTime() - new Date(b.closingDate).getTime();
            default:
                return b.volume - a.volume;
        }
    });
}

function CategoryStrip(props: {
    categories: string[];
    active: string;
    onChange: (c: string) => void;
}) {
    const { categories, active, onChange } = props;

    return (
        <div
            className="flex overflow-x-auto scrollbar-none"
            style={{ borderBottom: `1px solid ${DS.bgDarkGray}` }}
        >
            {categories.map((category) => (
                <button
                    key={category}
                    onClick={() => onChange(category)}
                    className="shrink-0 px-3 py-2 text-[12px] whitespace-nowrap transition-all duration-100"
                    style={{
                        fontWeight: active === category ? 600 : 400,
                        color: active === category ? DS.accentPrimary : DS.accentGray,
                        background: "none",
                        border: "none",
                        borderBottom: `2px solid ${active === category ? DS.accentDarker : "transparent"}`,
                        cursor: "pointer",
                    }}
                >
                    {category === "Trending" ? "↗ Trending" : category}
                </button>
            ))}
        </div>
    );
}

function BreakingNewsSidebar(props: { items: MarketDiscoveryProps["breakingNews"] }) {
    const { items } = props;

    return (
        <div
            className="rounded-xl overflow-hidden"
            style={{ background: DS.bgDark, border: `1px solid ${DS.bgSurface}` }}
        >
            <div
                className="flex items-center justify-between px-3 py-2.5"
                style={{ borderBottom: `1px solid ${DS.bgDarkGray}` }}
            >
                <span className="text-[11px] font-semibold" style={{ color: DS.textPrimary }}>
                    Breaking News
                </span>
                <span
                    className="text-[12px] cursor-pointer font-medium"
                    style={{ color: DS.accentPrimary }}
                >
                    ›
                </span>
            </div>
            {items.map((item, index) => (
                <div
                    key={item.id}
                    className="flex gap-2.5 px-3 py-2.5 cursor-pointer transition-colors duration-100"
                    style={{
                        borderBottom:
                            index < items.length - 1 ? `1px solid ${DS.bgDarkGray}` : "none",
                    }}
                    onMouseEnter={(event) => {
                        event.currentTarget.style.background = DS.bgDarkGray;
                    }}
                    onMouseLeave={(event) => {
                        event.currentTarget.style.background = "transparent";
                    }}
                >
                    <span
                        className="text-[10px] font-semibold min-w-[14px] pt-0.5 tabular-nums"
                        style={{ color: DS.accentGray }}
                    >
                        {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                        <p
                            className="text-[11px] leading-[1.4] mb-1.5"
                            style={{ color: DS.textPrimary }}
                        >
                            {item.question}
                        </p>
                        <div className="flex items-center gap-1.5">
                            <span
                                className="text-[13px] font-bold tabular-nums"
                                style={{
                                    color: DS.textPrimary,
                                    fontFamily: "JetBrains Mono, monospace",
                                }}
                            >
                                {item.probability}%
                            </span>
                            <span
                                className="text-[10px] font-semibold tabular-nums"
                                style={{ color: item.direction === "up" ? DS.success : DS.error }}
                            >
                                {item.direction === "up" ? "▲" : "▼"} {item.change}%
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function HotTopicsSidebar(props: { topics: MarketDiscoveryProps["hotTopics"] }) {
    const { topics } = props;

    return (
        <div
            className="rounded-xl overflow-hidden"
            style={{ background: DS.bgDark, border: `1px solid ${DS.bgSurface}` }}
        >
            <div
                className="flex items-center justify-between px-3 py-2.5"
                style={{ borderBottom: `1px solid ${DS.bgDarkGray}` }}
            >
                <span className="text-[11px] font-semibold" style={{ color: DS.textPrimary }}>
                    Artist Battles
                </span>
                <span
                    className="text-[12px] cursor-pointer font-medium"
                    style={{ color: DS.accentPrimary }}
                >
                    ›
                </span>
            </div>
            {topics.map((topic, index) => (
                <div
                    key={topic.label}
                    className="flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors duration-100"
                    style={{
                        borderBottom:
                            index < topics.length - 1 ? `1px solid ${DS.bgDarkGray}` : "none",
                    }}
                    onMouseEnter={(event) => {
                        event.currentTarget.style.background = DS.bgDarkGray;
                    }}
                    onMouseLeave={(event) => {
                        event.currentTarget.style.background = "transparent";
                    }}
                >
                    <span
                        className="text-[10px] font-semibold min-w-[14px] tabular-nums"
                        style={{ color: DS.accentGray }}
                    >
                        {index + 1}
                    </span>
                    <span
                        className="flex-1 text-[11px] font-medium"
                        style={{ color: DS.textPrimary }}
                    >
                        {topic.label}
                    </span>
                    <span
                        className="text-[9px] whitespace-nowrap tabular-nums"
                        style={{ color: DS.accentGray, fontFamily: "JetBrains Mono, monospace" }}
                    >
                        {topic.volume}
                    </span>
                    {topic.isHot && (
                        <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ background: DS.accentPrimary }}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}

function SignUpCTA() {
    return (
        <div
            className="rounded-xl p-4"
            style={{ background: DS.bgDark, border: `1px solid ${DS.bgSurface}` }}
        >
            <p className="text-[12px] font-semibold mb-1" style={{ color: DS.textPrimary }}>
                Start trading
            </p>
            <p className="text-[10px] leading-[1.5] mb-3" style={{ color: DS.accentGray }}>
                Predict music outcomes. Earn on accuracy.
            </p>
            <button
                className="w-full py-2 text-[12px] font-semibold rounded-lg transition-opacity hover:opacity-90"
                style={{
                    color: DS.neutralDark,
                    background: DS.accentGradient,
                    border: "none",
                    cursor: "pointer",
                }}
            >
                Sign up free
            </button>
        </div>
    );
}

export function MarketDiscovery(props: MarketDiscoveryProps) {
    const {
        markets,
        categories,
        activeCategory,
        searchQuery,
        isLoadingMore,
        hasMore,
        breakingNews,
        hotTopics,
        onSearchChange,
        onCategoryChange,
        onMarketClick,
        onYesClick,
        onNoClick,
        onLoadMore,
        showSignUpCta = true,
    } = props;

    const featuredMarket =
        [...markets]
            .filter((market) => market.type === "multi")
            .sort((a, b) => b.volume - a.volume)[0] ??
        [...markets].sort((a, b) => b.volume - a.volume)[0];

    const showHero = !searchQuery && activeCategory === "All" && featuredMarket;

    const gridMarkets = applySort(
        markets.filter((market) => {
            if (market.id === featuredMarket?.id && showHero) return false;
            if (activeCategory !== "All" && market.category !== activeCategory) return false;
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (
                    market.question.toLowerCase().includes(query) ||
                    market.artist.toLowerCase().includes(query)
                );
            }
            return true;
        }),
        "trending",
    );

    return (
        <div
            className="min-h-screen text-white"
            style={{
                background: DS.bgDarkest,
                fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif",
            }}
        >
            <div
                className="sticky top-14 z-20"
                style={{
                    background: "rgba(18,18,18,0.96)",
                    borderBottom: `1px solid ${DS.bgDarkGray}`,
                }}
            >
                <div className="max-w-[1380px] mx-auto px-5">
                    <CategoryStrip
                        categories={categories}
                        active={activeCategory}
                        onChange={onCategoryChange}
                    />
                </div>
            </div>

            <div className="max-w-[1380px] mx-auto px-5 py-5 flex gap-5 items-start">
                <div className="flex-1 min-w-0">
                    {showHero && featuredMarket && (
                        <FeaturedHero
                            market={featuredMarket}
                            onMarketClick={onMarketClick}
                            onYesClick={onYesClick}
                            onNoClick={onNoClick}
                        />
                    )}

                    <div className="flex items-center gap-3 mb-2.5">
                        <h3 className="text-[13px] font-semibold" style={{ color: DS.textPrimary }}>
                            {searchQuery
                                ? `Results for "${searchQuery}"`
                                : activeCategory !== "All"
                                  ? activeCategory
                                  : "All markets"}
                        </h3>
                        <span
                            className="text-[11px] tabular-nums px-1.5 py-0.5 rounded"
                            style={{
                                color: DS.accentGray,
                                background: DS.bgDark,
                                fontFamily: "JetBrains Mono, monospace",
                            }}
                        >
                            {gridMarkets.length}
                        </span>
                    </div>

                    {gridMarkets.length > 0 ? (
                        <>
                            <div
                                className="grid gap-2"
                                style={{
                                    gridTemplateColumns: "repeat(auto-fill, minmax(248px, 1fr))",
                                }}
                            >
                                {gridMarkets.map((market) =>
                                    market.type === "multi" ? (
                                        <MultiCard
                                            key={market.id}
                                            market={market}
                                            onClick={() => onMarketClick(market.id)}
                                            onYes={(index) => onYesClick(market.id, index)}
                                            onNo={(index) => onNoClick(market.id, index)}
                                        />
                                    ) : (
                                        <BinaryCard
                                            key={market.id}
                                            market={market}
                                            onClick={() => onMarketClick(market.id)}
                                            onYes={() => onYesClick(market.id)}
                                            onNo={() => onNoClick(market.id)}
                                        />
                                    )
                                )}
                            </div>

                            {hasMore && (
                                <div className="flex justify-center mt-6">
                                    <button
                                        onClick={onLoadMore}
                                        disabled={isLoadingMore}
                                        className="px-5 py-2 text-[12px] font-medium rounded-lg transition-all duration-100 disabled:opacity-40 disabled:cursor-not-allowed"
                                        style={{
                                            color: DS.accentGray,
                                            background: DS.bgDark,
                                            border: `1px solid ${DS.bgSurface}`,
                                            cursor: "pointer",
                                        }}
                                        onMouseEnter={(event) => {
                                            event.currentTarget.style.color = DS.textPrimary;
                                            event.currentTarget.style.borderColor = DS.accentGray;
                                        }}
                                        onMouseLeave={(event) => {
                                            event.currentTarget.style.color = DS.accentGray;
                                            event.currentTarget.style.borderColor = DS.bgSurface;
                                        }}
                                    >
                                        {isLoadingMore ? "Loading…" : "Show more markets"}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 gap-2">
                            <p className="text-[13px] font-medium" style={{ color: DS.accentGray }}>
                                No markets found
                            </p>
                            <p className="text-[11px]" style={{ color: DS.textSecondary }}>
                                {searchQuery
                                    ? `No results for "${searchQuery}"`
                                    : "No markets in this category"}
                            </p>
                            {searchQuery && (
                                <button
                                    onClick={() => {
                                        onSearchChange("");
                                    }}
                                    className="mt-3 px-3.5 py-1.5 text-[11px] font-medium rounded-md transition-opacity hover:opacity-80"
                                    style={{
                                        color: DS.accentPrimary,
                                        background: "rgba(255,174,66,0.12)",
                                        border: `1px solid ${DS.accentDarker}`,
                                        cursor: "pointer",
                                    }}
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="hidden lg:flex w-56 shrink-0 flex-col gap-3 sticky top-[98px]">
                    <BreakingNewsSidebar items={breakingNews} />
                    <HotTopicsSidebar topics={hotTopics} />
                    {showSignUpCta ? <SignUpCTA /> : null}
                </div>
            </div>

            {/* ── FOOTER ──────────────────────────────────────────────────────── */}
            <footer
                style={{
                    borderTop: `1px solid ${DS.bgDarkGray}`,
                    marginTop: 48,
                    background: DS.bgDark,
                    display: "none",
                }}
            >
                {/* Main grid */}
                <div
                    style={{
                        maxWidth: 1380,
                        margin: "0 auto",
                        padding: "40px 20px 28px",
                        display: "grid",
                        gridTemplateColumns: "220px 1fr 1fr 1fr 1fr",
                        gap: 32,
                    }}
                >
                    {/* Brand */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div
                                style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 7,
                                    background: DS.accentGradient,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 14,
                                    boxShadow: "0 2px 8px rgba(124,58,237,0.4)",
                                }}
                            >
                                🎵
                            </div>
                            <span
                                style={{
                                    fontSize: 15,
                                    fontWeight: 800,
                                    color: DS.textPrimary,
                                    letterSpacing: "-0.02em",
                                }}
                            >
                                Marination Music
                            </span>
                        </div>
                        <p
                            style={{
                                fontSize: 11,
                                color: DS.accentGray,
                                lineHeight: 1.6,
                                marginTop: 2,
                            }}
                        >
                            The World's Largest Music
                            <br />
                            Prediction Market™
                        </p>
                    </div>

                    {/* Markets by category */}
                    <div>
                        <p
                            style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: DS.accentGray,
                                letterSpacing: "0.05em",
                                textTransform: "uppercase",
                                marginBottom: 14,
                            }}
                        >
                            Markets by category
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                            {[
                                ["Awards", "Predictions"],
                                ["Streaming", "Predictions"],
                                ["Taylor Swift", "Predictions"],
                                ["Bad Bunny", "Predictions"],
                                ["AI Music", "Predictions"],
                                ["Fed", "Predictions"],
                            ].map(([label, sub]) => (
                                <div
                                    key={label}
                                    style={{
                                        padding: "6px 0",
                                        borderBottom: `1px solid ${DS.bgDarkGray}`,
                                        cursor: "pointer",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 12,
                                            color: DS.textPrimary,
                                            marginBottom: 1,
                                            transition: "color 0.12s",
                                        }}
                                        onMouseEnter={(event) => {
                                            event.currentTarget.style.color = DS.accentPrimary;
                                        }}
                                        onMouseLeave={(event) => {
                                            event.currentTarget.style.color = DS.textPrimary;
                                        }}
                                    >
                                        {label}
                                    </div>
                                    <div style={{ fontSize: 10, color: DS.textSecondary }}>
                                        {sub}
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                style={{
                                    marginTop: 10,
                                    padding: 0,
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: 11,
                                    color: DS.accentPrimary,
                                    fontWeight: 600,
                                    textAlign: "left",
                                }}
                                onMouseEnter={(event) => {
                                    event.currentTarget.style.color = DS.accentMedium;
                                }}
                                onMouseLeave={(event) => {
                                    event.currentTarget.style.color = DS.accentPrimary;
                                }}
                            >
                                View more ↓
                            </button>
                        </div>
                    </div>

                    {/* Topics */}
                    <div>
                        <p
                            style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: DS.accentGray,
                                letterSpacing: "0.05em",
                                textTransform: "uppercase",
                                marginBottom: 14,
                            }}
                        >
                            Topics
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                            {[
                                ["Grammys 2026", "Predictions"],
                                ["Coachella 2026", "Predictions"],
                                ["Billboard Charts", "Predictions"],
                                ["Touring", "Predictions"],
                                ["Collabs", "Predictions"],
                                ["Vinyl Sales", "Predictions"],
                            ].map(([label, sub]) => (
                                <div
                                    key={label}
                                    style={{
                                        padding: "6px 0",
                                        borderBottom: `1px solid ${DS.bgDarkGray}`,
                                        cursor: "pointer",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 12,
                                            color: DS.textPrimary,
                                            marginBottom: 1,
                                            transition: "color 0.12s",
                                        }}
                                        onMouseEnter={(event) => {
                                            event.currentTarget.style.color = DS.accentPrimary;
                                        }}
                                        onMouseLeave={(event) => {
                                            event.currentTarget.style.color = DS.textPrimary;
                                        }}
                                    >
                                        {label}
                                    </div>
                                    <div style={{ fontSize: 10, color: DS.textSecondary }}>
                                        {sub}
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                style={{
                                    marginTop: 10,
                                    padding: 0,
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: 11,
                                    color: DS.accentPrimary,
                                    fontWeight: 600,
                                    textAlign: "left",
                                }}
                                onMouseEnter={(event) => {
                                    event.currentTarget.style.color = DS.accentMedium;
                                }}
                                onMouseLeave={(event) => {
                                    event.currentTarget.style.color = DS.accentPrimary;
                                }}
                            >
                                View more ↓
                            </button>
                        </div>
                    </div>

                    {/* Support & Social */}
                    <div>
                        <p
                            style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: DS.accentGray,
                                letterSpacing: "0.05em",
                                textTransform: "uppercase",
                                marginBottom: 14,
                            }}
                        >
                            Support &amp; Social
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {[
                                "Learn",
                                "𝕏 (Twitter)",
                                "Instagram",
                                "Discord",
                                "TikTok",
                                "News",
                                "Contact us",
                            ].map((label) => (
                                <a
                                    key={label}
                                    href="#"
                                    onClick={(event) => event.preventDefault()}
                                    style={{
                                        fontSize: 12,
                                        color: DS.textSecondary,
                                        textDecoration: "none",
                                        transition: "color 0.12s",
                                    }}
                                    onMouseEnter={(event) => {
                                        event.currentTarget.style.color = DS.textPrimary;
                                    }}
                                    onMouseLeave={(event) => {
                                        event.currentTarget.style.color = DS.textSecondary;
                                    }}
                                >
                                    {label}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Marination Music links */}
                    <div>
                        <p
                            style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: DS.accentGray,
                                letterSpacing: "0.05em",
                                textTransform: "uppercase",
                                marginBottom: 14,
                            }}
                        >
                            Marination Music
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {[
                                "Rewards",
                                "APIs",
                                "Leaderboard",
                                "Accuracy",
                                "Brand",
                                "Activity",
                                "Careers",
                                "Press",
                            ].map((label) => (
                                <a
                                    key={label}
                                    href="#"
                                    onClick={(event) => event.preventDefault()}
                                    style={{
                                        fontSize: 12,
                                        color: DS.textSecondary,
                                        textDecoration: "none",
                                        transition: "color 0.12s",
                                    }}
                                    onMouseEnter={(event) => {
                                        event.currentTarget.style.color = DS.textPrimary;
                                    }}
                                    onMouseLeave={(event) => {
                                        event.currentTarget.style.color = DS.textSecondary;
                                    }}
                                >
                                    {label}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div
                    style={{
                        borderTop: `1px solid ${DS.bgDarkGray}`,
                        maxWidth: 1380,
                        margin: "0 auto",
                        padding: "14px 20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 10,
                    }}
                >
                    {/* Social icons */}
                    <div style={{ display: "flex", gap: 8 }}>
                        {[
                            { ic: "✉️", lb: "Email" },
                            { ic: "𝕏", lb: "Twitter" },
                            { ic: "▶️", lb: "TikTok" },
                            { ic: "💬", lb: "Discord" },
                            { ic: "🎵", lb: "Music" },
                        ].map(({ ic, lb }) => (
                            <button
                                key={lb}
                                type="button"
                                title={lb}
                                style={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: 7,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 13,
                                    cursor: "pointer",
                                    background: "#171724",
                                    border: `1px solid ${DS.bgSurface}`,
                                    color: DS.textSecondary,
                                    transition: "all 0.12s",
                                }}
                                onMouseEnter={(event) => {
                                    event.currentTarget.style.background = DS.bgSurface;
                                    event.currentTarget.style.color = DS.textPrimary;
                                }}
                                onMouseLeave={(event) => {
                                    event.currentTarget.style.background = "#171724";
                                    event.currentTarget.style.color = DS.textSecondary;
                                }}
                            >
                                {ic}
                            </button>
                        ))}
                    </div>

                    {/* Copyright */}
                    <p style={{ fontSize: 10, color: DS.textSecondary, textAlign: "center" }}>
                        Adventure One QSS Inc. © 2026&nbsp;&nbsp;
                        {["Privacy", "Terms of Use", "Help Center", "Docs"].map((label, index) => (
                            <span key={label}>
                                {label === "Terms of Use" ? (
                                    <Link
                                        href="/terms-of-use"
                                        style={{
                                            color: DS.accentGray,
                                            textDecoration: "none",
                                            transition: "color 0.12s",
                                        }}
                                        onMouseEnter={(event) => {
                                            event.currentTarget.style.color = DS.textSecondary;
                                        }}
                                        onMouseLeave={(event) => {
                                            event.currentTarget.style.color = DS.accentGray;
                                        }}
                                    >
                                        {label}
                                    </Link>
                                ) : (
                                    <a
                                        href="#"
                                        onClick={(event) => event.preventDefault()}
                                        style={{
                                            color: DS.accentGray,
                                            textDecoration: "none",
                                            transition: "color 0.12s",
                                        }}
                                        onMouseEnter={(event) => {
                                            event.currentTarget.style.color = DS.textSecondary;
                                        }}
                                        onMouseLeave={(event) => {
                                            event.currentTarget.style.color = DS.accentGray;
                                        }}
                                    >
                                        {label}
                                    </a>
                                )}
                                {index < 3 && (
                                    <span style={{ margin: "0 6px", opacity: 0.35 }}>·</span>
                                )}
                            </span>
                        ))}
                    </p>

                    {/* Language */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 13 }}>🌐</span>
                        <select
                            defaultValue="English"
                            style={{
                                background: "#171724",
                                border: `1px solid ${DS.bgSurface}`,
                                color: DS.textSecondary,
                                fontSize: 11,
                                borderRadius: 5,
                                padding: "4px 8px",
                                cursor: "pointer",
                                outline: "none",
                            }}
                        >
                            <option>English</option>
                            <option>Español</option>
                            <option>Français</option>
                            <option>Português</option>
                        </select>
                    </div>
                </div>

                {/* Legal disclaimer */}
                <div
                    style={{
                        maxWidth: 1380,
                        margin: "0 auto",
                        padding: "0 20px 24px",
                    }}
                >
                    <p style={{ fontSize: 10, color: DS.textSecondary, lineHeight: 1.7 }}>
                        Marination Music operates globally and is provided by Adventure One QSS
                        Inc., a US-based technology company. This international platform is not
                        regulated by the CFTC and may not accept persons from certain jurisdictions.
                        Prediction markets involve financial risk — please trade responsibly. This
                        platform is not intended as financial advice. Past performance of any market
                        does not guarantee future results. Participation is subject to applicable
                        local laws and our Terms of Service.
                    </p>
                </div>
            </footer>
            <MarketFooter />
        </div>
    );
}
