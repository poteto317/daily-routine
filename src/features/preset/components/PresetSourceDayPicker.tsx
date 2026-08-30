"use client";

import type { PresetSourceDayOption } from "../presetSourceDayModel";
import { getDayButtonClassName } from "../presetCardPresentation";

type PresetSourceDayPickerProps = {
  groupName: string;
  label: string;
  options: PresetSourceDayOption[];
  onSelect: (day: number) => void;
};

export const PresetSourceDayPicker = ({
  groupName,
  label,
  options,
  onSelect,
}: PresetSourceDayPickerProps) => (
  <fieldset className="space-y-2">
    <legend className="text-xs text-gray-500 dark:text-gray-400">
      {label}
    </legend>
    <div className="flex gap-2 flex-wrap">
      {options.map((option) => (
        <label
          key={option.day}
          className={
            option.hasRoutines
              ? "cursor-pointer"
              : "cursor-not-allowed opacity-50"
          }
        >
          <input
            type="radio"
            name={groupName}
            value={option.day}
            checked={option.isSelected}
            disabled={!option.hasRoutines}
            onChange={() => onSelect(option.day)}
            className="peer sr-only"
          />
          <span
            className={`${getDayButtonClassName(
              option.isSelected,
              option.isHoliday,
            )} block peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue-500`}
          >
            {option.label}
          </span>
        </label>
      ))}
    </div>
  </fieldset>
);
