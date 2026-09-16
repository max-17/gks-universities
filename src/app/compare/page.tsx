"use client";

import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { UniversityDetail } from "@/components/university-detail";
import type { UniversityDetailData } from "@/lib/university-data";

async function fetchUniversities(ids: string[]) {
  const responses = await Promise.all(
    ids.map((id) => fetch(`/api/universities/${id}`)),
  );
  if (responses.some((response) => !response.ok)) {
    throw new Error("Unable to load comparison.");
  }
  return Promise.all(
    responses.map(
      (response) => response.json() as Promise<UniversityDetailData>,
    ),
  );
}

function CompareContent() {
  const searchParams = useSearchParams();
  const ids = (searchParams.get("ids") ?? "")
    .split(",")
    .filter(Boolean)
    .slice(0, 3);
  const {
    data: universities = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["compare", ids],
    queryFn: () => fetchUniversities(ids),
    enabled: ids.length > 0,
  });

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 p-5 sm:p-8">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium hover:underline"
        >
          <ArrowLeft className="size-4" /> Back to universities
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Compare universities</h1>
          <p className="mt-1 text-muted-foreground">
            Compare up to three GKS universities side by side.
          </p>
        </div>

        {isLoading && (
          <p className="text-sm text-muted-foreground">Loading comparison...</p>
        )}
        {isError && (
          <p className="text-sm text-destructive">
            Unable to load the selected universities.
          </p>
        )}
        {!isLoading && !isError && universities.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Select universities from the home page to compare them.
          </p>
        )}
        {!isLoading && !isError && universities.length > 0 && (
          <>
            {universities.length > 1 && (
              <div
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground md:hidden"
                aria-label="More universities available horizontally"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
                <span>Swipe to compare more universities</span>
                <ChevronRight className="size-4" aria-hidden="true" />
              </div>
            )}
            <div className="grid auto-cols-[100%] grid-flow-col gap-4 overflow-x-auto snap-x snap-mandatory pb-4 md:auto-cols-fr md:grid-flow-col">
              {universities.map((university) => (
                <div key={university.id} className="min-w-0 snap-start">
                  <UniversityDetail university={university} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function ComparePage() {
  return (
    <Suspense>
      <CompareContent />
    </Suspense>
  );
}
