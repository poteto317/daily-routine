import type { useMenuOrderState } from "./useMenuOrderState";
import type { useVisibleFeaturesState } from "./useVisibleFeaturesState";

type SettingsPersistenceStateResultArgs = {
  menuOrderState: ReturnType<typeof useMenuOrderState>;
  visibleFeaturesState: ReturnType<typeof useVisibleFeaturesState>;
};

export const createSettingsPersistenceStateResult = ({
  menuOrderState,
  visibleFeaturesState,
}: SettingsPersistenceStateResultArgs) => {
  return {
    ...visibleFeaturesState,
    ...menuOrderState,
  };
};
