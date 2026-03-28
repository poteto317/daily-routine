import { act, renderHook } from "@testing-library/react";
import { createAccountAdminCreateFormVisibilityStateResult } from "../accountAdminCreateFormVisibilityStateResult";
import { useAccountAdminCreateFormVisibilityState } from "../useAccountAdminCreateFormVisibilityState";

jest.mock("../accountAdminCreateFormVisibilityStateResult", () => ({
  createAccountAdminCreateFormVisibilityStateResult: jest.fn(),
}));

describe("useAccountAdminCreateFormVisibilityState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (
      createAccountAdminCreateFormVisibilityStateResult as jest.Mock
    ).mockImplementation((args) => args);
  });

  it("作成フォーム表示の open/close state を管理する", () => {
    const { result } = renderHook(() =>
      useAccountAdminCreateFormVisibilityState(),
    );

    expect(
      createAccountAdminCreateFormVisibilityStateResult,
    ).toHaveBeenCalledWith({
      closeCreateForm: expect.any(Function),
      setShowCreateForm: expect.any(Function),
      showCreateForm: false,
      toggleCreateForm: expect.any(Function),
    });

    expect(result.current.showCreateForm).toBe(false);

    act(() => {
      result.current.toggleCreateForm();
    });

    expect(result.current.showCreateForm).toBe(true);
    expect(
      createAccountAdminCreateFormVisibilityStateResult,
    ).toHaveBeenLastCalledWith({
      closeCreateForm: expect.any(Function),
      setShowCreateForm: expect.any(Function),
      showCreateForm: true,
      toggleCreateForm: expect.any(Function),
    });

    act(() => {
      result.current.closeCreateForm();
    });

    expect(result.current.showCreateForm).toBe(false);
    expect(
      createAccountAdminCreateFormVisibilityStateResult,
    ).toHaveBeenLastCalledWith({
      closeCreateForm: expect.any(Function),
      setShowCreateForm: expect.any(Function),
      showCreateForm: false,
      toggleCreateForm: expect.any(Function),
    });
  });
});
