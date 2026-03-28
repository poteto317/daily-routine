import type { Routine, TrainDelayInfo } from "@/types/routine";
import type { HomePageData, HomeViewState } from "../pages/homeTypes";
import type { HomePageDependencies } from "./useHomePageDependencies";

type RoutineOpsLike = {
  getHolidayRoutines: () => Routine[];
  getRoutinesByDayOfWeek: (day: number) => Routine[];
  getTodayRoutines: () => Routine[];
};

type NavigationLike = {
  currentPage: HomePageData["currentPage"];
  setCurrentPage: HomePageDependencies["setCurrentPageAction"];
  isHydrated: boolean;
  onPageChangeAction: HomePageData["onPageChangeAction"];
};

type CrudLike = HomePageData["crud"] & {
  closeForm: HomePageDependencies["closeFormAction"];
};
type DisplayLike = HomePageData["display"];

export const createRoutineDisplayDependencies = (
  routineOps: RoutineOpsLike,
  view: Pick<HomeViewState, "viewMode" | "filterCategory">,
) => {
  return {
    viewMode: view.viewMode,
    filterCategory: view.filterCategory,
    getHolidayRoutines: routineOps.getHolidayRoutines,
    getRoutinesByDayOfWeek: routineOps.getRoutinesByDayOfWeek,
    getTodayRoutines: routineOps.getTodayRoutines,
  };
};

export const createHomePageDependenciesResult = (params: {
  routineOps: HomePageData["routineOps"];
  navigation: NavigationLike;
  view: HomePageData["view"];
  crud: CrudLike;
  display: DisplayLike;
  trainDelays: TrainDelayInfo[];
}): HomePageDependencies => {
  const { routineOps, navigation, view, crud, display, trainDelays } = params;

  return {
    homePageData: {
      routineOps,
      currentPage: navigation.currentPage,
      isHydrated: navigation.isHydrated,
      onPageChangeAction: navigation.onPageChangeAction,
      view,
      crud,
      display,
      trainDelays,
    },
    showForm: crud.showForm,
    closeFormAction: crud.closeForm,
    setCurrentPageAction: navigation.setCurrentPage,
  };
};
