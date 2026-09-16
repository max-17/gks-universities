import type { UniversityCardData } from "@/components/university-card";

export type UniversityProgram = UniversityCardData["programFilters"][number] & {
  id: string;
  durationYears: number | null;
  requiredTopik: string | null;
  programStart: string | null;
};

export type UniversityDetailData = UniversityCardData & {
  nameKr: string | null;
  websiteUrl: string | null;
  phone: string | null;
  remarks: string | null;
  programs: UniversityProgram[];
};