"use client";

import type { ChangeEventHandler } from "react";
import { useLocale, useTranslations } from "next-intl";
import { DS } from "@/product/design-system/colors";
import { Link, usePathname, useRouter } from "@/libs/I18nNavigation";
import { routing } from "@/libs/I18nRouting";
import Image from "next/image";

const marketFooterSectionHeadingClass =
  "market-footer-section-heading mb-[18px] text-xs font-bold text-[#F2F2F7] max-sm:mb-3 max-sm:text-[11px] max-sm:uppercase max-sm:tracking-[0.04em] max-sm:!text-[#8F9098]";

const marketFooterLinkColumnClass =
  "market-footer-link-column max-sm:[&_a]:flex max-sm:[&_a]:min-h-10 max-sm:[&_a]:w-full max-sm:[&_a]:items-center max-sm:[&_a]:!text-[13px] max-sm:[&_a]:leading-[1.3]";

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
    <div
      className={`${marketFooterLinkColumnClass} market-footer-language col-span-2 border-t border-[#202020] pt-[18px] lg:col-span-1 lg:border-t-0 lg:pt-0`}
    >
      <p className={marketFooterSectionHeadingClass}>
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
    { label: "Blog", href: "/blog" },
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

  const linkListClass = "market-footer-link-list flex flex-col gap-3 max-sm:gap-2.5";

  return (
    <footer
      style={{
        borderTop: `1px solid ${DS.bgDarkGray}`,
        marginTop: 48,
        background: DS.bgDark,
      }}
    >
      {/* Main grid */}
      <div className="market-footer-main-grid mx-auto grid w-full max-w-[1380px] grid-cols-2 gap-x-4 gap-y-[22px] px-4 py-7 pb-[22px] sm:gap-10 sm:px-5 sm:py-10 sm:pb-7 lg:grid-cols-[minmax(200px,1fr)_repeat(4,minmax(140px,1fr))] lg:gap-[52px]">
        {/* Brand */}
        <div className="market-footer-brand flex flex-col gap-2.5 max-sm:col-span-2 max-sm:items-center max-sm:border-b max-sm:border-[#202020] max-sm:pb-5 max-sm:text-center">
          <div className="flex items-center gap-2 max-sm:justify-center">
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
          <p className="mt-0.5 text-[11px] leading-relaxed text-[#767676]">
            Predict the music. Win for knowing it.
          </p>
        </div>

        {/* Company */}
        <div className={marketFooterLinkColumnClass}>
          <p
            className={marketFooterSectionHeadingClass}
          >
            Company
          </p>

          <div className={linkListClass}>
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
        <div className={marketFooterLinkColumnClass}>
          <p className={marketFooterSectionHeadingClass}>
            Social
          </p>

          <div className={linkListClass}>
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
        <div
          className={`${marketFooterLinkColumnClass} market-footer-product max-sm:col-span-2 max-sm:border-t max-sm:border-[#202020] max-sm:pt-[18px]`}
        >
          <p className={marketFooterSectionHeadingClass}>
            Product
          </p>

          <div className={linkListClass}>
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
      <div className="market-footer-bottom-bar mx-auto flex max-w-[1380px] flex-col items-center gap-2.5 border-t border-[#202020] px-5 py-[14px] lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center">
        {/* Social icons */}
        <div className="market-footer-social-icons flex justify-center gap-[14px] lg:justify-start">
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
        <p className="text-center text-[10px] text-[#8F9098]">
          © 2026 MarinationMusic LLC.
        </p>
      </div>

      {/* Legal disclaimer */}
      <div className="market-footer-legal-wrap mx-auto max-w-[1380px] px-5 pb-6 max-sm:px-4 max-sm:pb-7">
        <p className="market-footer-legal-text text-center text-[10px] leading-[1.7] text-[#8F9098] max-sm:text-left max-sm:text-[11px] max-sm:leading-[1.65]">
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

