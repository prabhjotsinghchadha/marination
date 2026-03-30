import type { Metadata } from "next";
import { AppShellProvider } from "@/sections/shell/AppShellProvider";
import { ClerkLocaleProvider } from "@/app/[locale]/ClerkLocaleProvider";
import { setRequestLocale } from "next-intl/server";

export const metadata: Metadata = {
  title: "Marination Music – Discover Markets",
  description: "Explore live music prediction markets on Marination.",
};

export default async function MarketingLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { children, params } = props;
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <html lang={locale}>
      <body>
        <ClerkLocaleProvider locale={locale}>
          <AppShellProvider>{children}</AppShellProvider>
        </ClerkLocaleProvider>
      </body>
    </html>
  );
}

