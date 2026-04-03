"use client";

import type { ChangeEventHandler } from "react";
import { useLocale, useTranslations } from "next-intl";
import { DS } from "@/product/design-system/colors";
import { Link, usePathname, useRouter } from "@/libs/I18nNavigation";
import { routing } from "@/libs/I18nRouting";
import Image from "next/image";

/**
 * Footer language selector: switches locale while preserving path and query string.
 */
function MarketFooterLanguageSelect() {
  const t = useTranslations("MarketFooter");
  const tLocale = useTranslations("LocaleSwitcher");
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const handleChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    const newLocale = event.target.value;
    if (newLocale === locale) {
      return;
    }
    const { search } = window.location;
    router.push(`${pathname}${search}`, { locale: newLocale, scroll: false });
  };

  const localeLabel = (code: string) => (code === "fr" ? t("locale_fr") : t("locale_en"));

  return (
    <div className="market-footer-link-column market-footer-language">
      <p
        className="market-footer-section-heading"
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: DS.textPrimary,
          marginBottom: 18,
        }}
      >
        {t("language_heading")}
      </p>
      <select
        value={locale}
        onChange={handleChange}
        aria-label={tLocale("change_language")}
        className="w-full max-w-[200px] cursor-pointer rounded-lg border px-3 py-2 text-[12px] outline-none transition-[border-color,box-shadow] focus-visible:ring-2"
        style={{
          background: DS.bgDarkest,
          borderColor: DS.bgSurface,
          color: DS.textPrimary,
          boxShadow: "none",
        }}
        onFocus={(event) => {
          event.currentTarget.style.borderColor = DS.accentDarker;
        }}
        onBlur={(event) => {
          event.currentTarget.style.borderColor = DS.bgSurface;
        }}
      >
        {routing.locales.map((code) => (
          <option key={code} value={code}>
            {localeLabel(code)}
          </option>
        ))}
      </select>
    </div>
  );
}

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
    { label: "FAQ", href: "/faq" },
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
        className="market-footer-main-grid"
        style={{
          maxWidth: 1380,
          margin: "0 auto",
          padding: "40px 20px 28px",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 32,
        }}
      >
        {/* Brand */}
        <div
          className="market-footer-brand"
          style={{ display: "flex", flexDirection: "column", gap: 10 }}
        >
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
        <div className="market-footer-link-column">
          <p
            className="market-footer-section-heading"
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: DS.textPrimary,
              marginBottom: 18,
            }}
          >
            Company
          </p>

          <div className="market-footer-link-list" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
        <div className="market-footer-link-column">
          <p
            className="market-footer-section-heading"
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: DS.textPrimary,
              marginBottom: 18,
            }}
          >
            Social
          </p>

          <div className="market-footer-link-list" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
        <div className="market-footer-link-column market-footer-product">
          <p
            className="market-footer-section-heading"
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: DS.textPrimary,
              marginBottom: 18,
            }}
          >
            Product
          </p>

          <div className="market-footer-link-list" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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

        <MarketFooterLanguageSelect />
      </div>

      {/* Bottom bar */}
      <div
        className="market-footer-bottom-bar"
        style={{
          borderTop: `1px solid ${DS.bgDarkGray}`,
          maxWidth: 1380,
          margin: "0 auto",
          padding: "14px 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        {/* Social icons */}
        <div className="market-footer-social-icons" style={{ display: "flex", gap: 14 }}>
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

      <style jsx>{`
        .market-footer-main-grid {
          width: 100%;
        }

        .market-footer-bottom-bar {
          justify-content: center;
        }

        .market-footer-social-icons {
          justify-content: center;
        }

        @media (max-width: 639px) {
          .market-footer-main-grid {
            grid-template-columns: 1fr 1fr !important;
            column-gap: 16px !important;
            row-gap: 22px !important;
            padding: 28px 16px 22px !important;
          }

          .market-footer-brand {
            grid-column: 1 / -1;
            align-items: center;
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #202020;
          }

          .market-footer-brand > div:first-child {
            justify-content: center;
          }

          .market-footer-section-heading {
            margin-bottom: 12px !important;
            font-size: 11px !important;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            color: #8f9098 !important;
          }

          .market-footer-link-list {
            gap: 10px !important;
          }

          .market-footer-link-column :global(a) {
            min-height: 40px;
            display: flex;
            align-items: center;
            width: 100%;
            font-size: 13px !important;
            line-height: 1.3;
          }

          .market-footer-product {
            grid-column: 1 / -1;
            padding-top: 18px;
            border-top: 1px solid #202020;
          }

          .market-footer-language {
            grid-column: 1 / -1;
            padding-top: 18px;
            border-top: 1px solid #202020;
          }

          .market-footer-legal-wrap {
            padding: 0 16px 28px !important;
          }

          .market-footer-legal-text {
            text-align: left !important;
            font-size: 11px !important;
            line-height: 1.65 !important;
          }
        }

        @media (min-width: 640px) and (max-width: 1023px) {
          .market-footer-language {
            grid-column: 1 / -1;
            padding-top: 18px;
            border-top: 1px solid #202020;
          }
        }

        @media (min-width: 640px) {
          .market-footer-main-grid {
            grid-template-columns: repeat(2, minmax(180px, 1fr)) !important;
            gap: 40px !important;
          }
        }

        @media (min-width: 1024px) {
          .market-footer-main-grid {
            grid-template-columns: minmax(200px, 1fr) repeat(4, minmax(140px, 1fr)) !important;
            gap: 52px !important;
          }

          .market-footer-language {
            border-top: none !important;
            padding-top: 0 !important;
          }

          .market-footer-bottom-bar {
            display: grid !important;
            grid-template-columns: 1fr auto 1fr !important;
            align-items: center;
          }

          .market-footer-social-icons {
            justify-content: flex-start;
          }
        }
      `}</style>

      {/* Legal disclaimer */}
      <div
        className="market-footer-legal-wrap"
        style={{
          maxWidth: 1380,
          margin: "0 auto",
          padding: "0 20px 24px",
        }}
      >
        <p className="market-footer-legal-text" style={{ fontSize: 10, color: DS.textSecondary, lineHeight: 1.7, textAlign: "center" }}>
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

