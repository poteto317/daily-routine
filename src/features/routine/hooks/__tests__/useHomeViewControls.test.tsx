import { renderHook } from "@testing-library/react";

jest.mock("../useHomeViewControlState", () => ({
  useHomeViewControlState: jest.fn(),
}));

jest.mock("../useHomeViewControlActions", () => ({
  useHomeViewControlActions: jest.fn(),
}));

jest.mock("../homeViewControlsResult", () => ({
  createHomeViewControlsResult: jest.fn(),
}));

import type { HomeSelectedViewMode } from "../../pages/homeTypes";
import { createHomeViewControlsResult } from "../homeViewControlsResult";
import { useHomeViewControlActions } from "../useHomeViewControlActions";
import { useHomeViewControlState } from "../useHomeViewControlState";
import { useHomeViewControls } from "../useHomeViewControls";

const mockControlState = (selectedViewMode: HomeSelectedViewMode) => {
  (useHomeViewControlState as jest.Mock).mockReturnValue({
    filterCategory: "health",
    isEditMode: false,
    selectedViewMode,
    setFilterCategory: jest.fn(),
    setIsEditMode: jest.fn(),
    setSelectedViewMode: jest.fn(),
  });
};

describe("useHomeViewControls", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockControlState({ mode: null });
    (useHomeViewControlActions as jest.Mock).mockReturnValue({
      setFilterCategoryAction: jest.fn(),
      setViewModeAction: jest.fn(),
      toggleEditModeAction: jest.fn(),
    });
    (createHomeViewControlsResult as jest.Mock).mockImplementation(
      (args) => args,
    );
  });

  it("state hook と actions hook を compose し result builder へ委譲する", () => {
    const getIsTodayHoliday = jest.fn(() => false);
    const { result } = renderHook(() =>
      useHomeViewControls({
        canUseWindow: true,
        currentDayOfWeek: 3,
        getIsTodayHoliday,
        isTodayHoliday: false,
      }),
    );

    const state = (useHomeViewControlState as jest.Mock).mock.results[0].value;
    const actions = (useHomeViewControlActions as jest.Mock).mock.results[0]
      .value;
    expect(useHomeViewControlState).toHaveBeenCalledWith();
    expect(useHomeViewControlActions).toHaveBeenCalledWith({
      canUseWindow: true,
      getIsTodayHoliday,
      isEditMode: false,
      setFilterCategory: state.setFilterCategory,
      setIsEditMode: state.setIsEditMode,
      setSelectedViewMode: state.setSelectedViewMode,
    });
    expect(createHomeViewControlsResult).toHaveBeenCalledWith({
      filterCategory: "health",
      isEditMode: false,
      setFilterCategoryAction: actions.setFilterCategoryAction,
      setViewModeAction: actions.setViewModeAction,
      toggleEditModeAction: actions.toggleEditModeAction,
      viewMode: 3,
    });
    expect(result.current).toEqual({
      filterCategory: "health",
      isEditMode: false,
      setFilterCategoryAction: actions.setFilterCategoryAction,
      setViewModeAction: actions.setViewModeAction,
      toggleEditModeAction: actions.toggleEditModeAction,
      viewMode: 3,
    });
    // 描画時の既定のタブは、渡された真偽値（isTodayHoliday）から求める。祝日の判定関数は描画中に呼ばない
    expect(getIsTodayHoliday).not.toHaveBeenCalled();
  });

  it.each([
    {
      title: "選んでいなければ、今日の曜日",
      selectedViewMode: { mode: null },
      canUseWindow: true,
      isTodayHoliday: false,
      expected: 3,
    },
    {
      title: "選んでいなければ、今日が祝日なら holiday",
      selectedViewMode: { mode: null },
      canUseWindow: true,
      isTodayHoliday: true,
      expected: "holiday",
    },
    {
      title: "window が無ければ、祝日でも今日の曜日",
      selectedViewMode: { mode: null },
      canUseWindow: false,
      isTodayHoliday: true,
      expected: 3,
    },
    {
      title: "曜日を選んでいれば、祝日でもその曜日",
      selectedViewMode: { mode: 5 },
      canUseWindow: true,
      isTodayHoliday: true,
      expected: 5,
    },
    {
      title: "holiday を選んでいれば、祝日でなくても holiday",
      selectedViewMode: { mode: "holiday" },
      canUseWindow: true,
      isTodayHoliday: false,
      expected: "holiday",
    },
  ] satisfies {
    title: string;
    selectedViewMode: HomeSelectedViewMode;
    canUseWindow: boolean;
    isTodayHoliday: boolean;
    expected: HomeSelectedViewMode["mode"];
  }[])(
    "表示するタブ: $title",
    ({ selectedViewMode, canUseWindow, isTodayHoliday, expected }) => {
      mockControlState(selectedViewMode);

      const { result } = renderHook(() =>
        useHomeViewControls({
          canUseWindow,
          currentDayOfWeek: 3,
          getIsTodayHoliday: jest.fn(() => false),
          isTodayHoliday,
        }),
      );

      expect(result.current.viewMode).toBe(expected);
    },
  );

  it("選んでいなければ、再描画で渡された今日の曜日・祝日フラグが変わると表示するタブも変わる", () => {
    const { result, rerender } = renderHook(
      ({ currentDayOfWeek, isTodayHoliday }) =>
        useHomeViewControls({
          canUseWindow: true,
          currentDayOfWeek,
          getIsTodayHoliday: jest.fn(() => false),
          isTodayHoliday,
        }),
      { initialProps: { currentDayOfWeek: 1, isTodayHoliday: false } },
    );
    expect(result.current.viewMode).toBe(1);

    rerender({ currentDayOfWeek: 2, isTodayHoliday: true });
    expect(result.current.viewMode).toBe("holiday");

    rerender({ currentDayOfWeek: 3, isTodayHoliday: false });
    expect(result.current.viewMode).toBe(3);
  });
});
