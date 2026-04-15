import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-body",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Building in Public Agent",
  description:
    "Auto-generate marketing content from your codebase. Build in public, effortlessly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("font-sans", figtree.variable, bricolage.variable)}
    >
      <body>{children}</body>
    </html>
  );
}
