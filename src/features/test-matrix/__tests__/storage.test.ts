import {
  getStoredTestMatrixCategories,
  getStoredTestMatrixDetailData,
  hasBrokenVersionDetailData,
  mergeStoredDetailData,
  mergeStoredTestMatrixCategories,
  migrateLegacyCategories,
  migrateLegacyDetailData,
  saveTestMatrixCategories,
  saveTestMatrixDetailData,
} from "../storage";
import { DETAILED_TEST_CASES } from "../detailedTestCases";
import type { DetailData } from "../matrixComputations";
import type { TestCategory } from "../types";

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
    ] as TestCategory[];

    expect(mergeStoredTestMatrixCategories(initial, stored)[0].items[0]).toEqual(
      expect.objectContaining({ pc: "ok", sp: "ng", note: "saved" }),
    );
  });

  it("保存済み詳細を定義へマージする", () => {
    const merged = mergeStoredDetailData({
      [detailItemId]: [{ id: detailCaseId, pc: "ok", sp: "ng", note: "detail" }],
    } as DetailData);

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

describe("legacy ID migration", () => {
  describe("migrateLegacyCategories", () => {
    it("todo-lists カテゴリの旧ID (16-*) を todo-lists-* へ変換する", () => {
      const stored = [
        {
          id: "todo-lists",
          title: "Todoリスト",
          items: [
            { id: "16-1", label: "作成", pc: "ok" as const, sp: "unchecked" as const, note: "" },
            { id: "16-2", label: "削除", pc: "ng" as const, sp: "unchecked" as const, note: "memo" },
          ],
        },
      ];
      const result = migrateLegacyCategories(stored);
      expect(result[0].items[0].id).toBe("todo-lists-1");
      expect(result[0].items[0].pc).toBe("ok");
      expect(result[0].items[1].id).toBe("todo-lists-2");
      expect(result[0].items[1].note).toBe("memo");
    });

    it("common-ui カテゴリの旧ID (17-*) を 16-* へ変換する", () => {
      const stored = [
        {
          id: "common-ui",
          title: "共通UI",
          items: [
            { id: "17-1", label: "ヘッダー", pc: "ok" as const, sp: "ok" as const, note: "" },
          ],
        },
      ];
      const result = migrateLegacyCategories(stored);
      expect(result[0].items[0].id).toBe("16-1");
      expect(result[0].items[0].pc).toBe("ok");
    });

    it("pwa カテゴリの旧ID (18-*) を 17-* へ変換する", () => {
      const stored = [
        {
          id: "pwa",
          title: "PWA",
          items: [
            { id: "18-1", label: "SW登録", pc: "ok" as const, sp: "unchecked" as const, note: "" },
          ],
        },
      ];
      const result = migrateLegacyCategories(stored);
      expect(result[0].items[0].id).toBe("17-1");
    });

    it("lib カテゴリの旧ID (19-*) を 18-* へ変換する", () => {
      const stored = [
        {
          id: "lib",
          title: "lib",
          items: [
            { id: "19-1", label: "Firebase", pc: "ng" as const, sp: "unchecked" as const, note: "" },
          ],
        },
      ];
      const result = migrateLegacyCategories(stored);
      expect(result[0].items[0].id).toBe("18-1");
      expect(result[0].items[0].pc).toBe("ng");
    });

    it("現行IDのカテゴリは変換しない", () => {
      const stored = [
        {
          id: "common-ui",
          title: "共通UI",
          items: [
            { id: "16-1", label: "ヘッダー", pc: "ok" as const, sp: "ok" as const, note: "" },
          ],
        },
      ];
      const result = migrateLegacyCategories(stored);
      expect(result[0].items[0].id).toBe("16-1");
    });

    it("マッピングのないカテゴリはそのまま返す", () => {
      const stored = [
        {
          id: "auth",
          title: "認証",
          items: [
            { id: "1-1", label: "ログイン", pc: "ok" as const, sp: "ok" as const, note: "" },
          ],
        },
      ];
      const result = migrateLegacyCategories(stored);
      expect(result[0].items[0].id).toBe("1-1");
    });
  });

  describe("hasBrokenVersionDetailData", () => {
    it("17-5 以降のキーがあれば true を返す", () => {
      expect(hasBrokenVersionDetailData({ "17-5": [] })).toBe(true);
      expect(hasBrokenVersionDetailData({ "17-9": [] })).toBe(true);
      expect(hasBrokenVersionDetailData({ "17-10": [] })).toBe(true);
      expect(hasBrokenVersionDetailData({ "17-11": [] })).toBe(true);
    });

    it("19-* キーがあれば true を返す", () => {
      expect(hasBrokenVersionDetailData({ "19-1": [] })).toBe(true);
      expect(hasBrokenVersionDetailData({ "19-5": [] })).toBe(true);
    });

    it("pre-PR のデータ (17-1〜17-4 のみ) は false を返す", () => {
      expect(hasBrokenVersionDetailData({ "17-1": [], "17-4": [] })).toBe(false);
    });

    it("空データは false を返す", () => {
      expect(hasBrokenVersionDetailData({})).toBe(false);
    });
  });

  describe("migrateLegacyDetailData", () => {
    it("broken version 検出時にアイテムIDキーを変換する", () => {
      // broken version には 17-5 (common-ui) がある
      const data = {
        "17-1": [{ id: "17-1-1", scenario: "s", expected: "e", pc: "ok" as const, sp: "ng" as const, note: "" }],
        "17-5": [{ id: "17-5-1", scenario: "s", expected: "e", pc: "ok" as const, sp: "ok" as const, note: "" }],
      };
      const result = migrateLegacyDetailData(data);
      expect(result["16-1"]).toBeDefined();
      expect(result["16-5"]).toBeDefined();
      expect(result["17-1"]).toBeUndefined();
      expect(result["17-5"]).toBeUndefined();
    });

    it("broken version のケースIDのプレフィックスも変換する", () => {
      const data = {
        "17-5": [{ id: "17-5-1", scenario: "s", expected: "e", pc: "ok" as const, sp: "unchecked" as const, note: "n" }],
        "19-1": [{ id: "19-1-1", scenario: "s", expected: "e", pc: "ng" as const, sp: "unchecked" as const, note: "" }],
      };
      const result = migrateLegacyDetailData(data);
      expect(result["16-5"][0].id).toBe("16-5-1");
      expect(result["16-5"][0].pc).toBe("ok");
      expect(result["18-1"][0].id).toBe("18-1-1");
      expect(result["18-1"][0].pc).toBe("ng");
    });

    it("broken version の todo-lists (16-*) を todo-lists-* へ変換する", () => {
      const data = {
        "17-5": [],  // broken version 検出用
        "16-1": [{ id: "16-1-1", scenario: "s", expected: "e", pc: "ok" as const, sp: "ok" as const, note: "" }],
      };
      const result = migrateLegacyDetailData(data);
      expect(result["todo-lists-1"]).toBeDefined();
      expect(result["todo-lists-1"][0].id).toBe("todo-lists-1-1");
      expect(result["16-1"]).toBeUndefined();
    });

    it("pre-PR データ (broken version 非検出) は変換しない", () => {
      const data = {
        "16-1": [{ id: "16-1-1", scenario: "s", expected: "e", pc: "ok" as const, sp: "ok" as const, note: "" }],
        "17-1": [{ id: "17-1-1", scenario: "s", expected: "e", pc: "ok" as const, sp: "ok" as const, note: "" }],
      };
      const result = migrateLegacyDetailData(data);
      expect(result["16-1"]).toBeDefined();
      expect(result["17-1"]).toBeDefined();
      expect(result["todo-lists-1"]).toBeUndefined();
    });
  });

  describe("mergeStoredTestMatrixCategories with legacy data", () => {
    it("旧ID (17-*) のカテゴリデータをマイグレーションしてマージする", () => {
      const initial = [
        {
          id: "common-ui",
          title: "共通UI",
          items: [
            { id: "16-1", label: "ヘッダー", pc: "unchecked" as const, sp: "unchecked" as const, note: "" },
          ],
        },
      ];
      const stored = [
        {
          id: "common-ui",
          title: "共通UI",
          items: [
            { id: "17-1", label: "ヘッダー", pc: "ok" as const, sp: "na" as const, note: "legacy" },
          ],
        },
      ] as TestCategory[];
      const result = mergeStoredTestMatrixCategories(initial, stored);
      expect(result[0].items[0].id).toBe("16-1");
      expect(result[0].items[0].pc).toBe("ok");
      expect(result[0].items[0].note).toBe("legacy");
    });
  });

  describe("mergeStoredDetailData with legacy data", () => {
    it("broken version の詳細データをマイグレーションしてマージする", () => {
      // 17-5 の存在で broken version と検出される
      const stored = {
        "17-5": [{ id: "17-5-1", scenario: "s", expected: "e", pc: "ok" as const, sp: "ng" as const, note: "migrated" }],
      };
      const result = mergeStoredDetailData(stored as DetailData);
      // 17-5 → 16-5 へ変換されてマージされるはず
      const key16_5 = result["16-5"];
      expect(key16_5).toBeDefined();
      if (key16_5) {
        const found = key16_5.find((c) => c.note === "migrated");
        expect(found).toBeDefined();
      }
    });
  });
});
