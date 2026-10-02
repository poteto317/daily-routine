import * as routineModule from "../index";

describe("routine index exports", () => {
  it("コンポーネントがエクスポートされている", () => {
    expect(routineModule.SortableRoutineItem).toBeDefined();
    expect(routineModule.RoutineCardContent).toBeDefined();
    expect(routineModule.RoutineItem).toBeDefined();
    expect(routineModule.RoutineForm).toBeDefined();
    expect(routineModule.HomePage).toBeDefined();
    expect(routineModule.HomeContent).toBeDefined();
    expect(routineModule.PageLayout).toBeDefined();
  });

  it("フックがエクスポートされている", () => {
    expect(routineModule.useRoutines).toBeDefined();
    expect(routineModule.usePageNavigation).toBeDefined();
    expect(routineModule.useHomeViewState).toBeDefined();
    expect(routineModule.useRoutineCrud).toBeDefined();
    expect(routineModule.useRoutineDisplay).toBeDefined();
    expect(routineModule.useTrainDelays).toBeDefined();
    expect(routineModule.useFirebaseSync).toBeDefined();
  });

  it("ヘルパーがエクスポートされている", () => {
    expect(routineModule.isRoutinePast).toBeDefined();
    expect(routineModule.getCategoryInfo).toBeDefined();
    expect(routineModule.getRoutineCardStyle).toBeDefined();
    expect(routineModule.createSwipeHandler).toBeDefined();
    expect(routineModule.syncRoutinesToFirebase).toBeDefined();
    expect(routineModule.getRoutinesNeedingNotification).toBeDefined();
    expect(routineModule.sendBrowserNotification).toBeDefined();
  });

  it("ストレージ関数がエクスポートされている", () => {
    expect(routineModule.getRoutines).toBeDefined();
    expect(routineModule.saveRoutines).toBeDefined();
    expect(routineModule.getDailyProgress).toBeDefined();
    expect(routineModule.saveDailyProgress).toBeDefined();
    expect(routineModule.saveDailyHistory).toBeDefined();
    expect(routineModule.getMonthlyHistory).toBeDefined();
    expect(routineModule.saveMonthlyHistory).toBeDefined();
    expect(routineModule.getDailyHistory).toBeDefined();
    expect(routineModule.getHistoryForMonth).toBeDefined();
    expect(routineModule.shouldShowRoutineForDate).toBeDefined();
    expect(routineModule.shouldShowRoutineToday).toBeDefined();
    expect(routineModule.filterRoutinesByDayOfWeek).toBeDefined();
    expect(routineModule.hasTimeConflict).toBeDefined();
    expect(routineModule.findNextAvailableTime).toBeDefined();
  });
});
