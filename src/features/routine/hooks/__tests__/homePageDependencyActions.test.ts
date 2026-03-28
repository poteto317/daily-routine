import type { TrainDelayInfo } from "@/types/routine";
import {
  createHomePageDependenciesResult,
  createRoutineDisplayDependencies,
} from "../homePageDependencyActions";

describe("homePageDependencyActions", () => {
  it("routine display dependencies を組み立てる", () => {
    const routineOps = {
      getHolidayRoutines: jest.fn(),
      getRoutinesByDayOfWeek: jest.fn(),
      getTodayRoutines: jest.fn(),
    };
    const view = {
      viewMode: "holiday" as const,
      filterCategory: "all" as const,
    };

    expect(createRoutineDisplayDependencies(routineOps, view)).toEqual({
      viewMode: "holiday",
      filterCategory: "all",
      getHolidayRoutines: routineOps.getHolidayRoutines,
      getRoutinesByDayOfWeek: routineOps.getRoutinesByDayOfWeek,
      getTodayRoutines: routineOps.getTodayRoutines,
    });
  });

  it("home page dependencies result を組み立てる", () => {
    const routineOps = {
      routines: [],
      toggleComplete: jest.fn(),
      reorderRoutines: jest.fn(),
    };
    const navigation = {
      currentPage: "home" as const,
      setCurrentPage: jest.fn(),
      isHydrated: true,
      onPageChangeAction: jest.fn(),
    };
    const view = {
      currentDate: "2026年3月7日(土)",
      isTodayHoliday: false,
      isEditMode: false,
      toggleEditModeAction: jest.fn(),
      viewMode: 6 as const,
      setViewModeAction: jest.fn(),
      filterCategory: "all" as const,
      setFilterCategoryAction: jest.fn(),
      sortedDaysAndHoliday: [],
    };
    const crud = {
      addRoutineAction: jest.fn(),
      editRoutineAction: jest.fn(),
      deleteRoutineAction: jest.fn(),
      submitRoutineAction: jest.fn(),
      cancelRoutineAction: jest.fn(),
      showForm: true,
      closeForm: jest.fn(),
    };
    const display = {
      completedMinutes: 0,
      totalMinutes: 0,
      progressPercentage: 0,
      sortedRoutines: [],
      displayRoutines: [],
    };
    const trainDelays: TrainDelayInfo[] = [];

    expect(
      createHomePageDependenciesResult({
        routineOps,
        navigation,
        view,
        crud,
        display,
        trainDelays,
      }),
    ).toEqual({
      homePageData: {
        routineOps,
        currentPage: "home",
        isHydrated: true,
        onPageChangeAction: navigation.onPageChangeAction,
        view,
        crud,
        display,
        trainDelays,
      },
      showForm: true,
      closeFormAction: crud.closeForm,
      setCurrentPageAction: navigation.setCurrentPage,
    });
  });
});
