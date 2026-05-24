import type { HomeContentViewModel } from "../helpers";
import { fn } from "storybook/test";
import { baseDisplay, createBaseView } from "./homeStoryFixtures";
import { sampleRoutines } from "./routineFixtures";

// ファクトリ関数: 呼び出しごとに新鮮な fn() インスタンスを返す。
// 静的エクスポートにすると ES モジュールキャッシュで fn() が共有され
// クロスストーリー汚染が起きるため、必ずファクトリ経由で生成すること。
export const createBaseViewModel = (): HomeContentViewModel => ({
  toolbarProps: {
    view: createBaseView(),
    display: baseDisplay,
    trainDelays: [],
    onAddRoutineAction: fn(),
    showAddButton: true,
  },
  routineListProps: {
    sortedRoutines: sampleRoutines,
    allRoutinesCount: sampleRoutines.length,
    displayRoutinesCount: sampleRoutines.length,
    isEditMode: false,
    viewMode: 6,
    onToggleAction: fn(),
    onEditAction: fn(),
    onDeleteAction: fn(),
    onAddRoutineAction: fn(),
    onReorderAction: fn(),
  },
  routineFormProps: {
    routine: undefined,
    onSubmitAction: fn(),
    onCancelAction: fn(),
    currentDayOfWeek: 6,
  },
  showRoutineForm: false,
});
