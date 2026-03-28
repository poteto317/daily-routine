import { act, renderHook } from "@testing-library/react";

jest.mock("../storage", () => ({
  getStoredTestMatrixCategories: jest.fn(),
  getStoredTestMatrixDetailData: jest.fn(),
  saveTestMatrixCategories: jest.fn(),
  saveTestMatrixDetailData: jest.fn(),
}));

jest.mock("../testMatrixDataMutations", () => ({
  updateDetailCaseNote: jest.fn(),
  updateDetailCaseStatus: jest.fn(),
  updateTestMatrixItemNote: jest.fn(),
  updateTestMatrixItemStatus: jest.fn(),
}));

jest.mock("../testMatrixResetState", () => ({
  createResetTestMatrixState: jest.fn(),
}));

import {
  updateDetailCaseNote,
  updateDetailCaseStatus,
  updateTestMatrixItemNote,
  updateTestMatrixItemStatus,
} from "../testMatrixDataMutations";
import { createResetTestMatrixState } from "../testMatrixResetState";
import {
  getStoredTestMatrixCategories,
  getStoredTestMatrixDetailData,
  saveTestMatrixCategories,
  saveTestMatrixDetailData,
} from "../storage";
import { useTestMatrixDataState } from "../useTestMatrixDataState";

const mockGetStoredTestMatrixCategories =
  getStoredTestMatrixCategories as jest.MockedFunction<
    typeof getStoredTestMatrixCategories
  >;
const mockGetStoredTestMatrixDetailData =
  getStoredTestMatrixDetailData as jest.MockedFunction<
    typeof getStoredTestMatrixDetailData
  >;
const mockSaveTestMatrixCategories =
  saveTestMatrixCategories as jest.MockedFunction<
    typeof saveTestMatrixCategories
  >;
const mockSaveTestMatrixDetailData =
  saveTestMatrixDetailData as jest.MockedFunction<
    typeof saveTestMatrixDetailData
  >;
const mockUpdateTestMatrixItemStatus =
  updateTestMatrixItemStatus as jest.MockedFunction<
    typeof updateTestMatrixItemStatus
  >;
const mockUpdateTestMatrixItemNote =
  updateTestMatrixItemNote as jest.MockedFunction<
    typeof updateTestMatrixItemNote
  >;
const mockUpdateDetailCaseStatus =
  updateDetailCaseStatus as jest.MockedFunction<typeof updateDetailCaseStatus>;
const mockUpdateDetailCaseNote = updateDetailCaseNote as jest.MockedFunction<
  typeof updateDetailCaseNote
>;
const mockCreateResetTestMatrixState =
  createResetTestMatrixState as jest.MockedFunction<
    typeof createResetTestMatrixState
  >;

describe("useTestMatrixDataState", () => {
  const categories = [
    {
      id: "auth",
      title: "認証",
      items: [
        {
          id: "1-1",
          label: "ログイン",
          pc: "unchecked" as const,
          sp: "unchecked" as const,
          note: "",
        },
      ],
    },
  ];
  const detailData = {
    "1-1": [
      {
        id: "case-1",
        scenario: "正常系",
        expected: "成功する",
        pc: "unchecked" as const,
        sp: "unchecked" as const,
        note: "",
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetStoredTestMatrixCategories.mockReturnValue(categories);
    mockGetStoredTestMatrixDetailData.mockReturnValue(detailData);
    mockUpdateTestMatrixItemStatus.mockImplementation((next) => next);
    mockUpdateTestMatrixItemNote.mockImplementation((next) => next);
    mockUpdateDetailCaseStatus.mockImplementation((next) => next);
    mockUpdateDetailCaseNote.mockImplementation((next) => next);
    mockCreateResetTestMatrixState.mockReturnValue({
      categories,
      detailData,
    });
  });

  it("初期状態を読み込み、永続化する", () => {
    const { result } = renderHook(() =>
      useTestMatrixDataState({
        resetConfirmMessage: "reset?",
        selectedItemId: null,
      }),
    );

    expect(result.current.categories).toEqual(categories);
    expect(result.current.detailData).toEqual(detailData);
    expect(mockSaveTestMatrixCategories).toHaveBeenCalledWith(categories);
    expect(mockSaveTestMatrixDetailData).toHaveBeenCalledWith(detailData);
  });

  it("一覧ステータスとメモ更新を委譲する", () => {
    const { result } = renderHook(() =>
      useTestMatrixDataState({
        resetConfirmMessage: "reset?",
        selectedItemId: null,
      }),
    );

    act(() => {
      result.current.toggleStatus("auth", "1-1", "pc");
      result.current.updateNote("auth", "1-1", "memo");
    });

    expect(mockUpdateTestMatrixItemStatus).toHaveBeenCalledWith(
      categories,
      "auth",
      "1-1",
      "pc",
    );
    expect(mockUpdateTestMatrixItemNote).toHaveBeenCalledWith(
      categories,
      "auth",
      "1-1",
      "memo",
    );
  });

  it("selectedItemId を使って詳細ケース更新を委譲する", () => {
    const { result } = renderHook(() =>
      useTestMatrixDataState({
        resetConfirmMessage: "reset?",
        selectedItemId: "1-1",
      }),
    );

    act(() => {
      result.current.toggleDetailStatus("case-1", "sp");
      result.current.updateDetailNote("case-1", "detail memo");
    });

    expect(mockUpdateDetailCaseStatus).toHaveBeenCalledWith(
      detailData,
      "1-1",
      "case-1",
      "sp",
    );
    expect(mockUpdateDetailCaseNote).toHaveBeenCalledWith(
      detailData,
      "1-1",
      "case-1",
      "detail memo",
    );
  });

  it("確認時のみリセットする", () => {
    const confirmReset = jest.fn(() => true);
    const { result } = renderHook(() =>
      useTestMatrixDataState({
        confirmReset,
        resetConfirmMessage: "reset?",
        selectedItemId: null,
      }),
    );

    let didReset = false;
    act(() => {
      didReset = result.current.resetAll();
    });

    expect(confirmReset).toHaveBeenCalledWith("reset?");
    expect(mockCreateResetTestMatrixState).toHaveBeenCalled();
    expect(didReset).toBe(true);
  });

  it("リセット確認をキャンセルしたら状態を変更しない", () => {
    const confirmReset = jest.fn(() => false);
    const { result } = renderHook(() =>
      useTestMatrixDataState({
        confirmReset,
        resetConfirmMessage: "reset?",
        selectedItemId: null,
      }),
    );

    let didReset = true;
    act(() => {
      didReset = result.current.resetAll();
    });

    expect(mockCreateResetTestMatrixState).not.toHaveBeenCalled();
    expect(didReset).toBe(false);
  });
});
