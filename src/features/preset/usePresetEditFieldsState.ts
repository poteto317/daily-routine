import { useState } from "react";

export const usePresetEditFieldsState = () => {
  const [editPresetName, setEditPresetName] = useState("");
  const [editPresetDescription, setEditPresetDescription] = useState("");
  const [editSourceDay, setEditSourceDay] = useState<number | null>(null);

  return {
    editPresetDescription,
    editPresetName,
    editSourceDay,
    setEditPresetDescription,
    setEditPresetName,
    setEditSourceDay,
  };
};
