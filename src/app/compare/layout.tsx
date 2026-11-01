import type { Metadata } from "next";

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
  return children;
}
