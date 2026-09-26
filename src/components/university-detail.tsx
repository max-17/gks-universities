"use client";

import { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UniversityDetailData } from "@/lib/university-data";

export type UniversityDetailFilters = {
  applicationTracks: string[];
  trackTypes: string[];
  degrees: string[];
  departments: string[];
  fields: string[];
  locations: string[];
  mediums: string[];
};

const quickFilters = [
  { label: "University track", key: "applicationTracks", value: "University" },
  { label: "Embassy track", key: "applicationTracks", value: "Embassy" },
  { label: "English", key: "mediums", value: "English" },
  { label: "Korean", key: "mediums", value: "Korean" },
  { label: "UIC", key: "trackTypes", value: "UIC" },
  { label: "Associate", key: "trackTypes", value: "Associate" },
  { label: "Bachelors", key: "degrees", value: "Bachelors" },
] as const;

function Value({ value }: { value: string | number | null }) {
  return <span>{value || "Not specified"}</span>;
}

export function UniversityDetail({
  university,
  initialFilters,
}: {
  university: UniversityDetailData;
  initialFilters: UniversityDetailFilters;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = useState(initialFilters);
  const filteredPrograms = useMemo(
    () =>
      university.programs.filter(
        (program) =>
          (filters.applicationTracks.length === 0 ||
            filters.applicationTracks.includes(program.applicationTrack)) &&
          (filters.trackTypes.length === 0 ||
            filters.trackTypes.includes(program.trackType)) &&
          (filters.degrees.length === 0 ||
            filters.degrees.includes(program.degree)) &&
          (filters.departments.length === 0 ||
            filters.departments.includes(program.department)) &&
          (filters.fields.length === 0 ||
            filters.fields.includes(program.field)) &&
          (filters.mediums.length === 0 ||
            filters.mediums.some((medium) =>
              program.medium
                .toLocaleLowerCase()
                .includes(medium.toLocaleLowerCase()),
            )),
      ),
    [filters, university.programs],
  );
  const applicableQuickFilters = quickFilters.filter((filter) =>
    university.programs.some((program) => {
      if (filter.key === "applicationTracks") {
        return program.applicationTrack === filter.value;
      }
      if (filter.key === "trackTypes") {
        return program.trackType === filter.value;
      }
      if (filter.key === "degrees") {
        return program.degree === filter.value;
      }
      return program.medium
        .toLocaleLowerCase()
        .includes(filter.value.toLocaleLowerCase());
    }),
  );

  function toggleFilter(
    key: keyof Pick<
      UniversityDetailFilters,
      "applicationTracks" | "trackTypes" | "degrees" | "mediums"
    >,
    value: string,
  ) {
    const nextValues = filters[key].includes(value)
      ? filters[key].filter((item) => item !== value)
      : [...filters[key], value];
    const nextFilters = { ...filters, [key]: nextValues };
    const params = new URLSearchParams();

    Object.entries(nextFilters).forEach(([filterKey, values]) => {
      values.forEach((item) => params.append(filterKey.slice(0, -1), item));
    });

    setFilters(nextFilters);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <article className="flex min-w-0 flex-col gap-8">
      <div className="flex flex-col gap-5 border-b pb-6">
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="wrap-break-word text-3xl font-bold tracking-tight sm:text-4xl">
            {university.name}
          </h1>
          {university.nameKr && (
            <p className="text-muted-foreground">{university.nameKr}</p>
          )}
          {university.city && (
            <p className="text-sm text-muted-foreground">{university.city}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {university.degrees.map((degree) => (
            <Badge key={degree}>{degree}</Badge>
          ))}
          {university.trackBadges.map((track) => (
            <Badge key={track} variant="secondary">
              {track}
            </Badge>
          ))}
        </div>
        {university.websiteUrl && (
          <Button
            nativeButton={false}
            render={
              <a
                href={university.websiteUrl}
                target="_blank"
                rel="noreferrer"
              />
            }
            variant="outline"
            className="w-fit"
          >
            University website <ExternalLink className="size-4" />
          </Button>
        )}
      </div>

      <section
        className="grid gap-6 sm:grid-cols-2"
        aria-label="University information"
      >
        <Info label="Mediums of instruction" values={university.mediums} />
        <Info
          label="Contact"
          values={[university.phone].filter((value): value is string =>
            Boolean(value),
          )}
        />
        <Info
          label="Email"
          values={[university.email].filter((value): value is string =>
            Boolean(value),
          )}
        />
      </section>

      {university.remarks && (
        <section className="border-y py-6">
          <h2 className="mb-2 text-lg font-semibold">Notes</h2>
          <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
            {university.remarks}
          </p>
        </section>
      )}

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Available programs</h2>
          <p className="text-sm text-muted-foreground">
            {filteredPrograms.length} of {university.programs.length} programs
          </p>
        </div>
        <div
          className="flex flex-wrap gap-2"
          aria-label="Quick program filters"
        >
          {applicableQuickFilters.map((filter) => {
            const active = filters[filter.key].includes(filter.value);

            return (
              <Button
                key={filter.label}
                type="button"
                size="sm"
                variant={active ? "default" : "outline"}
                aria-pressed={active}
                onClick={() => toggleFilter(filter.key, filter.value)}
              >
                {filter.label}
              </Button>
            );
          })}
        </div>
        <div className="grid gap-3">
          {filteredPrograms.map((program, index) => (
            <article
              key={`${university.id}-${program.id ?? index}`}
              className="min-w-0 border p-4"
            >
              <div className="flex flex-wrap gap-1.5">
                <Badge>{program.degree}</Badge>
                <Badge variant="secondary">
                  {program.applicationTrack} ({program.trackType})
                </Badge>
              </div>
              <h3 className="mt-3 wrap-break-word font-semibold">
                {program.department}
              </h3>
              <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                <Detail label="Field" value={program.field} />
                <Detail label="Medium" value={program.medium} />
                <Detail
                  label="Duration"
                  value={
                    program.durationYears
                      ? `${program.durationYears} years`
                      : null
                  }
                />
                <Detail label="Required TOPIK" value={program.requiredTopik} />
                <Detail label="Program starts" value={program.programStart} />
              </dl>
            </article>
          ))}
          {filteredPrograms.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No programs match the selected filters.
            </p>
          )}
        </div>
      </section>
    </article>
  );
}

function Info({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </h2>
      <div className="flex flex-wrap gap-1.5">
        {values.length ? (
          values.map((value) => (
            <Badge key={value} variant="outline">
              {value}
            </Badge>
          ))
        ) : (
          <Value value={null} />
        )}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="wrap-break-word">
        <Value value={value} />
      </dd>
    </div>
  );
}
