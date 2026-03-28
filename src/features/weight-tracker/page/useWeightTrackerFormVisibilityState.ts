import { useState } from "react";

type UseWeightTrackerFormVisibilityStateParams = {
  initialShowForm: boolean;
};

export const useWeightTrackerFormVisibilityState = ({
  initialShowForm,
}: UseWeightTrackerFormVisibilityStateParams) => {
  const [showForm, setShowForm] = useState(initialShowForm);

  return {
    setShowForm,
    showForm,
  };
};
