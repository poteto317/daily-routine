import * as budgetStorage from "@/features/budget/storage";
import * as journalStorage from "@/features/journal/storage";
import * as mealStorage from "@/features/meal/storage";
import * as pomodoroStorage from "@/features/pomodoro/storage";
import * as presetStorage from "@/features/preset/storage";
import * as routineStorage from "@/features/routine/storage";
import * as settingsStorage from "@/features/settings/storage";
import * as todoListsStorage from "@/features/todo-lists/storage";
import * as weightTrackerStorage from "@/features/weight-tracker/storage";
import * as workoutTrackerStorage from "@/features/workout-tracker/storage";
import * as workTrackerStorage from "@/features/work-tracker/storage";
import type { SyncPayload } from "../sync/types";

type StorageReadMockMap = {
  [Key in keyof SyncPayload]: (value: SyncPayload[Key]) => void;
};

type StorageReadAssertionMap = {
  [Key in keyof SyncPayload]: () => void;
};

type StorageSaveAssertionMap = {
  [Key in keyof SyncPayload]: (value: SyncPayload[Key]) => void;
};

const storageReadMocks: StorageReadMockMap = {
  routines: (value) =>
    (routineStorage.getRoutines as jest.Mock).mockReturnValue(value),
  dailyProgress: (value) =>
    (routineStorage.getDailyProgress as jest.Mock).mockReturnValue(value),
  dailyHistory: (value) =>
    (routineStorage.getMonthlyHistory as jest.Mock).mockReturnValue(value),
  settings: (value) =>
    (settingsStorage.getSettings as jest.Mock).mockReturnValue(value),
  pomodoroHistory: (value) =>
    (pomodoroStorage.getPomodoroHistory as jest.Mock).mockReturnValue(value),
  workSessionHistory: (value) =>
    (workTrackerStorage.getWorkSessionHistory as jest.Mock).mockReturnValue(
      value,
    ),
  workTemplates: (value) =>
    (workTrackerStorage.getWorkTemplates as jest.Mock).mockReturnValue(value),
  weightHistory: (value) =>
    (weightTrackerStorage.getWeightHistory as jest.Mock).mockReturnValue(value),
  workoutRecordHistory: (value) =>
    (
      workoutTrackerStorage.getWorkoutRecordHistory as jest.Mock
    ).mockReturnValue(value),
  journalHistory: (value) =>
    (journalStorage.getJournalHistory as jest.Mock).mockReturnValue(value),
  budgetData: (value) =>
    (budgetStorage.getBudgetData as jest.Mock).mockReturnValue(value),
  budgetCategories: (value) =>
    (budgetStorage.getBudgetCategories as jest.Mock).mockReturnValue(value),
  budgetIncomeItems: (value) =>
    (budgetStorage.getBudgetIncomeItems as jest.Mock).mockReturnValue(value),
  budgetExpenseItems: (value) =>
    (budgetStorage.getBudgetExpenseItems as jest.Mock).mockReturnValue(value),
  mealHistory: (value) =>
    (mealStorage.getMealHistory as jest.Mock).mockReturnValue(value),
  presets: (value) =>
    (presetStorage.getPresets as jest.Mock).mockReturnValue(value),
  todoLists: (value) =>
    (todoListsStorage.getTodoLists as jest.Mock).mockReturnValue(value),
  todoCategories: (value) =>
    (todoListsStorage.getTodoCategories as jest.Mock).mockReturnValue(value),
};

