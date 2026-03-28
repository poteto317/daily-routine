import type { Dispatch, SetStateAction } from "react";

type CreatePresetEditFieldsStateResultParams = {
  editPresetDescription: string;
  editPresetName: string;
  editSelectedRoutines: Set<string>;
  setEditPresetDescription: Dispatch<SetStateAction<string>>;
  setEditPresetName: Dispatch<SetStateAction<string>>;
  setEditSelectedRoutines: Dispatch<SetStateAction<Set<string>>>;
};

export const createPresetEditFieldsStateResult = ({
  editPresetDescription,
  editPresetName,
  editSelectedRoutines,
  setEditPresetDescription,
  setEditPresetName,
  setEditSelectedRoutines,
}: CreatePresetEditFieldsStateResultParams) => {
  return {
    editPresetDescription,
    editPresetName,
    editSelectedRoutines,
    setEditPresetDescription,
    setEditPresetName,
    setEditSelectedRoutines,
  };
};
