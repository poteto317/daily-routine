import type { Dispatch, SetStateAction } from "react";

type CreatePresetEditingTargetStateResultParams = {
  editingPresetId: string | null;
  setEditingPresetId: Dispatch<SetStateAction<string | null>>;
};

export const createPresetEditingTargetStateResult = ({
  editingPresetId,
  setEditingPresetId,
}: CreatePresetEditingTargetStateResultParams) => {
  return {
    editingPresetId,
    setEditingPresetId,
  };
};
