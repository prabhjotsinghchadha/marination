"use client";

import { DS } from "@/product/design-system/colors";
import { Link } from "@/libs/I18nNavigation";

export function MarketFooter() {
  return (
    <footer
      style={{
        borderTop: `1px solid ${DS.bgDarkGray}`,
        marginTop: 48,
        background: DS.bgDark,
      }}
    >
      {/* Main grid */}
      <div
        style={{
          maxWidth: 1380,
          margin: "0 auto",
          padding: "40px 20px 28px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
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
                <div style={{ fontSize: 10, color: DS.textSecondary }}>{sub}</div>
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
                <div style={{ fontSize: 10, color: DS.textSecondary }}>{sub}</div>
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
            {["Learn", "𝕏 (Twitter)", "Instagram", "Discord", "TikTok", "News", "Contact us"].map(
              (label) => (
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
              ),
            )}
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
            {["Rewards", "APIs", "Leaderboard", "Accuracy", "Brand", "Activity", "Careers", "Press"].map(
              (label) => (
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
              ),
            )}
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
              {label === "Privacy" ? (
                <Link
                  href="/privacy-policy"
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
              ) : label === "Terms of Use" ? (
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
              ) : label === "Help Center" ? (
                <Link
                  href="/help-center"
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
              ) : label === "Docs" ? (
                <Link
                  href="/docs"
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
              {index < 3 && <span style={{ margin: "0 6px", opacity: 0.35 }}>·</span>}
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
          Marination Music operates globally and is provided by Adventure One QSS Inc., a US-based technology
          company. This international platform is not regulated by the CFTC and may not accept persons from
          certain jurisdictions. Prediction markets involve financial risk — please trade responsibly. This
          platform is not intended as financial advice. Past performance of any market does not guarantee
          future results. Participation is subject to applicable local laws and our Terms of Service.
        </p>
      </div>
    </footer>
  );
}

