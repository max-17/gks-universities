"use client";

import { useMemo, type RefObject } from "react";
import { FilterCheckboxGroup, FilterCombobox } from "@/components/filters";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import type { UniversityCardData } from "@/components/university-card";

export type UniversityFilterValues = {
  departments: string[];
  applicationTracks: string[];
  trackTypes: string[];
  degrees: string[];
  fields: string[];
  locations: string[];
  mediums: string[];
};

type Props = {
  universities: UniversityCardData[];
  values: UniversityFilterValues;
  onChange: (key: keyof UniversityFilterValues, values: string[]) => void;
  onClear: () => void;
} & (
  | { mode: "desktop" }
  | {
      mode: "mobile";
      open: boolean;
      onOpenChange: (open: boolean) => void;
      id: string;
      triggerRef: RefObject<HTMLButtonElement | null>;
    }
);

export default function UniversityFilterPanel(props: Props) {
  const { universities, values, onChange, onClear } = props;
  const options = useMemo(() => {
    const unique = (values: string[]) => [...new Set(values)].sort();
    return {
      departments: unique(universities.flatMap((u) => u.departments)),
      applicationTracks: unique(
        universities.flatMap((u) => u.applicationTracks),
      ),
      trackTypes: unique(universities.flatMap((u) => u.trackTypes)),
      degrees: unique(universities.flatMap((u) => u.degrees)),
      fields: unique(universities.flatMap((u) => u.fields)),
      locations: unique(universities.map((u) => u.city).filter(Boolean)),
      mediums: ["English", "Korean"],
    };
  }, [universities]);
  const hasActiveFilters = Object.values(values).some(
    (items) => items.length > 0,
  );
  const content = (
    <div className="flex flex-col gap-6 p-5">
      <FilterCombobox
        label="Department"
        value={values.departments}
        options={options.departments}
        onChange={(items) => onChange("departments", items)}
      />
      <FilterCheckboxGroup
        label="Application track"
        value={values.applicationTracks}
        options={options.applicationTracks}
        onChange={(items) => onChange("applicationTracks", items)}
      />
      <FilterCheckboxGroup
        label="Track type"
        value={values.trackTypes}
        options={options.trackTypes}
        onChange={(items) => onChange("trackTypes", items)}
      />
      <FilterCheckboxGroup
        label="Degree"
        value={values.degrees}
        options={options.degrees}
        onChange={(items) => onChange("degrees", items)}
      />
      <FilterCombobox
        label="Field of study"
        value={values.fields}
        options={options.fields}
        onChange={(items) => onChange("fields", items)}
      />
      <FilterCombobox
        label="Location"
        value={values.locations}
        options={options.locations}
        onChange={(items) => onChange("locations", items)}
      />
      <FilterCheckboxGroup
        label="Medium of instruction"
        value={values.mediums}
        options={options.mediums}
        onChange={(items) => onChange("mediums", items)}
      />
    </div>
  );

  if (props.mode === "desktop") {
    return (
      <>
        <div className="flex items-center justify-between gap-4 border-b p-5">
          <div>
            <h2 className="text-lg font-semibold">Filters</h2>
            <p className="text-sm text-muted-foreground">
              Narrow your search results.
            </p>
          </div>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={onClear}>
              CLEAR ALL
            </Button>
          )}
        </div>
        {content}
      </>
    );
  }

  return (
    <Drawer open={props.open} onOpenChange={props.onOpenChange} showSwipeHandle>
      <DrawerContent id={props.id} finalFocus={props.triggerRef}>
        <DrawerHeader>
          <DrawerTitle>Filters</DrawerTitle>
          <DrawerDescription>Narrow your search results.</DrawerDescription>
        </DrawerHeader>
        <div className="min-h-0 flex-1 overflow-y-auto">{content}</div>
        <DrawerFooter>
          {hasActiveFilters && (
            <Button variant="outline" onClick={onClear}>
              CLEAR ALL
            </Button>
          )}
          <Button onClick={() => props.onOpenChange(false)}>
            Show results
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
