import { renderHook } from "@testing-library/react";
import { useHomePageViewModel } from "../helpers";
import { useHomePageData } from "../useHomePageData";
import {
  createHomePageViewModel,
  type HomePageViewModel,
} from "../../pages/helpers";

jest.mock("../useHomePageData", () => ({
  useHomePageData: jest.fn(),
}));

jest.mock("../../pages/helpers", () => ({
  createHomePageViewModel: jest.fn(),
}));

describe("useHomePageViewModel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("HomePageDataをcreateHomePageViewModelへ委譲して返す", () => {
    const homePageData = {
      currentPage: "home",
      isHydrated: true,
      onPageChangeAction: jest.fn(),
      view: { isEditMode: true, toggleEditModeAction: jest.fn() },
    };

    const pageViewModel: HomePageViewModel = {
      isHydrated: true,
      pageLayoutProps: {
        currentPage: "home",
        onNavigateAction: jest.fn(),
        isEditMode: true,
        onToggleEditModeAction: jest.fn(),
      },
      contentViewModel: {
        toolbarProps: {
          view: {
            currentDate: "2026年2月13日(金)",
            isTodayHoliday: false,
            isEditMode: true,
            toggleEditModeAction: jest.fn(),
            viewMode: 5,
            setViewModeAction: jest.fn(),
            filterCategory: "all",
            setFilterCategoryAction: jest.fn(),
            sortedDaysAndHoliday: [{ value: 5, label: "金曜日" }, "holiday"],
          },
          display: {
            completedMinutes: 30,
            totalMinutes: 60,
            progressPercentage: 50,
          },
          trainDelays: [],
          onAddRoutineAction: jest.fn(),
          showAddButton: true,
        },
        routineListProps: {
          sortedRoutines: [],
          allRoutinesCount: 0,
          displayRoutinesCount: 0,
          isEditMode: true,
          onToggleAction: jest.fn(),
          onEditAction: jest.fn(),
          onDeleteAction: jest.fn(),
          onAddRoutineAction: jest.fn(),
          onReorderAction: jest.fn(),
          viewMode: 5,
        },
        routineFormProps: {
          routine: undefined,
          onSubmitAction: jest.fn(),
          onCancelAction: jest.fn(),
          currentDayOfWeek: 5,
        },
        showRoutineForm: false,
      },
    };

    (useHomePageData as jest.Mock).mockReturnValue(homePageData);
    (createHomePageViewModel as jest.Mock).mockReturnValue(pageViewModel);

    const { result } = renderHook(() => useHomePageViewModel());

    expect(createHomePageViewModel).toHaveBeenCalledWith(homePageData);
    expect(result.current).toEqual(pageViewModel);
  });
});
