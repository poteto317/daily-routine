import { useRoutines } from "./useRoutines";
import { usePageNavigation } from "./usePageNavigation";
import { useHomeViewState } from "./useHomeViewState";
import { useRoutineCrud } from "./useRoutineCrud";
import { useRoutineDisplay } from "./useRoutineDisplay";
import { useTrainDelays } from "./useTrainDelays";
import type { HomePageData } from "../pages/homeTypes";
import {
  createHomePageDependenciesResult,
  createRoutineDisplayDependencies,
} from "./homePageDependencyActions";

export type HomePageDependencies = {
  homePageData: HomePageData;
  showForm: boolean;
  closeFormAction: () => void;
  setCurrentPageAction: ReturnType<typeof usePageNavigation>["setCurrentPage"];
};

export const useHomePageDependencies = (): HomePageDependencies => {
  const routineOps = useRoutines();
  const navigation = usePageNavigation();
  const view = useHomeViewState(routineOps.getIsTodayHoliday);
  const crud = useRoutineCrud(routineOps, view.isEditMode);
  const display = useRoutineDisplay(
    createRoutineDisplayDependencies(routineOps, view),
  );
  const trainDelays = useTrainDelays();

  return createHomePageDependenciesResult({
    routineOps,
    navigation,
    view,
    crud,
    display,
    trainDelays,
  });
};
