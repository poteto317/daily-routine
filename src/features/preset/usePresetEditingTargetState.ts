import { useState } from "react";
import { createPresetEditingTargetStateResult } from "./presetEditingTargetStateResult";

export const usePresetEditingTargetState = () => {
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);

  return createPresetEditingTargetStateResult({
    editingPresetId,
    setEditingPresetId,
  });
};
