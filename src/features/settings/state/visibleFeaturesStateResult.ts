import type { Dispatch, SetStateAction } from "react";
import type { VisibleFeaturesState } from "./featureVisibility";

type VisibleFeaturesStateResultInput = {
  visibleFeatures: VisibleFeaturesState;
  setVisibleFeatures: Dispatch<SetStateAction<VisibleFeaturesState>>;
};

export const createVisibleFeaturesStateResult = ({
  visibleFeatures,
  setVisibleFeatures,
}: VisibleFeaturesStateResultInput) => ({
  visibleFeatures,
  setVisibleFeatures,
});
