"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Filter, GraduationCap, LoaderCircle, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { FilterCheckboxGroup, FilterCombobox } from "@/components/filters";
import {
  UniversityCard,
  type UniversityCardData,
} from "@/components/university-card";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

async function fetchUniversities(): Promise<UniversityCardData[]> {
  const response = await fetch("/api/universities");

  if (!response.ok) {
    throw new Error("Unable to load universities.");
  }

  return response.json();
}

const checkboxFilterParams = {
  applicationTracks: "applicationTrack",
  trackTypes: "trackType",
  degrees: "degree",
  mediums: "medium",
} as const;

function HomeContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("search") ?? "");
  const [departments, setDepartments] = useState<string[]>([]);
  const [applicationTracks, setApplicationTracks] = useState<string[]>(() =>
    searchParams.getAll(checkboxFilterParams.applicationTracks),
  );
  const [trackTypes, setTrackTypes] = useState<string[]>(() =>
    searchParams.getAll(checkboxFilterParams.trackTypes),
  );
  const [degrees, setDegrees] = useState<string[]>(() =>
    searchParams.getAll(checkboxFilterParams.degrees),
  );
  const [fields, setFields] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [mediums, setMediums] = useState<string[]>(() =>
    searchParams.getAll(checkboxFilterParams.mediums),
  );
  const [compareIds, setCompareIds] = useState<string[]>([]);

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
    trackTypes.forEach((value) =>
      params.append(checkboxFilterParams.trackTypes, value),
    );
    degrees.forEach((value) =>
      params.append(checkboxFilterParams.degrees, value),
    );
    mediums.forEach((value) =>
      params.append(checkboxFilterParams.mediums, value),
    );

    const query = params.toString();
    const nextUrl = query ? `${pathname}?${query}` : pathname;
    const currentUrl = `${pathname}${searchParams.toString() ? `?${searchParams}` : ""}`;

    if (nextUrl !== currentUrl) {
      router.replace(nextUrl, { scroll: false });
    }
  }, [
    applicationTracks,
    degrees,
    mediums,
    pathname,
    router,
    searchParams,
    search,
    trackTypes,
  ]);
  const {
    data: universities = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["universities"],
    queryFn: fetchUniversities,
    enabled: typeof window !== "undefined",
  });

  const departmentOptions = useMemo(
    () =>
      [
        ...new Set(
          universities.flatMap((university) => university.departments),
        ),
      ].sort(),
    [universities],
  );
  const applicationTrackOptions = useMemo(
    () =>
      [
        ...new Set(
          universities.flatMap((university) => university.applicationTracks),
        ),
      ].sort(),
    [universities],
  );
  const trackTypeOptions = useMemo(
    () =>
      [
        ...new Set(universities.flatMap((university) => university.trackTypes)),
      ].sort(),
    [universities],
  );
  const degreeOptions = useMemo(
    () =>
      [
        ...new Set(universities.flatMap((university) => university.degrees)),
      ].sort(),
    [universities],
  );
  const fieldOptions = useMemo(
    () =>
      [
        ...new Set(universities.flatMap((university) => university.fields)),
      ].sort(),
    [universities],
  );
  const locationOptions = useMemo(
    () =>
      [
        ...new Set(
          universities.map((university) => university.city).filter(Boolean),
        ),
      ].sort(),
    [universities],
  );
  const mediumOptions = ["English", "Korean"];
  const hasActiveFilters =
    applicationTracks.length > 0 ||
    trackTypes.length > 0 ||
    degrees.length > 0 ||
    fields.length > 0 ||
    departments.length > 0 ||
    locations.length > 0 ||
    mediums.length > 0;

  const filteredUniversities = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();

    return universities.filter((university) => {
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
      const matchesProgramFilters = university.programFilters.some(
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

      return matchesSearch && matchesLocation && matchesProgramFilters;
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

  const filterContent = (
    <div className="flex flex-col gap-6 p-5">
      <FilterCombobox
        label="Department"
        value={departments}
        options={departmentOptions}
        onChange={setDepartments}
      />
      <FilterCheckboxGroup
        label="Application track"
        value={applicationTracks}
        options={applicationTrackOptions}
        onChange={setApplicationTracks}
      />
      <FilterCheckboxGroup
        label="Track type"
        value={trackTypes}
        options={trackTypeOptions}
        onChange={setTrackTypes}
      />
      <FilterCheckboxGroup
        label="Degree"
        value={degrees}
        options={degreeOptions}
        onChange={setDegrees}
      />
      <FilterCombobox
        label="Field of study"
        value={fields}
        options={fieldOptions}
        onChange={setFields}
      />
      <FilterCombobox
        label="Location"
        value={locations}
        options={locationOptions}
        onChange={setLocations}
      />
      <FilterCheckboxGroup
        label="Medium of instruction"
        value={mediums}
        options={mediumOptions}
        onChange={setMediums}
      />
    </div>
  );

  return (
    <div className="min-h-screen overflow-x-hidden">
      <header className="fixed inset-x-0 top-0 z-30 border-b bg-background/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex min-h-16 w-full min-w-0 max-w-[1600px] items-center gap-4 overflow-hidden px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-3">
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
        {/* filters header */}
        <div className="flex items-center justify-between gap-4 border-b p-5">
          <div>
            <h2 className="text-lg font-semibold">Filters</h2>
            <p className="text-sm text-muted-foreground">
              Narrow your search results.
            </p>
          </div>
          {/* clear filters button */}
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              CLEAR ALL
            </Button>
          )}
        </div>
        {filterContent}
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
            {/* Drawer */}
            <Drawer showSwipeHandle>
              <DrawerTrigger
                className="lg:hidden"
                render={<Button variant="outline" />}
              >
                FIlters <Filter className="ml-2 h-4 w-4" />
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Filters</DrawerTitle>
                  <DrawerDescription>
                    Narrow your search results.
                  </DrawerDescription>
                </DrawerHeader>
                <div className="min-h-0 flex-1 overflow-y-auto">
                  {filterContent}
                </div>
                {hasActiveFilters && (
                  <DrawerFooter>
                    <Button
                      variant="outline"
                      className="w-full h-10 border-black"
                      onClick={clearFilters}
                    >
                      CLEAR ALL
                    </Button>
                  </DrawerFooter>
                )}
              </DrawerContent>
            </Drawer>
          </div>
          <section className="flex flex-col gap-4" aria-label="Universities">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">Universities</h2>
              <p className="text-sm text-muted-foreground">
                {isLoading
                  ? "Loading..."
                  : `${filteredUniversities.length} results`}
              </p>
            </div>
            <div className="grid gap-4">
              {isLoading && (
                <div className="flex min-h-48 items-center justify-center" role="status" aria-label="Loading universities">
                  <LoaderCircle className="size-12 animate-spin text-primary" aria-hidden="true" />
                </div>
              )}
              {isError && (
                <p className="text-sm text-destructive">
                  Unable to load universities. Please try again.
                </p>
              )}
              {!isLoading && !isError && filteredUniversities.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No universities match your search.
                </p>
              )}
              {filteredUniversities.map((university) => (
                <UniversityCard
                  key={university.id}
                  university={university}
                  isCompared={compareIds.includes(university.id)}
                  onCompare={() => toggleCompare(university.id)}
                />
              ))}
            </div>
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

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
