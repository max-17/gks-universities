import type { Metadata } from "next";
import { Providers } from "@/app/providers";

export const metadata: Metadata = {
  title: "Compare universities",
  robots: { index: false, follow: true },
  alternates: { canonical: "/compare" },
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Providers>{children}</Providers>;
}
