import {
  createHomeViewStateResult,
  createSetHomeFilterCategoryAction,
  createSetHomeViewModeAction,
  createToggleHomeEditModeAction,
} from "../homeViewStateHookActions";

jest.mock("../homeViewPersistence", () => ({
  saveFilterCategory: jest.fn(),
  saveIsEditMode: jest.fn(),
  saveViewMode: jest.fn(),
}));

jest.mock("../homeViewStateActions", () => ({
  setHomeFilterCategoryState: jest.fn(),
  setHomeViewModeState: jest.fn(),
  toggleHomeEditModeState: jest.fn(),
}));

import {
  saveFilterCategory,
  saveIsEditMode,
  saveViewMode,
} from "../homeViewPersistence";
import {
  setHomeFilterCategoryState,
  setHomeViewModeState,
  toggleHomeEditModeState,
} from "../homeViewStateActions";
import type { HomeDayOption } from "../../pages/homeTypes";

describe("homeViewStateHookActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("編集モード toggle action を構築する", () => {
    const setIsEditMode = jest.fn();
    (toggleHomeEditModeState as jest.Mock).mockReturnValue(true);

    expect(
      createToggleHomeEditModeAction({
        isEditMode: false,
        setIsEditMode,
      })(),
    ).toBe(true);

    expect(toggleHomeEditModeState).toHaveBeenCalledWith({
      isEditMode: false,
      setIsEditMode,
      saveIsEditMode,
    });
  });

  it("filter と view mode action を構築する", () => {
    const setFilterCategory = jest.fn();
    const setViewMode = jest.fn();

    createSetHomeFilterCategoryAction({ setFilterCategory })("work");
    expect(setHomeFilterCategoryState).toHaveBeenCalledWith({
      category: "work",
      setFilterCategory,
      saveFilterCategory,
    });

    createSetHomeViewModeAction({ setViewMode })(5);
    expect(setHomeViewModeState).toHaveBeenCalledWith({
      mode: 5,
      setViewMode,
      saveViewMode,
    });
  });

  it("view state result をそのまま返す", () => {
    const params = {
      currentDate: "2026年3月8日",
      isTodayHoliday: false,
      filterCategory: "all" as const,
      setFilterCategoryAction: jest.fn(),
      viewMode: 1 as const,
      setViewModeAction: jest.fn(),
      isEditMode: true,
      toggleEditModeAction: jest.fn(() => false),
      sortedDaysAndHoliday: [
        { value: 1, label: "月" },
        { value: 2, label: "火" },
        "holiday",
      ] as (HomeDayOption | "holiday")[],
    };

    expect(createHomeViewStateResult(params)).toEqual(params);
  });
});
