import { useState } from "react";

type UseMealPageFormVisibilityStateParams = {
  initialShowForm: boolean;
};

export const useMealPageFormVisibilityState = ({
  initialShowForm,
}: UseMealPageFormVisibilityStateParams) => {
  const [showForm, setShowForm] = useState(initialShowForm);

  return {
    showForm,
    setShowForm,
  };
};
