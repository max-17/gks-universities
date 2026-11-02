"use client";

import {
  lazy,
  Suspense,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Filter, GraduationCap, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { UniversityFilterValues } from "@/components/university-filter-panel";
import {
  UniversityCard,
  type UniversityCardData,
} from "@/components/university-card";
import { Input } from "@/components/ui/input";
const UniversityFilterPanel = lazy(
  () => import("@/components/university-filter-panel"),
);
const desktopMediaQuery = "(min-width: 64rem)";
function subscribeToDesktop(onChange: () => void) {
  const query = window.matchMedia(desktopMediaQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
function getDesktopSnapshot() {
  return window.matchMedia(desktopMediaQuery).matches;
}
function getServerDesktopSnapshot() {
  return false;
}

const checkboxFilterParams = {
  departments: "department",
  applicationTracks: "applicationTrack",
  trackTypes: "trackType",
  degrees: "degree",
  fields: "field",
  locations: "location",
  mediums: "medium",
} as const;

function HomeContent({
  universities,
  query = "",
}: {
  universities: UniversityCardData[];
  query?: string;
}) {
  const pathname = usePathname();
  const isDesktop = useSyncExternalStore(
    subscribeToDesktop,
    getDesktopSnapshot,
    getServerDesktopSnapshot,
  );
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileFiltersRequested, setMobileFiltersRequested] = useState(false);
  const mobileFiltersId = useId();
  const mobileFiltersTrigger = useRef<HTMLButtonElement>(null);
  const searchParams = useMemo(() => new URLSearchParams(query), [query]);
  const [search, setSearch] = useState(() => searchParams.get("search") ?? "");
  const [departments, setDepartments] = useState<string[]>(() =>
    searchParams.getAll(checkboxFilterParams.departments),
  );
  const [applicationTracks, setApplicationTracks] = useState<string[]>(() =>
    searchParams.getAll(checkboxFilterParams.applicationTracks),
  );
  const [trackTypes, setTrackTypes] = useState<string[]>(() =>
    searchParams.getAll(checkboxFilterParams.trackTypes),
  );
  const [degrees, setDegrees] = useState<string[]>(() =>
    searchParams.getAll(checkboxFilterParams.degrees),
  );
  const [fields, setFields] = useState<string[]>(() =>
    searchParams.getAll(checkboxFilterParams.fields),
  );
  const [locations, setLocations] = useState<string[]>(() =>
    searchParams.getAll(checkboxFilterParams.locations),
  );
  const [mediums, setMediums] = useState<string[]>(() =>
    searchParams.getAll(checkboxFilterParams.mediums),
  );
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    Object.values(checkboxFilterParams).forEach((param) =>
      params.delete(param),
    );
    applicationTracks.forEach((value) =>
      params.append(checkboxFilterParams.applicationTracks, value),
    );
    departments.forEach((value) =>
      params.append(checkboxFilterParams.departments, value),
    );
    trackTypes.forEach((value) =>
      params.append(checkboxFilterParams.trackTypes, value),
    );
    degrees.forEach((value) =>
      params.append(checkboxFilterParams.degrees, value),
    );
    fields.forEach((value) =>
      params.append(checkboxFilterParams.fields, value),
    );
    locations.forEach((value) =>
      params.append(checkboxFilterParams.locations, value),
    );
    mediums.forEach((value) =>
      params.append(checkboxFilterParams.mediums, value),
    );

    const query = params.toString();
    const nextUrl = query ? `${pathname}?${query}` : pathname;
    const currentUrl = `${pathname}${searchParams.toString() ? `?${searchParams}` : ""}`;

    if (nextUrl !== currentUrl) {
      window.history.replaceState(null, "", nextUrl);
    }
  }, [
    applicationTracks,
    departments,
    degrees,
    fields,
    locations,
    mediums,
    pathname,
    searchParams,
    search,
    trackTypes,
  ]);
  const filteredUniversities = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();

    return universities.flatMap((university) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          university.name,
          university.city,
          ...university.departments,
          ...university.fields,
          ...university.degrees,
          ...university.trackBadges,
          ...university.mediums,
        ].some((value) => value.toLocaleLowerCase().includes(normalizedSearch));
      const matchesLocation =
        locations.length === 0 || locations.includes(university.city);
      const matchingProgramFilters = university.programFilters.filter(
        (program) =>
          (applicationTracks.length === 0 ||
            applicationTracks.includes(program.applicationTrack)) &&
          (trackTypes.length === 0 || trackTypes.includes(program.trackType)) &&
          (degrees.length === 0 || degrees.includes(program.degree)) &&
          (fields.length === 0 || fields.includes(program.field)) &&
          (departments.length === 0 ||
            departments.includes(program.department)) &&
          (mediums.length === 0 ||
            mediums.some((medium) =>
              program.medium
                .toLocaleLowerCase()
                .includes(medium.toLocaleLowerCase()),
            )),
      );

      if (
        !matchesSearch ||
        !matchesLocation ||
        matchingProgramFilters.length === 0
      ) {
        return [];
      }

      return [{ university, matchingProgramFilters }];
    });
  }, [
    applicationTracks,
    degrees,
    departments,
    fields,
    locations,
    mediums,
    search,
    trackTypes,
    universities,
  ]);

  const detailsFilterQuery = useMemo(() => {
    const params = new URLSearchParams();
    const filters = [
      [checkboxFilterParams.departments, departments],
      [checkboxFilterParams.applicationTracks, applicationTracks],
      [checkboxFilterParams.trackTypes, trackTypes],
      [checkboxFilterParams.degrees, degrees],
      [checkboxFilterParams.fields, fields],
      [checkboxFilterParams.locations, locations],
      [checkboxFilterParams.mediums, mediums],
    ] as const;

    if (search.trim()) params.set("search", search.trim());
    filters.forEach(([key, values]) => {
      values.forEach((value) => params.append(key, value));
    });

    return params.toString();
  }, [
    applicationTracks,
    degrees,
    departments,
    fields,
    locations,
    mediums,
    search,
    trackTypes,
  ]);

  function clearFilters() {
    setDepartments([]);
    setApplicationTracks([]);
    setTrackTypes([]);
    setDegrees([]);
    setFields([]);
    setLocations([]);
    setMediums([]);
  }

  function toggleCompare(id: string) {
    setCompareIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 3) return current;
      return [...current, id];
    });
  }

  const filterValues: UniversityFilterValues = {
    departments,
    applicationTracks,
    trackTypes,
    degrees,
    fields,
    locations,
    mediums,
  };
  function changeFilter(key: keyof UniversityFilterValues, values: string[]) {
    const setters = {
      departments: setDepartments,
      applicationTracks: setApplicationTracks,
      trackTypes: setTrackTypes,
      degrees: setDegrees,
      fields: setFields,
      locations: setLocations,
      mediums: setMediums,
    };
    setters[key](values);
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      <header className="fixed inset-x-0 top-0 z-30 border-b bg-background/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex min-h-16 w-full min-w-0 max-w-[1600px] items-center gap-4 overflow-hidden px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            aria-label="GKS Finder home"
            className="flex shrink-0 items-center gap-3"
          >
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="size-5" aria-hidden="true" />
            </span>
            <span className="hidden text-base font-bold tracking-tight sm:inline sm:text-lg">
              GKS Finder
            </span>
          </Link>
          <div className="relative w-0 min-w-0 flex-1 sm:mx-auto sm:max-w-xl lg:absolute lg:left-1/2 lg:top-1/2 lg:w-full lg:-translate-x-1/2 lg:-translate-y-1/2">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              aria-label="Search universities"
              placeholder="Search universities..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-10 pl-9"
            />
          </div>
        </div>
      </header>

      <aside className="fixed bottom-0 left-0 top-16 hidden w-80 overflow-y-auto border-r bg-background lg:block">
        {isDesktop && (
          <Suspense
            fallback={
              <p role="status" className="p-5 text-sm text-muted-foreground">
                Loading filters…
              </p>
            }
          >
            <UniversityFilterPanel
              mode="desktop"
              universities={universities}
              values={filterValues}
              onChange={changeFilter}
              onClear={clearFilters}
            />
          </Suspense>
        )}
      </aside>

      <main className="min-h-screen pt-16 lg:pl-80">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-5 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">GKS Universities</h1>
              <p className="mt-1 text-muted-foreground">
                Find the right university for your scholarship journey.
              </p>
            </div>
            <Button
              ref={mobileFiltersTrigger}
              variant="outline"
              aria-haspopup="dialog"
              aria-controls={mobileFiltersId}
              aria-expanded={mobileFiltersOpen && !isDesktop}
              onClick={() => {
                setMobileFiltersRequested(true);
                setMobileFiltersOpen(true);
              }}
              className="lg:hidden"
            >
              Filters <Filter aria-hidden="true" />
            </Button>
            {!isDesktop && mobileFiltersRequested && (
              <Suspense
                fallback={
                  mobileFiltersOpen ? (
                    <div
                      role="status"
                      className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t bg-background p-5"
                    >
                      <p className="text-sm">Loading filters…</p>
                      <Button
                        variant="outline"
                        onClick={() => setMobileFiltersOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : null
                }
              >
                <UniversityFilterPanel
                  mode="mobile"
                  id={mobileFiltersId}
                  triggerRef={mobileFiltersTrigger}
                  open={mobileFiltersOpen}
                  onOpenChange={setMobileFiltersOpen}
                  universities={universities}
                  values={filterValues}
                  onChange={changeFilter}
                  onClear={clearFilters}
                />
              </Suspense>
            )}
          </div>
          <section className="flex flex-col gap-4" aria-label="Universities">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">Universities</h2>
              <p className="text-sm text-muted-foreground">
                {filteredUniversities.length} results
              </p>
            </div>
            <div className="grid gap-4">
              {filteredUniversities.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No universities match your search.
                </p>
              )}
              {filteredUniversities
                .slice(0, visibleCount)
                .map(({ university, matchingProgramFilters }) => (
                  <UniversityCard
                    key={university.id}
                    university={university}
                    detailsHref={`/universities/${university.id}${detailsFilterQuery ? `?${detailsFilterQuery}` : ""}`}
                    visibleProgramFilters={matchingProgramFilters}
                    isCompared={compareIds.includes(university.id)}
                    onCompare={() => toggleCompare(university.id)}
                  />
                ))}
            </div>
            {visibleCount < filteredUniversities.length && (
              <Button
                variant="outline"
                onClick={() => setVisibleCount((count) => count + 12)}
              >
                Load more universities
              </Button>
            )}
          </section>
        </div>
      </main>
      {compareIds.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 p-3 shadow-lg backdrop-blur sm:p-4">
          <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 lg:pl-80">
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {compareIds.length} of 3 universities selected
              </p>
              <p className="text-xs text-muted-foreground">
                Select up to three universities to compare.
              </p>
            </div>
            <Link
              href={`/compare?ids=${compareIds.join(",")}`}
              className="inline-flex h-9 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 sm:w-auto"
            >
              Compare selected
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function HomeQuery({ universities }: { universities: UniversityCardData[] }) {
  const query = useSearchParams();
  return <HomeContent universities={universities} query={query.toString()} />;
}
export function UniversityExplorer({
  universities,
}: {
  universities: UniversityCardData[];
}) {
  return (
    <Suspense fallback={<HomeContent universities={universities} />}>
      <HomeQuery universities={universities} />
    </Suspense>
  );
}
