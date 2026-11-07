import { act, renderHook } from "@testing-library/react";
import { useHomeViewControlActions } from "../useHomeViewControlActions";

jest.mock("../homeViewStateHookActions", () => ({
  createSetHomeFilterCategoryAction: jest.fn(),
  createSetHomeViewModeAction: jest.fn(),
  createToggleHomeEditModeAction: jest.fn(),
}));

import {
  createSetHomeFilterCategoryAction,
  createSetHomeViewModeAction,
  createToggleHomeEditModeAction,
} from "../homeViewStateHookActions";

const createParams = (
  overrides: Partial<Parameters<typeof useHomeViewControlActions>[0]> = {},
) => ({
  canUseWindow: true,
  getIsTodayHoliday: jest.fn(() => false),
  isEditMode: false,
  setFilterCategory: jest.fn(),
  setIsEditMode: jest.fn(),
  setSelectedViewMode: jest.fn(),
  ...overrides,
});

/** createSetHomeViewModeAction に渡された「押した時点の既定のタブ」を返す関数 */
const getPassedDefaultViewModeGetter = (): (() => unknown) => {
  return (createSetHomeViewModeAction as jest.Mock).mock.calls[0][0]
    .getDefaultViewMode;
};

describe("useHomeViewControlActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createToggleHomeEditModeAction as jest.Mock).mockReturnValue(jest.fn());
    (createSetHomeFilterCategoryAction as jest.Mock).mockReturnValue(jest.fn());
    (createSetHomeViewModeAction as jest.Mock).mockReturnValue(jest.fn());
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("filter/view/edit action を組み立てて委譲する", () => {
    const toggleAction = jest.fn();
    const filterAction = jest.fn();
    const viewModeAction = jest.fn();
    (createToggleHomeEditModeAction as jest.Mock).mockReturnValue(toggleAction);
    (createSetHomeFilterCategoryAction as jest.Mock).mockReturnValue(
      filterAction,
    );
    (createSetHomeViewModeAction as jest.Mock).mockReturnValue(viewModeAction);
    const params = createParams();

    const { result } = renderHook(() => useHomeViewControlActions(params));

    act(() => {
      result.current.toggleEditModeAction();
      result.current.setFilterCategoryAction("work");
      result.current.setViewModeAction(5);
    });

    expect(createToggleHomeEditModeAction).toHaveBeenCalledWith({
      isEditMode: false,
      setIsEditMode: params.setIsEditMode,
    });
    expect(createSetHomeFilterCategoryAction).toHaveBeenCalledWith({
      setFilterCategory: params.setFilterCategory,
    });
    expect(createSetHomeViewModeAction).toHaveBeenCalledWith({
      getDefaultViewMode: expect.any(Function),
      setSelectedViewMode: params.setSelectedViewMode,
    });
    expect(toggleAction).toHaveBeenCalled();
    expect(filterAction).toHaveBeenCalledWith("work");
    expect(viewModeAction).toHaveBeenCalledWith(5);
  });

  it("既定のタブを返す関数は、今日が祝日でなければ今日の JST の曜日を返す", () => {
    // 2026-11-04 は水曜（3）
    jest.useFakeTimers().setSystemTime(new Date("2026-11-04T12:00:00+09:00"));
    const { result } = renderHook(() =>
      useHomeViewControlActions(createParams()),
    );

    act(() => {
      result.current.setViewModeAction(5);
    });

    expect(getPassedDefaultViewModeGetter()()).toBe(3);
  });

  it("既定のタブを返す関数は、今日が祝日なら holiday を返す", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-11-03T12:00:00+09:00"));
    const { result } = renderHook(() =>
      useHomeViewControlActions(
        createParams({ getIsTodayHoliday: jest.fn(() => true) }),
      ),
    );

    act(() => {
      result.current.setViewModeAction(5);
    });

    expect(getPassedDefaultViewModeGetter()()).toBe("holiday");
  });

  it("既定のタブを返す関数は、window が無いときは祝日でも今日の JST の曜日を返す", () => {
    // 2026-11-03 は火曜（2）
    jest.useFakeTimers().setSystemTime(new Date("2026-11-03T12:00:00+09:00"));
    const { result } = renderHook(() =>
      useHomeViewControlActions(
        createParams({
          canUseWindow: false,
          getIsTodayHoliday: jest.fn(() => true),
        }),
      ),
    );

    act(() => {
      result.current.setViewModeAction(5);
    });

    expect(getPassedDefaultViewModeGetter()()).toBe(2);
  });
});
