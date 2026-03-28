import type { Dispatch, SetStateAction } from "react";

type WorkTrackerSessionVisibilityStateResultInput = {
  showInputForm: boolean;
  setShowInputForm: Dispatch<SetStateAction<boolean>>;
  showTemplateDropdown: boolean;
  setShowTemplateDropdown: Dispatch<SetStateAction<boolean>>;
};

export const createWorkTrackerSessionVisibilityStateResult = ({
  showInputForm,
  setShowInputForm,
  showTemplateDropdown,
  setShowTemplateDropdown,
}: WorkTrackerSessionVisibilityStateResultInput) => ({
  showInputForm,
  setShowInputForm,
  showTemplateDropdown,
  setShowTemplateDropdown,
});
