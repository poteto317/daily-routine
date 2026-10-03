"use client";

import { CardPanel } from "@/components";
import { useSettingsPageState } from "./useSettingsPageState";
import { DefaultAndPomodoroSection } from "./components/DefaultAndPomodoroSection";
import { NotificationTestSection } from "./components/NotificationTestSection";
import { TrainDelaySection } from "./components/TrainDelaySection";
import { FeatureVisibilitySection } from "./components/FeatureVisibilitySection";
import { MenuOrderSection } from "./components/MenuOrderSection";
import { AppearanceSection } from "./components/AppearanceSection";
import { DataManagementSection } from "./components/DataManagementSection";
import { ApiKeySection } from "@/features/api-key";
import { PrivacyNoteSection } from "./components/PrivacyNoteSection";
import texts from "./locales/ja.json";

export const SettingsPage = () => {
  const state = useSettingsPageState();

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-slate-400 dark:to-slate-300">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <CardPanel className="mb-0!">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-black mb-6">
            {texts.page.title}
          </h1>
          <div className="space-y-6">
            <DefaultAndPomodoroSection
              durationInput={state.durationInput}
              setDurationInput={state.setDurationInput}
              notificationInput={state.notificationInput}
              setNotificationInput={state.setNotificationInput}
              pomodoroFocusInput={state.pomodoroFocusInput}
              setPomodoroFocusInput={state.setPomodoroFocusInput}
              pomodoroBreakInput={state.pomodoroBreakInput}
              setPomodoroBreakInput={state.setPomodoroBreakInput}
              backgroundRefreshIntervalInput={
                state.backgroundRefreshIntervalInput
              }
              setBackgroundRefreshIntervalInput={
                state.setBackgroundRefreshIntervalInput
              }
            />
            <NotificationTestSection
              notificationStatus={state.notificationStatus}
              debugMessage={state.debugMessage}
              swLogs={state.swLogs}
              clearLogs={state.clearLogs}
              handleTestNotification={state.handleTestNotification}
            />
            <TrainDelaySection
              trainDelayEnabled={state.trainDelayEnabled}
              setTrainDelayEnabled={state.setTrainDelayEnabled}
              selectedLineInput={state.selectedLineInput}
              setSelectedLineInput={state.setSelectedLineInput}
              availableLines={state.availableLines}
              monitoredLines={state.monitoredLines}
              handleAddLine={state.handleAddLine}
              handleRemoveLine={state.handleRemoveLine}
            />
            <FeatureVisibilitySection
              visibleFeatures={state.visibleFeatures}
              setVisibleFeatures={state.setVisibleFeatures}
            />
            <MenuOrderSection
              menuOrder={state.menuOrder}
              setMenuOrderAction={state.setMenuOrder}
            />
            <AppearanceSection
              settings={state.settings}
              setSettings={state.setSettings}
              handleThemeChange={state.handleThemeChange}
            />
            <DataManagementSection
              exportOptions={state.exportOptions}
              setExportOptions={state.setExportOptions}
              importOptions={state.importOptions}
              setImportOptions={state.setImportOptions}
              exportStatus={state.exportStatus}
              importStatus={state.importStatus}
              handleExport={state.handleExport}
              handleImportClick={state.handleImportClick}
              handleImport={state.handleImport}
              fileInputRef={state.fileInputRef}
            />
            <ApiKeySection />
          </div>
          <PrivacyNoteSection />
        </CardPanel>
      </div>
    </div>
  );
};
