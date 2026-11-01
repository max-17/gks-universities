import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { cn } from "@/lib/utils";
import { siteName, siteUrl } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GKS Finder | Find your university",
    template: "%s | GKS Finder",
  },
  description:
    "Explore Korean universities and departments participating in the Global Korea Scholarship.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "GKS Finder | Find your university",
    description:
      "Explore Korean universities and programs participating in the Global Korea Scholarship.",
    url: siteUrl,
    siteName,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "GKS Finder | Find your university",
    description:
      "Explore Korean universities and programs participating in the Global Korea Scholarship.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, "font-sans")}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
