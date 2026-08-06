"use client";

import type { WorkoutLabel } from "@/types/routine";
import texts from "../../locales/ja.json";

type WorkoutLabelSelectorProps = {
  label: WorkoutLabel;
  onChangeLabelAction: (label: WorkoutLabel) => void;
};

const labelButtonClassName = (isSelected: boolean) =>
  `flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
    isSelected
      ? "bg-blue-600 text-white"
      : "bg-gray-100 dark:bg-gray-300 text-gray-700 hover:bg-gray-200"
  }`;

/**
 * 運動記録のラベル（筋トレ/ランニング）切替UI。
 */
export const WorkoutLabelSelector = ({
  label,
  onChangeLabelAction,
}: WorkoutLabelSelectorProps) => {
  const isStrength = label === "strength";

  return (
    <div
      role="radiogroup"
      aria-label={texts.form.labelSelectorAriaLabel}
      className="flex gap-2"
    >
      <button
        type="button"
        role="radio"
        aria-checked={isStrength}
        onClick={() => onChangeLabelAction("strength")}
        className={labelButtonClassName(isStrength)}
      >
        {texts.form.labelStrength}
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={!isStrength}
        onClick={() => onChangeLabelAction("running")}
        className={labelButtonClassName(!isStrength)}
      >
        {texts.form.labelRunning}
      </button>
    </div>
  );
};
