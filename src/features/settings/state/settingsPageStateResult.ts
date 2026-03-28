import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import type { AppSettings } from "@/types/routine";
import type { VisibleFeaturesState } from "./featureVisibility";
import { AVAILABLE_LINES } from "./constants";
import type {
  MonitoredLine,
  NotificationStatus,
  TransferOptions,
  TransferStatus,
} from "./constants";

type AvailableLine = (typeof AVAILABLE_LINES)[number];

type SettingsFormState = {
  settings: AppSettings;
  setSettings: Dispatch<SetStateAction<AppSettings>>;
  durationInput: string;
  setDurationInput: Dispatch<SetStateAction<string>>;
  notificationInput: string;
  setNotificationInput: Dispatch<SetStateAction<string>>;
  pomodoroFocusInput: string;
  setPomodoroFocusInput: Dispatch<SetStateAction<string>>;
  pomodoroBreakInput: string;
  setPomodoroBreakInput: Dispatch<SetStateAction<string>>;
  handleThemeChange: (theme: AppSettings["theme"]) => void;
};

type TrainDelayState = {
  trainDelayEnabled: boolean;
  setTrainDelayEnabled: Dispatch<SetStateAction<boolean>>;
  selectedLineInput: string;
  setSelectedLineInput: Dispatch<SetStateAction<string>>;
  monitoredLines: MonitoredLine[];
  availableLines: AvailableLine[];
  handleAddLine: () => void;
  handleRemoveLine: (lineId: string) => void;
};

type NotificationState = {
  notificationStatus: NotificationStatus;
  debugMessage: string;
  swLogs: string[];
  clearLogs: () => void;
  handleTestNotification: () => Promise<void>;
};

type TransferState = {
  exportStatus: TransferStatus;
  importStatus: TransferStatus;
  exportOptions: TransferOptions;
  setExportOptions: Dispatch<SetStateAction<TransferOptions>>;
  importOptions: TransferOptions;
  setImportOptions: Dispatch<SetStateAction<TransferOptions>>;
  fileInputRef: { current: HTMLInputElement | null };
  handleExport: () => void;
  handleImportClick: () => void;
  handleImport: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
};

type CreateSettingsPageStateResultArgs = {
  form: SettingsFormState;
  trainDelay: TrainDelayState;
  notification: NotificationState;
  transfer: TransferState;
  visibleFeatures: VisibleFeaturesState;
  setVisibleFeatures: Dispatch<SetStateAction<VisibleFeaturesState>>;
  menuOrder?: string[];
  setMenuOrder?: Dispatch<SetStateAction<string[]>>;
};

export const createSettingsPageStateResult = ({
  form,
  trainDelay,
  notification,
  transfer,
  visibleFeatures,
  setVisibleFeatures,
  menuOrder,
  setMenuOrder,
}: CreateSettingsPageStateResultArgs) => {
  return {
    settings: form.settings,
    setSettings: form.setSettings,
    durationInput: form.durationInput,
    setDurationInput: form.setDurationInput,
    notificationInput: form.notificationInput,
    setNotificationInput: form.setNotificationInput,
    pomodoroFocusInput: form.pomodoroFocusInput,
    setPomodoroFocusInput: form.setPomodoroFocusInput,
    pomodoroBreakInput: form.pomodoroBreakInput,
    setPomodoroBreakInput: form.setPomodoroBreakInput,
    handleThemeChange: form.handleThemeChange,
    trainDelayEnabled: trainDelay.trainDelayEnabled,
    setTrainDelayEnabled: trainDelay.setTrainDelayEnabled,
    selectedLineInput: trainDelay.selectedLineInput,
    setSelectedLineInput: trainDelay.setSelectedLineInput,
    monitoredLines: trainDelay.monitoredLines,
    availableLines: trainDelay.availableLines,
    handleAddLine: trainDelay.handleAddLine,
    handleRemoveLine: trainDelay.handleRemoveLine,
    notificationStatus: notification.notificationStatus,
    debugMessage: notification.debugMessage,
    swLogs: notification.swLogs,
    clearLogs: notification.clearLogs,
    handleTestNotification: notification.handleTestNotification,
    exportStatus: transfer.exportStatus,
    importStatus: transfer.importStatus,
    exportOptions: transfer.exportOptions,
    setExportOptions: transfer.setExportOptions,
    importOptions: transfer.importOptions,
    setImportOptions: transfer.setImportOptions,
    fileInputRef: transfer.fileInputRef,
    handleExport: transfer.handleExport,
    handleImportClick: transfer.handleImportClick,
    handleImport: transfer.handleImport,
    visibleFeatures,
    setVisibleFeatures,
    menuOrder: menuOrder ?? [],
    setMenuOrder: setMenuOrder ?? (() => {}),
  };
};

export type {
  NotificationState,
  SettingsFormState,
  TrainDelayState,
  TransferState,
};