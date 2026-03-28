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

describe("useHomeViewControlActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

    const params = {
      isEditMode: false,
      setFilterCategory: jest.fn(),
      setIsEditMode: jest.fn(),
      setViewMode: jest.fn(),
    };

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
      setViewMode: params.setViewMode,
    });
    expect(toggleAction).toHaveBeenCalled();
    expect(filterAction).toHaveBeenCalledWith("work");
    expect(viewModeAction).toHaveBeenCalledWith(5);
  });
});
