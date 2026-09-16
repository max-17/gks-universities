import { ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UniversityDetailData } from "@/lib/university-data";

function Value({ value }: { value: string | number | null }) {
  return <span>{value || "Not specified"}</span>;
}

export function UniversityDetail({
  university,
}: {
  university: UniversityDetailData;
}) {
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
        <Info label="Departments" values={university.departments} />
        <Info label="Fields of study" values={university.fields} />
        <Info label="Mediums of instruction" values={university.mediums} />
        <Info
          label="Contact"
          values={[university.phone].filter((value): value is string =>
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
            {university.programs.length} programs
          </p>
        </div>
        <div className="grid gap-3">
          {university.programs.map((program, index) => (
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
