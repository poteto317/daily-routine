import type { Routine, RoutineCategory, TrainDelayInfo } from "@/types/routine";
import type { RoutineData } from "./types";
import type { PageType } from "./types";

export type HomeViewMode = "holiday" | number;

/**
 * 利用者が自分で選んだ曜日のタブ。`mode` が `null` なら「今日に追従」（既定のタブを表示する）。
 * タブを押すたびに新しいオブジェクトを入れ、`null` のままでも必ず再描画させる。
 */
export type HomeSelectedViewMode = { mode: HomeViewMode | null };

export type HomeDayOption = {
  value: number;
  label: string;
};

export type HomeViewState = {
  currentDate: string;
  isTodayHoliday: boolean;
  isEditMode: boolean;
  toggleEditModeAction: () => void;
  viewMode: HomeViewMode;
  setViewModeAction: (mode: HomeViewMode) => void;
  filterCategory: RoutineCategory | "all";
  setFilterCategoryAction: (category: RoutineCategory | "all") => void;
  sortedDaysAndHoliday: (HomeDayOption | "holiday")[];
};

export type HomeDisplaySummary = {
  completedMinutes: number;
  totalMinutes: number;
  progressPercentage: number;
};

export type HomeDisplayState = HomeDisplaySummary & {
  sortedRoutines: Routine[];
  displayRoutines: Routine[];
};

export type HomeToolbarProps = {
  view: HomeViewState;
  display: HomeDisplaySummary;
  trainDelays: TrainDelayInfo[];
  onAddRoutineAction: () => void;
  showAddButton: boolean;
};

export type HomeDaySelectorProps = {
  viewMode: HomeViewMode;
  onViewModeChangeAction: (mode: HomeViewMode) => void;
  sortedDaysAndHoliday: (HomeDayOption | "holiday")[];
};

export type HomeCategoryFilterProps = {
  filterCategory: RoutineCategory | "all";
  onFilterChangeAction: (category: RoutineCategory | "all") => void;
};

export type HomeRoutineListProps = {
  sortedRoutines: Routine[];
  allRoutinesCount: number;
  displayRoutinesCount: number;
  isEditMode: boolean;
  onToggleAction: (id: string) => void;
  onEditAction: (routine: Routine) => void;
  onDeleteAction: (id: string) => void;
  onAddRoutineAction: () => void;
  onReorderAction: (
    reorderedRoutines: Routine[],
    sourceRoutines: Routine[],
  ) => void;
  viewMode: HomeViewMode;
};

export type HomeRoutineFormProps = {
  routine?: Routine;
  onSubmitAction: (routineData: RoutineData) => void;
  onCancelAction: () => void;
  currentDayOfWeek?: number;
};

export type HomeCrudState = {
  addRoutineAction: () => void;
  editRoutineAction: (routine: Routine) => void;
  deleteRoutineAction: (id: string) => void;
  submitRoutineAction: (routineData: RoutineData) => void;
  cancelRoutineAction: () => void;
  editingRoutine?: Routine;
  showForm: boolean;
};

export type HomeRoutineOps = {
  routines: Routine[];
  toggleComplete: (id: string) => void;
  reorderRoutines: (
    reorderedRoutines: Routine[],
    sourceRoutines: Routine[],
  ) => void;
};

export type HomeContentSource = {
  currentPage: PageType;
  view: HomeViewState;
  crud: HomeCrudState;
  display: HomeDisplayState;
  trainDelays: TrainDelayInfo[];
  routineOps: HomeRoutineOps;
};

export type HomePageNavigationState = {
  currentPage: PageType;
  isHydrated: boolean;
  onPageChangeAction: (page: PageType) => void;
};

export type HomePageData = HomeContentSource & HomePageNavigationState;
