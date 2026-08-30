"use client";

import { useId } from "react";
import type { PresetSourceDayModel } from "../presetSourceDayModel";
import { PresetSourceDayPicker } from "./PresetSourceDayPicker";
import { PresetSourceRoutinePreview } from "./PresetSourceRoutinePreview";

type PresetSourceDaySelectionProps = {
  model: PresetSourceDayModel;
  onSelectSourceDay: (day: number) => void;
  label: string;
  emptyLabel: string;
};

export const PresetSourceDaySelection = ({
  model,
  onSelectSourceDay,
  label,
  emptyLabel,
}: PresetSourceDaySelectionProps) => {
  const groupName = `preset-source-day-${useId()}`;

  return (
    <div className="space-y-2">
      <PresetSourceDayPicker
        groupName={groupName}
        label={label}
        options={model.options}
        onSelect={onSelectSourceDay}
      />

      {model.selectedDay !== null && (
        <PresetSourceRoutinePreview
          routines={model.selectedRoutines}
          emptyLabel={emptyLabel}
        />
      )}
    </div>
  );
};
