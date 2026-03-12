import type { Metadata } from "next";
// import "./globals.css";

export const metadata: Metadata = {
    title: "AMM Testbed",
    description: "Constant-product market maker simulator",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
