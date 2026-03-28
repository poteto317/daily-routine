import { useMenuOrderState } from "./useMenuOrderState";
import { createSettingsPersistenceStateResult } from "./settingsPersistenceStateResult";
import { useVisibleFeaturesState } from "./useVisibleFeaturesState";

export const useSettingsPersistenceState = () => {
  const visibleFeaturesState = useVisibleFeaturesState();
  const menuOrderState = useMenuOrderState();

  return createSettingsPersistenceStateResult({
    menuOrderState,
    visibleFeaturesState,
  });
};
