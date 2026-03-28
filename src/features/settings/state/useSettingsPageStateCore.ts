import { useSettingsFormState } from "./useSettingsFormState";
import { useTrainDelayState } from "./useTrainDelayState";
import { useNotificationTestState } from "./useNotificationTestState";
import { useDataTransferState } from "./useDataTransferState";
import { createSettingsPageStateResult } from "./settingsPageCoreActions";
import { useSettingsPersistence } from "./useSettingsPersistence";

export const useSettingsPageState = () => {
  const form = useSettingsFormState();
  const trainDelay = useTrainDelayState();
  const notification = useNotificationTestState();
  const transfer = useDataTransferState();
  const persistence = useSettingsPersistence({ form, trainDelay });

  return createSettingsPageStateResult({
    form,
    trainDelay,
    notification,
    transfer,
    visibleFeatures: persistence.visibleFeatures,
    setVisibleFeatures: persistence.setVisibleFeatures,
    menuOrder: persistence.menuOrder,
    setMenuOrder: persistence.setMenuOrder,
  });
};
