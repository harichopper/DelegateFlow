import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "DelegateFlow — Intent-Based Resource Delegation",
  description:
    "Trustless hierarchical resource delegation using MetaMask ERC-7715. Create, sub-delegate, and enforce granular on-chain permissions with ZK-gated authorization.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🛡️</text></svg>",
  },
  keywords: [
    "MetaMask",
    "Delegation",
    "ERC-7715",
    "Smart Accounts",
    "ZK Proofs",
    "DeFi",
    "DAO",
  ],
  openGraph: {
    title: "DelegateFlow",
    description: "Intent-Based Resource Delegation Protocol",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
