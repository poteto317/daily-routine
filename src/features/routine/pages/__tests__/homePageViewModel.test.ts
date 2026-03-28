import { createHomePageViewModel } from "../helpers";
import { type HomePageData } from "../homeTypes";

describe("createHomePageViewModel", () => {
  it("PageLayout向け操作とHomeContent向けViewModelを合成する", () => {
    const onPageChangeAction = jest.fn();
    const toggleEditModeAction = jest.fn();

    const data: HomePageData = {
      currentPage: "home",
      isHydrated: true,
      onPageChangeAction,
      view: {
        currentDate: "2026年2月13日(金)",
        isTodayHoliday: false,
        isEditMode: true,
        toggleEditModeAction,
        viewMode: 5,
        setViewModeAction: jest.fn(),
        filterCategory: "all",
        setFilterCategoryAction: jest.fn(),
        sortedDaysAndHoliday: [{ value: 5, label: "金曜日" }, "holiday"],
      },
      crud: {
        addRoutineAction: jest.fn(),
        editRoutineAction: jest.fn(),
        deleteRoutineAction: jest.fn(),
        submitRoutineAction: jest.fn(),
        cancelRoutineAction: jest.fn(),
        editingRoutine: undefined,
        showForm: false,
      },
      display: {
        sortedRoutines: [],
        displayRoutines: [],
        completedMinutes: 30,
        totalMinutes: 60,
        progressPercentage: 50,
      },
      trainDelays: [],
      routineOps: {
        routines: [],
        toggleComplete: jest.fn(),
        reorderRoutines: jest.fn(),
      },
    };

    const result = createHomePageViewModel(data);

    expect(result.isHydrated).toBe(true);
    expect(result.pageLayoutProps.currentPage).toBe("home");
    expect(result.pageLayoutProps.onNavigateAction).toBe(onPageChangeAction);
    expect(result.pageLayoutProps.isEditMode).toBe(true);
    expect(result.pageLayoutProps.onToggleEditModeAction).toBe(
      toggleEditModeAction,
    );
    expect(result.contentViewModel.showRoutineForm).toBe(false);
    expect(result.contentViewModel.toolbarProps.view).toBe(data.view);
  });
});
