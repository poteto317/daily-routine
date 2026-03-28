import { renderHook } from "@testing-library/react";

jest.mock("../testMatrixDataStateResult", () => ({
  createTestMatrixDataStateResult: jest.fn(),
}));

jest.mock("../useTestMatrixDataActions", () => ({
  useTestMatrixDataActions: jest.fn(),
}));

jest.mock("../useTestMatrixPersistence", () => ({
  useTestMatrixPersistence: jest.fn(),
}));

jest.mock("../storage", () => ({
  getStoredTestMatrixCategories: jest.fn(),
  getStoredTestMatrixDetailData: jest.fn(),
}));

import { createTestMatrixDataStateResult } from "../testMatrixDataStateResult";
import {
  getStoredTestMatrixCategories,
  getStoredTestMatrixDetailData,
} from "../storage";
import { useTestMatrixDataActions } from "../useTestMatrixDataActions";
import { useTestMatrixDataState } from "../useTestMatrixDataState";
import { useTestMatrixPersistence } from "../useTestMatrixPersistence";

describe("useTestMatrixDataState composition", () => {
  it("state/persistence/actions/result builder を compose する", () => {
    const categories = [
      {
        id: "auth",
        title: "認証",
        items: [],
      },
    ];
    const detailData = {
      auth: [],
    };
    const actions = {
      toggleStatus: jest.fn(),
      updateNote: jest.fn(),
      toggleDetailStatus: jest.fn(),
      updateDetailNote: jest.fn(),
      resetAll: jest.fn(),
    };
    const builtResult = {
      categories,
      detailData,
      ...actions,
    };

    (getStoredTestMatrixCategories as jest.Mock).mockReturnValue(categories);
    (getStoredTestMatrixDetailData as jest.Mock).mockReturnValue(detailData);
    (useTestMatrixDataActions as jest.Mock).mockReturnValue(actions);
    (createTestMatrixDataStateResult as jest.Mock).mockReturnValue(builtResult);

    const { result } = renderHook(() =>
      useTestMatrixDataState({
        resetConfirmMessage: "reset?",
        selectedItemId: "auth",
      }),
    );

    expect(useTestMatrixPersistence).toHaveBeenCalledWith({
      categories,
      detailData,
    });
    expect(useTestMatrixDataActions).toHaveBeenCalledWith({
      confirmReset: expect.any(Function),
      resetConfirmMessage: "reset?",
      selectedItemId: "auth",
      setCategories: expect.any(Function),
      setDetailData: expect.any(Function),
    });
    expect(createTestMatrixDataStateResult).toHaveBeenCalledWith({
      categoriesState: [categories, expect.any(Function)],
      detailDataState: [detailData, expect.any(Function)],
      actions,
    });
    expect(result.current).toBe(builtResult);
  });
});
