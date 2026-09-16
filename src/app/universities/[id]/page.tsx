import { notFound } from "next/navigation";

import { UniversityDetail } from "@/components/university-detail";
import type { UniversityDetailData } from "@/lib/university-data";

async function getUniversity(id: string): Promise<UniversityDetailData | null> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/universities/${id}`,
    { cache: "no-store" },
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Unable to load university.");
  return response.json();
}

export default async function UniversityPage({
  params,
}: PageProps<"/universities/[id]">) {
  const { id } = await params;
  const university = await getUniversity(id);
  if (!university) notFound();

  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-5xl p-5 sm:p-8">
        <UniversityDetail university={university} />
      </div>
    </main>
  );
}
