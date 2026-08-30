import type { Dispatch, SetStateAction } from "react";

export const createPresetDaySelectionToggleHandler = (
  selection: Set<number>,
  setSelection: Dispatch<SetStateAction<Set<number>>>,
) => {
  return (day: number) => {
    const nextSelection = new Set(selection);
    if (nextSelection.has(day)) {
      nextSelection.delete(day);
    } else {
      nextSelection.add(day);
    }
    setSelection(nextSelection);
  };
};
