import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitCompareArrows } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { KeyboardEvent, MouseEvent } from "react";

export type UniversityCardData = {
  id: string;
  name: string;
  city: string;
  departments: string[];
  fields: string[];
  degrees: string[];
  trackBadges: string[];
  mediums: string[];
  applicationTracks: string[];
  trackTypes: string[];
  programFilters: {
    applicationTrack: string;
    trackType: string;
    degree: string;
    department: string;
    field: string;
    medium: string;
  }[];
};

function LimitedBadges({
  values,
  variant = "outline",
}: {
  values: string[];
  variant?: "outline" | "secondary";
}) {
  const visibleValues = values.slice(0, 3);
  const remainingCount = Math.max(values.length - visibleValues.length, 0);

  if (values.length === 0) {
    return <span className="text-sm">Not specified</span>;
  }

  return (
    <div className="flex min-w-0 flex-wrap gap-1.5">
      {visibleValues.map((value) => (
        <Badge key={value} variant={variant} className="max-w-full truncate">
          {value}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Badge variant="outline">+{remainingCount} more</Badge>
      )}
    </div>
  );
}

function Detail({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="min-w-0">
        <LimitedBadges values={values} />
      </dd>
    </div>
  );
}

function SummaryBadges({ university }: { university: UniversityCardData }) {
  return (
    <div className="flex min-w-0 flex-wrap gap-1.5">
      {university.degrees.map((degree) => (
        <Badge key={`degree-${degree}`} className="max-w-full truncate">
          {degree === "Uic" ? "UIC" : degree}
        </Badge>
      ))}
      {university.trackBadges.map((trackBadge) => (
        <Badge
          key={trackBadge}
          variant="secondary"
          className="max-w-full truncate"
        >
          {trackBadge}
        </Badge>
      ))}
    </div>
  );
}

function DepartmentDetail({ departments }: { departments: string[] }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Departments
      </dt>
      <dd>
        <LimitedBadges values={departments} variant="secondary" />
      </dd>
    </div>
  );
}

export function UniversityCard({
  university,
  isCompared = false,
  onCompare,
}: {
  university: UniversityCardData;
  isCompared?: boolean;
  onCompare?: () => void;
}) {
  const router = useRouter();
  const detailsPath = `/universities/${university.id}`;

  function openDetails() {
    router.push(detailsPath);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openDetails();
    }
  }

  function stopCardNavigation(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
  }

  return (
    <article
      className={`flex min-w-0 cursor-pointer flex-col gap-4 rounded-xl border-2 bg-card p-4 text-card-foreground shadow-sm transition-colors hover:border-primary/60 sm:gap-5 sm:p-5 ${isCompared ? "border-primary" : "border-border"}`}
      onClick={openDetails}
      onKeyDown={handleKeyDown}
      role="link"
      tabIndex={0}
      aria-label={`View details for ${university.name}`}
    >
      <header className="flex min-w-0 flex-col gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <Link
            href={detailsPath}
            className="wrap-break-word text-lg font-semibold leading-tight hover:underline sm:text-xl"
          >
            {university.name}
          </Link>
          {university.city && (
            <p className="text-sm text-muted-foreground">{university.city}</p>
          )}
        </div>
        <SummaryBadges university={university} />
      </header>

      <dl className="grid min-w-0 gap-4 sm:grid-cols-2">
        <DepartmentDetail departments={university.departments} />
        <Detail label="Field of study" values={university.fields} />
        <Detail label="Medium" values={university.mediums} />
      </dl>

      <footer className="flex flex-wrap items-center justify-end gap-2 border-t pt-4">
        {onCompare && (
          <Button
            type="button"
            variant={isCompared ? "secondary" : "outline"}
            size="sm"
            onClick={(event) => {
              stopCardNavigation(event);
              onCompare();
            }}
          >
            <GitCompareArrows className="size-4" />
            {isCompared ? "Added to compare" : "Compare"}
          </Button>
        )}
      </footer>
    </article>
  );
}
