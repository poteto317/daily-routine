import {
  getStoredTestMatrixCategories,
  getStoredTestMatrixDetailData,
  mergeStoredDetailData,
  mergeStoredTestMatrixCategories,
  saveTestMatrixCategories,
  saveTestMatrixDetailData,
} from "../storage";
import { DETAILED_TEST_CASES } from "../detailedTestCases";

jest.mock("../initialData", () => ({
  buildInitialData: jest.fn(() => [
    {
      id: "auth",
      title: "認証",
      items: [
        {
          id: "1-1",
          label: "ログイン",
          pc: "unchecked",
          sp: "unchecked",
          note: "",
        },
      ],
    },
  ]),
}));

describe("test matrix storage", () => {
  const detailItemId = "1-2";
  const detailCaseId = DETAILED_TEST_CASES[detailItemId][0].id;

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it("保存データを初期カテゴリへマージする", () => {
    const initial = [
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
    const stored = [
      {
        id: "auth",
        title: "ignored",
        items: [{ id: "1-1", pc: "ok", sp: "ng", note: "saved" }],
      },
    ] as never;

    expect(mergeStoredTestMatrixCategories(initial, stored)[0].items[0]).toEqual(
      expect.objectContaining({ pc: "ok", sp: "ng", note: "saved" }),
    );
  });

  it("保存済み詳細を定義へマージする", () => {
    const merged = mergeStoredDetailData({
      [detailItemId]: [{ id: detailCaseId, pc: "ok", sp: "ng", note: "detail" }],
    } as never);

    expect(merged[detailItemId][0]).toEqual(
      expect.objectContaining({ pc: "ok", sp: "ng", note: "detail" }),
    );
  });

  it("storage からカテゴリと詳細を読み書きする", () => {
    localStorage.setItem(
      "test-matrix-data",
      JSON.stringify([
        {
          id: "auth",
          items: [{ id: "1-1", pc: "ok", sp: "na", note: "memo" }],
        },
      ]),
    );
    localStorage.setItem(
      "test-matrix-detail-data",
      JSON.stringify({
        [detailItemId]: [{ id: detailCaseId, pc: "ng", sp: "ok", note: "detail note" }],
      }),
    );

    expect(getStoredTestMatrixCategories()[0].items[0]).toEqual(
      expect.objectContaining({ pc: "ok", sp: "na", note: "memo" }),
    );
    expect(getStoredTestMatrixDetailData()[detailItemId][0]).toEqual(
      expect.objectContaining({ pc: "ng", sp: "ok", note: "detail note" }),
    );

    saveTestMatrixCategories([{ id: "x", title: "X", items: [] }]);
    saveTestMatrixDetailData({ ...DETAILED_TEST_CASES });

    expect(localStorage.getItem("test-matrix-data")).toContain('"id":"x"');
    expect(localStorage.getItem("test-matrix-detail-data")).not.toBeNull();
  });

  it("不正JSON時は安全な初期値へフォールバックする", () => {
    localStorage.setItem("test-matrix-data", "{");
    localStorage.setItem("test-matrix-detail-data", "{");

    expect(getStoredTestMatrixCategories()[0].id).toBe("auth");
    expect(getStoredTestMatrixDetailData()).toEqual({ ...DETAILED_TEST_CASES });
  });
});
