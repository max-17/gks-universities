import type { Metadata } from "next";
import { cache, Suspense } from "react";
import { notFound } from "next/navigation";
import { UniversityDetailQuery } from "@/components/university-detail-query";
import { siteUrl } from "@/lib/seo";

import {
  UniversityDetail,
  type UniversityDetailFilters,
} from "@/components/university-detail";
import type { UniversityDetailData } from "@/lib/university-data";
import { db } from "@/lib/prisma";

const getUniversity = cache(async (id: string): Promise<UniversityDetailData | null> => {
  const university = await db.university.findUnique({
    where: { id },
    include: {
      programs: {
        orderBy: { department: "asc" },
        include: { fieldOfStudy: true },
      },
    },
  });

  if (!university) return null;

  const formatEnumValue = (value: string) =>
    value
      .toLowerCase()
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  const formatTrackType = (value: string) =>
    value === "UIC" ? "UIC" : formatEnumValue(value);
  const departments = [
    ...new Set(university.programs.map((program) => program.department)),
  ];
  const fields = [
    ...new Set(university.programs.map((program) => program.fieldOfStudy.name)),
  ];
  const degrees = [
    ...new Set(
      university.programs.map((program) => formatEnumValue(program.degree)),
    ),
  ];
  const applicationTracks = [
    ...new Set(
      university.programs.map((program) =>
        formatEnumValue(program.applicationTrack),
      ),
    ),
  ];
  const trackTypes = [
    ...new Set(
      university.programs.map((program) => formatTrackType(program.trackType)),
    ),
  ];
  const trackBadges = [
    ...new Set(
      university.programs.map(
        (program) =>
          `${formatEnumValue(program.applicationTrack)} (${formatTrackType(program.trackType)})`,
      ),
    ),
  ];
  const mediums = [
    ...new Set(
      university.programs
        .map((program) => program.mediumOfInstruction)
        .filter((medium): medium is string => Boolean(medium)),
    ),
  ];

  return {
    id: university.id,
    name: university.nameEn,
    city: university.location ?? "",
    nameKr: university.nameKr,
    websiteUrl: university.websiteUrl,
    phone: university.phone,
    email: university.email,
    remarks: university.remarks,
    departments,
    fields,
    degrees,
    applicationTracks,
    trackTypes,
    trackBadges,
    mediums,
    programFilters: university.programs.map((program) => ({
      applicationTrack: formatEnumValue(program.applicationTrack),
      trackType: formatTrackType(program.trackType),
      degree: formatEnumValue(program.degree),
      department: program.department,
      field: program.fieldOfStudy.name,
      medium: program.mediumOfInstruction ?? "",
    })),
    programs: university.programs.map((program) => ({
      id: program.id,
      applicationTrack: formatEnumValue(program.applicationTrack),
      trackType: formatTrackType(program.trackType),
      degree: formatEnumValue(program.degree),
      department: program.department,
      field: program.fieldOfStudy.name,
      medium: program.mediumOfInstruction ?? "",
      durationYears: program.durationYears,
      requiredTopik: program.requiredTopik,
      programStart: program.programStart,
    })),
  };
});

export const revalidate = 3600;
export async function generateStaticParams() {
  return db.university.findMany({ select: { id: true } });
}
export async function generateMetadata({ params }: PageProps<"/universities/[id]">): Promise<Metadata> {
  const { id } = await params;
  const university = await getUniversity(id);
  if (!university) notFound();
  const title = `${university.name} | GKS Scholarship Programs`;
  const description = `Explore Global Korea Scholarship programs at ${university.name}${university.city ? ` in ${university.city}` : ""}. Compare departments, degrees, application tracks and teaching languages.`;
  const url = `${siteUrl}/universities/${id}`;
  return { title, description, alternates: { canonical: url },
    openGraph: { title, description, url, type: "website" },
    twitter: { card: "summary", title, description } };
}
export default async function UniversityPage({ params }: PageProps<"/universities/[id]">) {
  const { id } = await params;
  const university = await getUniversity(id);
  if (!university) notFound();
  const initialFilters: UniversityDetailFilters = {
    applicationTracks: [], trackTypes: [], degrees: [], departments: [], fields: [], locations: [], mediums: [],
  };
  const structuredData = {
    "@context": "https://schema.org", "@type": "CollegeOrUniversity", name: university.name,
    alternateName: university.nameKr || undefined, url: `${siteUrl}/universities/${id}`,
    address: university.city ? { "@type": "PostalAddress", addressLocality: university.city, addressCountry: "KR" } : undefined,
  };
  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <div className="mx-auto w-full max-w-5xl p-5 sm:p-8">
        <Suspense fallback={<UniversityDetail university={university} initialFilters={initialFilters} />}>
          <UniversityDetailQuery university={university} />
        </Suspense>
      </div>
    </main>
  );
}
