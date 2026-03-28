import { useState } from "react";
import { createPresetEditFieldsStateResult } from "./presetEditFieldsStateResult";

export const usePresetEditFieldsState = () => {
  const [editPresetName, setEditPresetName] = useState("");
  const [editPresetDescription, setEditPresetDescription] = useState("");
  const [editSelectedRoutines, setEditSelectedRoutines] = useState<Set<string>>(
    new Set(),
  );

  return createPresetEditFieldsStateResult({
    editPresetDescription,
    editPresetName,
    editSelectedRoutines,
    setEditPresetDescription,
    setEditPresetName,
    setEditSelectedRoutines,
  });
};
