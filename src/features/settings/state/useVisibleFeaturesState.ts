import { useState } from "react";
import {
  getInitialVisibleFeatures,
  type VisibleFeaturesState,
} from "./featureVisibility";
import { createVisibleFeaturesStateResult } from "./visibleFeaturesStateResult";

export const useVisibleFeaturesState = () => {
  const [visibleFeatures, setVisibleFeatures] = useState<VisibleFeaturesState>(
    getInitialVisibleFeatures,
  );

  return createVisibleFeaturesStateResult({
    visibleFeatures,
    setVisibleFeatures,
  });
};
