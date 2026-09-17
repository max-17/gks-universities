import { notFound } from "next/navigation";

import { UniversityDetail } from "@/components/university-detail";
import type { UniversityDetailData } from "@/lib/university-data";
import { db } from "@/lib/prisma";

async function getUniversity(id: string): Promise<UniversityDetailData | null> {
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
