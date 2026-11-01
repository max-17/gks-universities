"use client";

import { useSearchParams } from "next/navigation";
import {
  UniversityDetail,
  type UniversityDetailFilters,
} from "@/components/university-detail";
import type { UniversityDetailData } from "@/lib/university-data";

export function UniversityDetailQuery({
  university,
}: {
  university: UniversityDetailData;
}) {
  const query = useSearchParams();
  const initialFilters: UniversityDetailFilters = {
    applicationTracks: query.getAll("applicationTrack"),
    trackTypes: query.getAll("trackType"),
    degrees: query.getAll("degree"),
    departments: query.getAll("department"),
    fields: query.getAll("field"),
    locations: query.getAll("location"),
    mediums: query.getAll("medium"),
  };

  return (
    <UniversityDetail
      key={query.toString()}
      university={university}
      initialFilters={initialFilters}
      initialSearch={query.get("search") ?? ""}
    />
  );
}
