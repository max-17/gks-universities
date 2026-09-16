import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

function formatEnumValue(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatTrackType(value: string) {
  return value === "UIC" ? "UIC" : formatEnumValue(value);
}

export async function GET() {
  const universities = await db.university.findMany({
    orderBy: { nameEn: "asc" },
    include: {
      programs: {
        orderBy: { department: "asc" },
        include: {
          fieldOfStudy: true,
        },
      },
    },
  });

  const result = universities.map((university) => {
    const departments = [
      ...new Set(university.programs.map((program) => program.department)),
    ];
    const fields = [
      ...new Set(
        university.programs.map((program) => program.fieldOfStudy.name),
      ),
    ];
    const degrees = [
      ...new Set(
        university.programs.map((program) => formatEnumValue(program.degree)),
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
    const applicationTracks = [
      ...new Set(
        university.programs.map((program) =>
          formatEnumValue(program.applicationTrack),
        ),
      ),
    ];
    const trackTypes = [
      ...new Set(
        university.programs.map((program) =>
          formatTrackType(program.trackType),
        ),
      ),
    ];
    const programFilters = university.programs.map((program) => ({
      applicationTrack: formatEnumValue(program.applicationTrack),
      trackType: formatTrackType(program.trackType),
      degree: formatEnumValue(program.degree),
      department: program.department,
      field: program.fieldOfStudy.name,
      medium: program.mediumOfInstruction ?? "",
    }));

    return {
      id: university.id,
      name: university.nameEn,
      city: university.location ?? "",
      departments,
      fields,
      degrees,
      trackBadges,
      mediums,
      applicationTracks,
      trackTypes,
      programFilters,
    };
  });

  return NextResponse.json(result);
}
