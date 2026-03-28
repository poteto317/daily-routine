import { useState } from "react";

type UseWeightTrackerInputStateParams = {
  initialWeightInput: string;
  initialNotesInput: string;
};

export const useWeightTrackerInputState = ({
  initialWeightInput,
  initialNotesInput,
}: UseWeightTrackerInputStateParams) => {
  const [weightInput, setWeightInput] = useState(initialWeightInput);
  const [notesInput, setNotesInput] = useState(initialNotesInput);

  return {
    notesInput,
    setNotesInput,
    setWeightInput,
    weightInput,
  };
};
