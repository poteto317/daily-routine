import { type Routine } from "@/types/routine";
import type { HomeContentSource } from "../homeTypes";

export const routineA: Routine = {
  id: "r1",
  title: "A",
  startTime: "08:00",
  duration: 30,
  category: "health",
  daysOfWeek: [1],
  isCompleted: false,
  sortOrder: 0,
  createdAt: "2026-02-12T00:00:00.000Z",
  updatedAt: "2026-02-12T00:00:00.000Z",
};

export const routineB: Routine = {
  ...routineA,
  id: "r2",
  title: "B",
  sortOrder: 1,
};

export const createData = (viewMode: "holiday" | number): HomeContentSource => {
  return {
    currentPage: "home",
    view: {
      currentDate: "2026年2月12日(木)",
      isTodayHoliday: viewMode === "holiday",
      isEditMode: true,
      toggleEditModeAction: jest.fn(),
      viewMode,
      setViewModeAction: jest.fn(),
      filterCategory: "all",
      setFilterCategoryAction: jest.fn(),
      sortedDaysAndHoliday: [{ value: 1, label: "月曜日" }, "holiday"],
    },
    crud: {
      addRoutineAction: jest.fn(),
      editRoutineAction: jest.fn(),
      deleteRoutineAction: jest.fn(),
      submitRoutineAction: jest.fn(),
      cancelRoutineAction: jest.fn(),
      editingRoutine: routineA,
      showForm: true,
    },
    display: {
      sortedRoutines: [routineA],
      displayRoutines: [routineA],
      completedMinutes: 30,
      totalMinutes: 60,
      progressPercentage: 50,
    },
    trainDelays: [],
    routineOps: {
      routines: [routineA, routineB],
      toggleComplete: jest.fn(),
      reorderRoutines: jest.fn(),
    },
  };
};
