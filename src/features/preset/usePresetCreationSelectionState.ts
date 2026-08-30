import { useState } from "react";

export const usePresetCreationSelectionState = () => {
  const [sourceDay, setSourceDay] = useState<number | null>(null);

  return {
    sourceDay,
    setSourceDay,
  };
};
