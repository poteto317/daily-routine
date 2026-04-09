/**
 * ルーティンプリセット管理ページ
 * プリセットの一覧表示、作成、適用、削除を行う
 */

"use client";

import type { Routine } from "@/types/routine";
import { PresetCreateSection } from "./components/PresetCreateSection";
import { PresetListSection } from "./components/PresetListSection";
import { usePresetManagerState } from "./usePresetManagerState";
import { PRESET_MANAGER_TEXT } from "./helpers";

interface PresetManagerProps {
  currentRoutines: Routine[];
  onApplyPreset: (
    routines: Omit<Routine, "id" | "sortOrder" | "createdAt" | "updatedAt">[],
    targetDays: number[],
  ) => void;
}

export const PresetManager = ({
  currentRoutines,
  onApplyPreset,
}: PresetManagerProps) => {
  const state = usePresetManagerState({ currentRoutines, onApplyPreset });

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {PRESET_MANAGER_TEXT.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {PRESET_MANAGER_TEXT.description}
        </p>

        <PresetCreateSection
          currentRoutines={currentRoutines}
          isCreating={state.isCreating}
          newPresetName={state.newPresetName}
          newPresetDescription={state.newPresetDescription}
          selectedRoutines={state.selectedRoutines}
          createFilterDays={state.createFilterDays}
          onToggleCreating={() => state.setIsCreating(!state.isCreating)}
          onChangeName={state.setNewPresetName}
          onChangeDescription={state.setNewPresetDescription}
          onToggleRoutine={state.toggleRoutineSelection}
          onToggleCreateFilterDay={state.toggleCreateFilterDay}
          onCreatePreset={state.handleCreatePreset}
        />
        <PresetListSection
          presets={state.presets}
          selectedPresetId={state.selectedPresetId}
          selectedDays={state.selectedDays}
          editingPresetId={state.editingPresetId}
          editRoutines={currentRoutines}
          editPresetName={state.editPresetName}
          editPresetDescription={state.editPresetDescription}
          editSelectedRoutines={state.editSelectedRoutines}
          onSelectPreset={state.setSelectedPresetId}
          onDeletePreset={state.handleDeletePreset}
          onToggleDay={state.toggleDaySelection}
          onApplyPreset={state.handleApplyPreset}
          onStartEdit={state.handleStartEdit}
          onCancelEdit={state.handleCancelEdit}
          onSaveEdit={state.handleSaveEdit}
          onChangeEditName={state.setEditPresetName}
          onChangeEditDescription={state.setEditPresetDescription}
          onToggleEditRoutine={state.toggleEditRoutineSelection}
        />
      </div>
    </div>
  );
};
