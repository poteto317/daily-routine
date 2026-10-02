import * as budgetExports from "../exports/budget";
import * as commonExports from "../exports/common";
import * as journalExports from "../exports/journal";
import * as pomodoroExports from "../exports/pomodoro";
import * as routineExports from "../exports/routine";
import * as settingsExports from "../exports/settings";
import * as weightTrackerExports from "../exports/weightTracker";
import * as workTrackerExports from "../exports/workTracker";
import * as workoutTrackerExports from "../exports/workoutTracker";

describe("storage exports barrels", () => {
  it("budget exports are defined", () => {
    expect(budgetExports.getBudgetData).toBeDefined();
    expect(budgetExports.saveBudgetData).toBeDefined();
    expect(budgetExports.getMonthlyExpenses).toBeDefined();
    expect(budgetExports.addExpense).toBeDefined();
    expect(budgetExports.updateExpense).toBeDefined();
    expect(budgetExports.deleteExpense).toBeDefined();
    expect(budgetExports.getMonthlyTotalExpense).toBeDefined();
  });

  it("common exports are defined", () => {
    expect(commonExports.generateId).toBeDefined();
    expect(commonExports.getStorageItem).toBeDefined();
    expect(commonExports.setStorageItem).toBeDefined();
    expect(commonExports.getTodayString).toBeDefined();
    expect(commonExports.toJstDateKey).toBeDefined();
    expect(commonExports.toJstDay).toBeDefined();
    expect(commonExports.toJstTime).toBeDefined();
    expect(commonExports.getJstToday).toBeDefined();
    expect(commonExports.getCurrentTime).toBeDefined();
    expect(commonExports.timeToMinutes).toBeDefined();
    expect(commonExports.minutesToTime).toBeDefined();
    expect(commonExports.formatDuration).toBeDefined();
    expect(commonExports.formatTimer).toBeDefined();
    expect(commonExports.formatTimerLong).toBeDefined();
    expect(commonExports.isTimePassed).toBeDefined();
    expect(commonExports.calculateSessionStats).toBeDefined();
    expect(commonExports.setCurrentUserId).toBeDefined();
    expect(commonExports.getCurrentUserId).toBeDefined();
    expect(commonExports.getUserScopedKey).toBeDefined();
  });

  it("journal exports are defined", () => {
    expect(journalExports.getJournalHistory).toBeDefined();
    expect(journalExports.saveJournalHistory).toBeDefined();
    expect(journalExports.getTodayJournalEntry).toBeDefined();
    expect(journalExports.getJournalEntry).toBeDefined();
    expect(journalExports.saveJournalEntry).toBeDefined();
    expect(journalExports.deleteJournalEntry).toBeDefined();
  });

  it("pomodoro exports are defined", () => {
    expect(pomodoroExports.getPomodoroHistory).toBeDefined();
    expect(pomodoroExports.savePomodoroHistory).toBeDefined();
    expect(pomodoroExports.getTodayPomodoros).toBeDefined();
    expect(pomodoroExports.incrementTodayPomodoros).toBeDefined();
  });

  it("routine exports are defined", () => {
    expect(routineExports.getRoutines).toBeDefined();
    expect(routineExports.saveRoutines).toBeDefined();
    expect(routineExports.getDailyProgress).toBeDefined();
    expect(routineExports.saveDailyProgress).toBeDefined();
    expect(routineExports.saveDailyHistory).toBeDefined();
    expect(routineExports.getMonthlyHistory).toBeDefined();
    expect(routineExports.saveMonthlyHistory).toBeDefined();
    expect(routineExports.getDailyHistory).toBeDefined();
    expect(routineExports.getHistoryForMonth).toBeDefined();
    expect(routineExports.shouldShowRoutineForDate).toBeDefined();
    expect(routineExports.shouldShowRoutineToday).toBeDefined();
    expect(routineExports.filterRoutinesByDayOfWeek).toBeDefined();
    expect(routineExports.hasTimeConflict).toBeDefined();
    expect(routineExports.findNextAvailableTime).toBeDefined();
  });

  it("settings exports are defined", () => {
    expect(settingsExports.getSettings).toBeDefined();
    expect(settingsExports.saveSettings).toBeDefined();
  });

  it("weightTracker exports are defined", () => {
    expect(weightTrackerExports.getWeightHistory).toBeDefined();
    expect(weightTrackerExports.saveWeightHistory).toBeDefined();
    expect(weightTrackerExports.getWeightRecord).toBeDefined();
    expect(weightTrackerExports.getTodayWeightRecord).toBeDefined();
    expect(weightTrackerExports.saveWeightRecord).toBeDefined();
    expect(weightTrackerExports.deleteWeightRecord).toBeDefined();
  });

  it("workTracker exports are defined", () => {
    expect(workTrackerExports.getWorkSessionHistory).toBeDefined();
    expect(workTrackerExports.saveWorkSessionHistory).toBeDefined();
    expect(workTrackerExports.getWorkTemplates).toBeDefined();
    expect(workTrackerExports.saveWorkTemplates).toBeDefined();
    expect(workTrackerExports.addWorkTemplate).toBeDefined();
    expect(workTrackerExports.updateWorkTemplate).toBeDefined();
    expect(workTrackerExports.updateWorkTemplateLastUsed).toBeDefined();
    expect(workTrackerExports.deleteWorkTemplate).toBeDefined();
    expect(workTrackerExports.getOrCreateWorkTemplate).toBeDefined();
    expect(workTrackerExports.getTodayWorkSessions).toBeDefined();
    expect(workTrackerExports.addWorkSession).toBeDefined();
    expect(workTrackerExports.updateWorkSession).toBeDefined();
    expect(workTrackerExports.deleteWorkSession).toBeDefined();
    expect(workTrackerExports.getAllWorkSessions).toBeDefined();
    expect(workTrackerExports.getSessionsByTemplateId).toBeDefined();
    expect(workTrackerExports.getSessionsByWorkName).toBeDefined();
    expect(workTrackerExports.getTemplateStats).toBeDefined();
    expect(workTrackerExports.getWorkNameStats).toBeDefined();
  });

  it("workoutTracker exports are defined", () => {
    expect(workoutTrackerExports.getWorkoutRecordHistory).toBeDefined();
    expect(workoutTrackerExports.saveWorkoutRecordHistory).toBeDefined();
    expect(workoutTrackerExports.addWorkoutRecord).toBeDefined();
    expect(workoutTrackerExports.deleteWorkoutRecord).toBeDefined();
    expect(workoutTrackerExports.getAllWorkoutRecords).toBeDefined();
  });
});
