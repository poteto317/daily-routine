import { act, renderHook } from "@testing-library/react";

jest.mock("../testMatrixDataMutations", () => ({
  updateDetailCaseNote: jest.fn(),
  updateDetailCaseStatus: jest.fn(),
  updateTestMatrixItemNote: jest.fn(),
  updateTestMatrixItemStatus: jest.fn(),
}));

jest.mock("../testMatrixResetState", () => ({
  createResetTestMatrixState: jest.fn(),
}));

jest.mock("../testMatrixDataActionsResult", () => ({
  createTestMatrixDataActionsResult: jest.fn(),
}));

import {
  updateDetailCaseNote,
  updateDetailCaseStatus,
  updateTestMatrixItemNote,
  updateTestMatrixItemStatus,
} from "../testMatrixDataMutations";
import { createTestMatrixDataActionsResult } from "../testMatrixDataActionsResult";
import { createResetTestMatrixState } from "../testMatrixResetState";
import { useTestMatrixDataActions } from "../useTestMatrixDataActions";

describe("useTestMatrixDataActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (updateTestMatrixItemStatus as jest.Mock).mockImplementation(
      (next) => next,
    );
    (updateTestMatrixItemNote as jest.Mock).mockImplementation((next) => next);
    (updateDetailCaseStatus as jest.Mock).mockImplementation((next) => next);
    (updateDetailCaseNote as jest.Mock).mockImplementation((next) => next);
    (createResetTestMatrixState as jest.Mock).mockReturnValue({
      categories: [{ id: "auth", title: "認証", items: [] }],
      detailData: { "1-1": [] },
    });
  });

  it("一覧/詳細/リセット action を委譲する", () => {
    const confirmReset = jest.fn(() => true);
    const setCategories = jest.fn();
    const setDetailData = jest.fn();
    const resultShape = {
      resetAll: jest.fn(),
      toggleDetailStatus: jest.fn(),
      toggleStatus: jest.fn(),
      updateDetailNote: jest.fn(),
      updateNote: jest.fn(),
      composed: true,
    };
    (createTestMatrixDataActionsResult as jest.Mock).mockReturnValue(
      resultShape,
    );

    const { result } = renderHook(() =>
      useTestMatrixDataActions({
        confirmReset,
        resetConfirmMessage: "reset?",
        selectedItemId: "1-1",
        setCategories,
        setDetailData,
      }),
    );

    expect(result.current).toBe(resultShape);
    expect(createTestMatrixDataActionsResult).toHaveBeenCalledWith({
      resetAll: expect.any(Function),
      toggleDetailStatus: expect.any(Function),
      toggleStatus: expect.any(Function),
      updateDetailNote: expect.any(Function),
      updateNote: expect.any(Function),
    });

    const builtActions = (createTestMatrixDataActionsResult as jest.Mock).mock
      .calls[0][0] as {
      resetAll: () => boolean;
      toggleDetailStatus: (caseId: string, field: "pc" | "sp") => void;
      toggleStatus: (catId: string, itemId: string, field: "pc" | "sp") => void;
      updateDetailNote: (caseId: string, note: string) => void;
      updateNote: (catId: string, itemId: string, note: string) => void;
    };

    act(() => {
      builtActions.toggleStatus("auth", "1-1", "pc");
      builtActions.updateNote("auth", "1-1", "memo");
      builtActions.toggleDetailStatus("case-1", "sp");
      builtActions.updateDetailNote("case-1", "detail memo");
      builtActions.resetAll();
    });

    expect(setCategories).toHaveBeenCalledTimes(3);
    expect(setDetailData).toHaveBeenCalledTimes(3);
    expect(confirmReset).toHaveBeenCalledWith("reset?");
  });
});
