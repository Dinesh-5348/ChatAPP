import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "TO-DO-APP",
    template: "%s | TO-DO-APP",
  },
  description: "Todo app built with Next.js and Prisma",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