const storageSaveAssertions: StorageSaveAssertionMap = {
  routines: (value) =>
    expect(routineStorage.saveRoutines).toHaveBeenCalledWith(value),
  dailyProgress: (value) => {
    if (value === null) {
      expect(routineStorage.saveDailyProgressForSync).not.toHaveBeenCalled();
      return;
    }

    expect(routineStorage.saveDailyProgressForSync).toHaveBeenCalledWith(value);
  },
  dailyHistory: (value) =>
    expect(routineStorage.saveMonthlyHistory).toHaveBeenCalledWith(value),
  settings: (value) =>
    expect(settingsStorage.saveSettings).toHaveBeenCalledWith(value),
  pomodoroHistory: (value) =>
    expect(pomodoroStorage.savePomodoroHistory).toHaveBeenCalledWith(value),
  workSessionHistory: (value) =>
    expect(workTrackerStorage.saveWorkSessionHistory).toHaveBeenCalledWith(
      value,
    ),
  workTemplates: (value) =>
    expect(workTrackerStorage.saveWorkTemplates).toHaveBeenCalledWith(value),
  weightHistory: (value) =>
    expect(weightTrackerStorage.saveWeightHistory).toHaveBeenCalledWith(value),
  workoutRecordHistory: (value) =>
    expect(workoutTrackerStorage.saveWorkoutRecordHistory).toHaveBeenCalledWith(
      value,
    ),
  journalHistory: (value) =>
    expect(journalStorage.saveJournalHistory).toHaveBeenCalledWith(value),
  budgetData: (value) =>
    expect(budgetStorage.saveBudgetData).toHaveBeenCalledWith(value),
  budgetCategories: (value) =>
    expect(budgetStorage.saveBudgetCategories).toHaveBeenCalledWith(value),
  budgetIncomeItems: (value) =>
    expect(budgetStorage.saveBudgetIncomeItems).toHaveBeenCalledWith(value),
  budgetExpenseItems: (value) =>
    expect(budgetStorage.saveBudgetExpenseItems).toHaveBeenCalledWith(value),
  mealHistory: (value) =>
    expect(mealStorage.saveMealHistory).toHaveBeenCalledWith(value),
  presets: (value) =>
    expect(presetStorage.savePresets).toHaveBeenCalledWith(value),
  todoLists: (value) =>
    expect(todoListsStorage.saveTodoLists).toHaveBeenCalledWith(value),
  todoCategories: (value) =>
    expect(todoListsStorage.saveTodoCategories).toHaveBeenCalledWith(value),
};

const storageReadAssertions: StorageReadAssertionMap = {
  routines: () => expect(routineStorage.getRoutines).toHaveBeenCalled(),
  dailyProgress: () =>
    expect(routineStorage.getDailyProgress).toHaveBeenCalled(),
  dailyHistory: () =>
    expect(routineStorage.getMonthlyHistory).toHaveBeenCalled(),
  settings: () => expect(settingsStorage.getSettings).toHaveBeenCalled(),
  pomodoroHistory: () =>
    expect(pomodoroStorage.getPomodoroHistory).toHaveBeenCalled(),
  workSessionHistory: () =>
    expect(workTrackerStorage.getWorkSessionHistory).toHaveBeenCalled(),
  workTemplates: () =>
    expect(workTrackerStorage.getWorkTemplates).toHaveBeenCalled(),
  weightHistory: () =>
    expect(weightTrackerStorage.getWeightHistory).toHaveBeenCalled(),
  workoutRecordHistory: () =>
    expect(workoutTrackerStorage.getWorkoutRecordHistory).toHaveBeenCalled(),
  journalHistory: () =>
    expect(journalStorage.getJournalHistory).toHaveBeenCalled(),
  budgetData: () => expect(budgetStorage.getBudgetData).toHaveBeenCalled(),
  budgetCategories: () =>
    expect(budgetStorage.getBudgetCategories).toHaveBeenCalled(),
  budgetIncomeItems: () =>
    expect(budgetStorage.getBudgetIncomeItems).toHaveBeenCalled(),
  budgetExpenseItems: () =>
    expect(budgetStorage.getBudgetExpenseItems).toHaveBeenCalled(),
  mealHistory: () => expect(mealStorage.getMealHistory).toHaveBeenCalled(),
  presets: () => expect(presetStorage.getPresets).toHaveBeenCalled(),
  todoLists: () => expect(todoListsStorage.getTodoLists).toHaveBeenCalled(),
  todoCategories: () =>
    expect(todoListsStorage.getTodoCategories).toHaveBeenCalled(),
};

export const seedSyncStorageReadMocks = (data: SyncPayload): void => {
  for (const key of Object.keys(storageReadMocks) as (keyof SyncPayload)[]) {
    seedSyncStorageReadMock(key, data);
  }
};

export const expectSyncStorageReadMocksCalled = (): void => {
  for (const key of Object.keys(
    storageReadAssertions,
  ) as (keyof SyncPayload)[]) {
    storageReadAssertions[key]();
  }
};

export const expectSyncPayloadSavedToLocal = (data: SyncPayload): void => {
  for (const key of Object.keys(
    storageSaveAssertions,
  ) as (keyof SyncPayload)[]) {
    expectSyncPayloadFieldSaved(key, data);
  }
};

const seedSyncStorageReadMock = <Key extends keyof SyncPayload>(
  key: Key,
  data: SyncPayload,
): void => {
  storageReadMocks[key](data[key]);
};

const expectSyncPayloadFieldSaved = <Key extends keyof SyncPayload>(
  key: Key,
  data: SyncPayload,
): void => {
  storageSaveAssertions[key](data[key]);
};
