"use client";

import { DS } from "@/product/design-system/colors";
import { Link } from "@/libs/I18nNavigation";
import Image from "next/image";

export function MarketFooter() {
  const companyLinks = [
    { label: "About", href: "/about" },
    { label: "Blog", href: "#" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms Of Use", href: "/terms-of-use" },
  ] as const;

  const socialLinks = [
    { label: "TikTok", href: "#" },
    { label: "Instagram", href: "#" },
    { label: "YouTube", href: "#" },
    { label: "Discord", href: "#" },
  ] as const;

  const productLinks = [
    { label: "Help Center", href: "/help-center" },
    { label: "FAQ", href: "#" },
    { label: "Rewards Program", href: "#" },
    { label: "Press", href: "#" },
  ] as const;

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
            gridTemplateColumns: "minmax(220px, 1fr) repeat(3, minmax(180px, 1fr))",
            gap: 52,
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
                background: "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "none",
              }}
            >
              <Image
                src="/assets/logo/logo_minimal_white.png"
                alt="MariNation logo"
                width={18}
                height={18}
                style={{ objectFit: "contain" }}
                priority
              />
            </div>
            <span
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: DS.textPrimary,
                letterSpacing: "-0.02em",
              }}
            >
              MariNation
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
            Predict the music. Win for knowing it.
          </p>
        </div>

        {/* Company */}
        <div>
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: DS.textPrimary,
              marginBottom: 18,
            }}
          >
            Company
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {companyLinks.map((link) => {
              if (link.href.startsWith("/")) {
                return (
                  <Link
                    key={link.label}
                    href={link.href}
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
                    {link.label}
                  </Link>
                );
              }

              return (
                <a
                  key={link.label}
                  href={link.href}
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
                  {link.label}
                </a>
              );
            })}
          </div>
        </div>

        {/* Social */}
        <div>
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: DS.textPrimary,
              marginBottom: 18,
            }}
          >
            Social
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {socialLinks.map((link) => {
              if (link.href.startsWith("/")) {
                return (
                  <Link
                    key={link.label}
                    href={link.href}
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
                    {link.label}
                  </Link>
                );
              }

              return (
                <a
                  key={link.label}
                  href={link.href}
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
                  {link.label}
                </a>
              );
            })}
          </div>
        </div>

        {/* Product */}
        <div>
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: DS.textPrimary,
              marginBottom: 18,
            }}
          >
            Product
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {productLinks.map((link) => {
              if (link.href.startsWith("/")) {
                return (
                  <Link
                    key={link.label}
                    href={link.href}
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
                    {link.label}
                  </Link>
                );
              }

              return (
                <a
                  key={link.label}
                  href={link.href}
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
                  {link.label}
                </a>
              );
            })}
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
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: 10,
        }}
      >
        {/* Social icons */}
        <div style={{ display: "flex", gap: 14 }}>
          {[
            { ic: "✉️", lb: "Email" },
            { ic: "▶️", lb: "TikTok" },
            { ic: "📷", lb: "Instagram" },
          ].map(({ ic, lb }) => (
            <button
              key={lb}
              type="button"
              title={lb}
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                cursor: "pointer",
                background: "transparent",
                border: "none",
                color: DS.textSecondary,
                transition: "all 0.12s",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.color = DS.textPrimary;
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.color = DS.textSecondary;
              }}
            >
              {ic}
            </button>
          ))}
        </div>

        {/* Copyright */}
        <p style={{ fontSize: 10, color: DS.textSecondary, textAlign: "center" }}>
          © 2026 MarinationMusic LLC.
        </p>
      </div>

      {/* Legal disclaimer */}
      <div
        style={{
          maxWidth: 1380,
          margin: "0 auto",
          padding: "0 20px 24px",
        }}
      >
        <p style={{ fontSize: 10, color: DS.textSecondary, lineHeight: 1.7, textAlign: "center" }}>
          Marination is operated by Marination Markets LLC, a Delaware limited liability company and wholly
          owned subsidiary of MarinationMusic LLC. Marination is also a software-based music prediction
          competition platform and is not regulated by the CFTC or any other financial regulatory body.
          Participation involves risk of loss. Must be 18 or older. Not available in certain states. See
          our{" "}
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
            Terms of Use
          </Link>
          ,{" "}
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
            Privacy Policy
          </Link>
          , and Platform Rule.
        </p>
      </div>
    </footer>
  );
}

