import { type Routine } from "@/types/routine";
import type { RoutineCrudOps, RoutineData } from "../../pages/types";
import * as deleteConfirm from "../deleteConfirm";

jest.mock("../deleteConfirm", () => ({ confirmDeleteRoutine: jest.fn() }));

export const mockConfirmDeleteRoutine =
  deleteConfirm.confirmDeleteRoutine as jest.MockedFunction<
    typeof deleteConfirm.confirmDeleteRoutine
  >;

export const routine = {
  id: "r1",
  groupId: "g1",
  title: "朝活",
  startTime: "08:00",
  duration: 30,
  category: "health",
  daysOfWeek: [1, 3],
  isCompleted: false,
  sortOrder: 0,
  createdAt: "2026-02-12T00:00:00.000Z",
  updatedAt: "2026-02-12T00:00:00.000Z",
} as Routine;

export const routineData = {
  title: "朝活",
  startTime: "08:00",
  duration: 30,
  category: "health",
  daysOfWeek: [1, 3],
  isCompleted: false,
  sortOrder: 0,
  notificationMinutes: 10,
} as RoutineData;

export const buildOps = (): RoutineCrudOps => ({
  routines: [routine],
  addRoutine: jest.fn(),
  updateRoutine: jest.fn(),
  updateRoutineGroup: jest.fn(),
  deleteRoutine: jest.fn(),
  deleteRoutineGroup: jest.fn(),
});

export const setupHistoryMocks = () => {
  jest.clearAllMocks();
  jest.spyOn(window.history, "pushState").mockImplementation(() => undefined);
  jest.spyOn(window.history, "back").mockImplementation(() => undefined);
  jest.spyOn(window, "scrollTo").mockImplementation(() => undefined);
  Object.defineProperty(window, "scrollY", { value: 200, configurable: true });
};

export const restoreHistoryMocks = () => {
  (window.history.pushState as jest.Mock).mockRestore();
  (window.history.back as jest.Mock).mockRestore();
  (window.scrollTo as jest.Mock).mockRestore();
};
