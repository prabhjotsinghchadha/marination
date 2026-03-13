import type { Metadata } from "next";
import { AppShellProvider } from "@/sections/shell/AppShellProvider";

export const metadata: Metadata = {
  title: "Marination Music – Discover Markets",
  description: "Explore live music prediction markets on Marination.",
};

export default function MarketingLayout(props: { children: React.ReactNode }) {
  const { children } = props;

  return (
    <html lang="en">
      <body>
        <AppShellProvider>{children}</AppShellProvider>
      </body>
    </html>
  );
}

