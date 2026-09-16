import {
  Combobox,
  ComboboxChips,
  ComboboxChip,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxChipsInput,
  ComboboxContent,
} from "@/components/ui/combobox";
import { Checkbox } from "@/components/ui/checkbox";

export function FilterCombobox({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string[];
  options: string[];
  onChange: (value: string[]) => void;
}) {
  return (
    <div className="w-full space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <Combobox multiple items={options} value={value} onValueChange={onChange}>
        <ComboboxChips className="w-full min-w-0">
          {value.map((item) => (
            <ComboboxChip
              key={item}
              className="min-w-0 max-w-[calc(100%-0.5rem)]"
            >
              <span className="min-w-0 max-w-[calc(100%-1.5rem)] truncate">
                {item}
              </span>
            </ComboboxChip>
          ))}
          <ComboboxChipsInput
            className="basis-full min-w-0"
            placeholder={
              value.length ? "Add more" : `Select ${label.toLowerCase()}`
            }
          />
        </ComboboxChips>
        <ComboboxContent>
          <ComboboxList>
            {options.map((option) => (
              <ComboboxItem key={option} value={option}>
                {option}
              </ComboboxItem>
            ))}
            <ComboboxEmpty>No options found.</ComboboxEmpty>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

export function FilterCheckboxGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string[];
  options: string[];
  onChange: (value: string[]) => void;
}) {
  return (
    <fieldset className="w-full space-y-2">
      <legend className="text-sm font-medium">{label}</legend>
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={value.includes(option)}
              onCheckedChange={(checked) => {
                onChange(
                  checked
                    ? [...value, option]
                    : value.filter((item) => item !== option)
                );
              }}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
