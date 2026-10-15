import type { UniversityCardData } from "@/components/university-card";

export function filterUniversities(
  universities: UniversityCardData[],
  params: URLSearchParams,
) {
  const normalize = (value: string) => value.trim().toLowerCase();
  const values = (key: string) => params.getAll(key).map(normalize).filter(Boolean);
  const search = normalize(params.get("search") ?? "");
  const locations = values("location");
  const mediums = values("medium");
  const programKeys = ["department", "field", "degree", "applicationTrack", "trackType"] as const;
  const filters = programKeys.map((key) => ({ key, values: values(key) }));

  return universities.filter((university) => {
    if (locations.length && !locations.includes(normalize(university.city))) return false;
    if (search && ![
      university.name, university.city, ...university.departments,
      ...university.fields, ...university.degrees, ...university.trackBadges,
      ...university.mediums,
    ].some((value) => normalize(value).includes(search))) return false;

    const hasProgramFilters = mediums.length > 0 || filters.some((filter) => filter.values.length > 0);
    return !hasProgramFilters || university.programFilters.some((program) =>
      filters.every((filter) => !filter.values.length || filter.values.includes(normalize(program[filter.key]))) &&
      (!mediums.length || mediums.some((medium) => normalize(program.medium).includes(medium))),
    );
  });
}
