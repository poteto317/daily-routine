import { useState } from "react";

export const usePresetEditingTargetState = () => {
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editingPresetUpdatedAt, setEditingPresetUpdatedAt] = useState<
    string | null
  >(null);

  return {
    editingPresetId,
    setEditingPresetId,
    editingPresetUpdatedAt,
    setEditingPresetUpdatedAt,
  };
};
