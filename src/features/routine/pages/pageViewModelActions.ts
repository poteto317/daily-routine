import { HOLIDAY_DAY_VALUE } from "@/types/routine";
import type {
  HomeContentSource,
  HomeRoutineFormProps,
  HomeRoutineListProps,
  HomeToolbarProps,
} from "./homeTypes";
import type { PageLayoutProps } from "./PageLayout";

type HomePageLayoutView = Pick<
  HomeContentSource["view"],
  "isEditMode" | "toggleEditModeAction"
>;

type HomePageLayoutSource = {
  currentPage: HomeContentSource["currentPage"];
  view: HomePageLayoutView;
  onPageChangeAction: (page: HomeContentSource["currentPage"]) => void;
};

export const isHomePageEditMode = (data: HomeContentSource): boolean => {
  return data.currentPage === "home" && data.view.isEditMode;
};

export const resolveHomeRoutineFormDay = (
  viewMode: HomeContentSource["view"]["viewMode"],
): number => {
  return viewMode === "holiday" ? HOLIDAY_DAY_VALUE : viewMode;
};

export const createHomeToolbarProps = (
  data: HomeContentSource,
): HomeToolbarProps => {
  return {
    view: data.view,
    display: data.display,
    trainDelays: data.trainDelays,
    onAddRoutineAction: data.crud.addRoutineAction,
    showAddButton: isHomePageEditMode(data),
  };
};

export const createHomeRoutineListProps = (
  data: HomeContentSource,
): HomeRoutineListProps => {
  return {
    sortedRoutines: data.display.sortedRoutines,
    allRoutinesCount: data.routineOps.routines.length,
    displayRoutinesCount: data.display.displayRoutines.length,
    isEditMode: isHomePageEditMode(data),
    onToggleAction: data.routineOps.toggleComplete,
    onEditAction: data.crud.editRoutineAction,
    onDeleteAction: data.crud.deleteRoutineAction,
    onAddRoutineAction: data.crud.addRoutineAction,
    onReorderAction: data.routineOps.reorderRoutines,
    viewMode: data.view.viewMode,
  };
};

export const createHomeRoutineFormProps = (
  data: HomeContentSource,
): HomeRoutineFormProps => {
  return {
    routine: data.crud.editingRoutine,
    onSubmitAction: data.crud.submitRoutineAction,
    onCancelAction: data.crud.cancelRoutineAction,
    currentDayOfWeek: resolveHomeRoutineFormDay(data.view.viewMode),
  };
};

export const createHomePageLayoutProps = (
  data: HomePageLayoutSource,
): Pick<
  PageLayoutProps,
  "currentPage" | "isEditMode" | "onNavigateAction" | "onToggleEditModeAction"
> => {
  return {
    currentPage: data.currentPage,
    isEditMode: data.view.isEditMode,
    onNavigateAction: data.onPageChangeAction,
    onToggleEditModeAction: data.view.toggleEditModeAction,
  };
};
