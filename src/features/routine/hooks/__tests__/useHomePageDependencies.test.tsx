import { renderHook } from "@testing-library/react";
import { useHomePageDependencies } from "../useHomePageDependencies";
import { useRoutines } from "../useRoutines";
import { usePageNavigation } from "../usePageNavigation";
import { useHomeViewState } from "../useHomeViewState";
import { useRoutineCrud } from "../useRoutineCrud";
import { useRoutineDisplay } from "../useRoutineDisplay";
import { useTrainDelays } from "../useTrainDelays";
import type { TrainDelayInfo } from "@/types/routine";

jest.mock("../useRoutines", () => ({
  useRoutines: jest.fn(),
}));

jest.mock("../usePageNavigation", () => ({
  usePageNavigation: jest.fn(),
}));

jest.mock("../useHomeViewState", () => ({
  useHomeViewState: jest.fn(),
}));

jest.mock("../useRoutineCrud", () => ({
  useRoutineCrud: jest.fn(),
}));

jest.mock("../useRoutineDisplay", () => ({
  useRoutineDisplay: jest.fn(),
}));

jest.mock("../useTrainDelays", () => ({
  useTrainDelays: jest.fn(),
}));

describe("useHomePageDependencies", () => {
  const routineOps = {
    getIsTodayHoliday: jest.fn(() => false),
    getHolidayRoutines: jest.fn(() => []),
    getRoutinesByDayOfWeek: jest.fn(() => []),
    getTodayRoutines: jest.fn(() => []),
  };

  const navigation = {
    currentPage: "home" as const,
    setCurrentPage: jest.fn(),
    isHydrated: true,
    onPageChangeAction: jest.fn(),
  };

  const view = {
    isEditMode: false,
    viewMode: "today" as const,
    filterCategory: "all" as const,
  };

  const crud = {
    showForm: false,
    closeForm: jest.fn(),
  };

  const display = {
    sortedRoutines: [],
    displayRoutines: [],
  };

  const trainDelays: TrainDelayInfo[] = [];

  beforeEach(() => {
    jest.clearAllMocks();

    (useRoutines as jest.Mock).mockReturnValue(routineOps);
    (usePageNavigation as jest.Mock).mockReturnValue(navigation);
    (useHomeViewState as jest.Mock).mockReturnValue(view);
    (useRoutineCrud as jest.Mock).mockReturnValue(crud);
    (useRoutineDisplay as jest.Mock).mockReturnValue(display);
    (useTrainDelays as jest.Mock).mockReturnValue(trainDelays);
  });

  it("依存フックを合成し、HomePageDataと副作用入力を返す", () => {
    const { result } = renderHook(() => useHomePageDependencies());

    expect(useHomeViewState).toHaveBeenCalledWith(routineOps.getIsTodayHoliday);
    expect(useRoutineCrud).toHaveBeenCalledWith(routineOps, view.isEditMode);
    expect(useRoutineDisplay).toHaveBeenCalledWith({
      viewMode: view.viewMode,
      filterCategory: view.filterCategory,
      getHolidayRoutines: routineOps.getHolidayRoutines,
      getRoutinesByDayOfWeek: routineOps.getRoutinesByDayOfWeek,
      getTodayRoutines: routineOps.getTodayRoutines,
    });

    expect(result.current.homePageData).toEqual({
      routineOps,
      currentPage: navigation.currentPage,
      isHydrated: navigation.isHydrated,
      onPageChangeAction: navigation.onPageChangeAction,
      view,
      crud,
      display,
      trainDelays,
    });
    expect(result.current.showForm).toBe(crud.showForm);
    expect(result.current.closeFormAction).toBe(crud.closeForm);
    expect(result.current.setCurrentPageAction).toBe(navigation.setCurrentPage);
  });
});
