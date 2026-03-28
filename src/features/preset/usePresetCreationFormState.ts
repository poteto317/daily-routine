import { useState } from "react";

export const usePresetCreationFormState = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");
  const [newPresetDescription, setNewPresetDescription] = useState("");

  return {
    isCreating,
    newPresetDescription,
    newPresetName,
    setIsCreating,
    setNewPresetDescription,
    setNewPresetName,
  };
};
