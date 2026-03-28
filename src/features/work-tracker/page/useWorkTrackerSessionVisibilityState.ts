import { useState } from "react";
import { createWorkTrackerSessionVisibilityStateResult } from "./workTrackerSessionVisibilityStateResult";

type UseWorkTrackerSessionVisibilityStateParams = {
  initialShowInputForm: boolean;
  initialShowTemplateDropdown: boolean;
};

export const useWorkTrackerSessionVisibilityState = ({
  initialShowInputForm,
  initialShowTemplateDropdown,
}: UseWorkTrackerSessionVisibilityStateParams) => {
  const [showInputForm, setShowInputForm] = useState(initialShowInputForm);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(
    initialShowTemplateDropdown,
  );

  return createWorkTrackerSessionVisibilityStateResult({
    setShowInputForm,
    setShowTemplateDropdown,
    showInputForm,
    showTemplateDropdown,
  });
};
