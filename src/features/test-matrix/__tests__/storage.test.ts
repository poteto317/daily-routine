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
import type { StoredDetailData } from "../matrixComputations";
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

    expect(
      mergeStoredTestMatrixCategories(initial, stored)[0].items[0],
    ).toEqual(expect.objectContaining({ pc: "ok", sp: "ng", note: "saved" }));
  });

  it("保存済み詳細を定義へマージする", () => {
    const stored: StoredDetailData = {
      [detailItemId]: [
        { id: detailCaseId, pc: "ok", sp: "ng", note: "detail" },
      ],
    };
    const merged = mergeStoredDetailData(stored);

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
        [detailItemId]: [
          { id: detailCaseId, pc: "ng", sp: "ok", note: "detail note" },
        ],
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
            {
              id: "16-1",
              label: "作成",
              pc: "ok" as const,
              sp: "unchecked" as const,
              note: "",
            },
            {
              id: "16-2",
              label: "削除",
              pc: "ng" as const,
              sp: "unchecked" as const,
              note: "memo",
            },
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
            {
              id: "17-1",
              label: "ヘッダー",
              pc: "ok" as const,
              sp: "ok" as const,
              note: "",
            },
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
            {
              id: "18-1",
              label: "SW登録",
              pc: "ok" as const,
              sp: "unchecked" as const,
              note: "",
            },
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
            {
              id: "19-1",
              label: "Firebase",
              pc: "ng" as const,
              sp: "unchecked" as const,
              note: "",
            },
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
            {
              id: "16-1",
              label: "ヘッダー",
              pc: "ok" as const,
              sp: "ok" as const,
              note: "",
            },
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
            {
              id: "1-1",
              label: "ログイン",
              pc: "ok" as const,
              sp: "ok" as const,
              note: "",
            },
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

    it("todo-lists の旧ID 16-12〜16-20 があれば true を返す", () => {
      expect(hasBrokenVersionDetailData({ "16-12": [] })).toBe(true);
      expect(hasBrokenVersionDetailData({ "16-15": [] })).toBe(true);
      expect(hasBrokenVersionDetailData({ "16-20": [] })).toBe(true);
    });

    it("pre-PR のデータ (17-1〜17-4 のみ) は false を返す", () => {
      expect(hasBrokenVersionDetailData({ "17-1": [], "17-4": [] })).toBe(
        false,
      );
    });

    it("pre-PR のデータ (16-1〜16-11 のみ) は false を返す", () => {
      expect(hasBrokenVersionDetailData({ "16-1": [], "16-11": [] })).toBe(
        false,
      );
    });

    it("空データは false を返す", () => {
      expect(hasBrokenVersionDetailData({})).toBe(false);
    });
  });

  describe("migrateLegacyDetailData", () => {
    it("broken version 検出時にアイテムIDキーを変換する", () => {
      // broken version には 17-5 (common-ui) がある
      const data: StoredDetailData = {
        "17-1": [{ id: "17-1-1", pc: "ok", sp: "ng", note: "" }],
        "17-5": [{ id: "17-5-1", pc: "ok", sp: "ok", note: "" }],
      };
      const result = migrateLegacyDetailData(data);
      expect(result["16-1"]).toBeDefined();
      expect(result["16-5"]).toBeDefined();
      expect(result["17-1"]).toBeUndefined();
      expect(result["17-5"]).toBeUndefined();
    });

    it("broken version のケースIDのプレフィックスも変換する", () => {
      const data: StoredDetailData = {
        "17-5": [{ id: "17-5-1", pc: "ok", sp: "unchecked", note: "n" }],
        "19-1": [{ id: "19-1-1", pc: "ng", sp: "unchecked", note: "" }],
      };
      const result = migrateLegacyDetailData(data);
      expect(result["16-5"][0].id).toBe("16-5-1");
      expect(result["16-5"][0].pc).toBe("ok");
      expect(result["18-1"][0].id).toBe("18-1-1");
      expect(result["18-1"][0].pc).toBe("ng");
    });

    it("broken version の todo-lists (16-12〜16-20) を todo-lists-* へ変換する", () => {
      const data: StoredDetailData = {
        "17-5": [], // broken version 検出用
        "16-12": [{ id: "16-12-1", pc: "ok", sp: "ok", note: "" }],
        "16-20": [{ id: "16-20-1", pc: "ng", sp: "unchecked", note: "" }],
      };
      const result = migrateLegacyDetailData(data);
      expect(result["todo-lists-12"]).toBeDefined();
      expect(result["todo-lists-12"][0].id).toBe("todo-lists-12-1");
      expect(result["todo-lists-20"]).toBeDefined();
      expect(result["todo-lists-20"][0].id).toBe("todo-lists-20-1");
      expect(result["16-12"]).toBeUndefined();
      expect(result["16-20"]).toBeUndefined();
    });

    it("broken version でも 16-1〜16-11 は common-ui として保持する", () => {
      // 16-1〜16-11 は現行 common-ui 詳細キーと重複するため変換しない
      const data: StoredDetailData = {
        "17-5": [], // broken version 検出用
        "16-1": [{ id: "16-1-1", pc: "ok", sp: "ok", note: "" }],
      };
      const result = migrateLegacyDetailData(data);
      expect(result["16-1"]).toBeDefined();
      expect(result["todo-lists-1"]).toBeUndefined();
    });

    it("pre-PR データ (broken version 非検出) は変換しない", () => {
      const data: StoredDetailData = {
        "16-1": [{ id: "16-1-1", pc: "ok", sp: "ok", note: "" }],
        "17-1": [{ id: "17-1-1", pc: "ok", sp: "ok", note: "" }],
      };
      const result = migrateLegacyDetailData(data);
      expect(result["16-1"]).toBeDefined();
      expect(result["17-1"]).toBeDefined();
      expect(result["todo-lists-1"]).toBeUndefined();
    });

    it("現行IDと旧IDが共存する場合は現行IDのデータを優先する", () => {
      // "19-5" (broken版 lib item5) と "18-5" (pre-PR/現行 lib item5) が共存するケース
      // "18-5" はマイグレーション対象外の現行IDであるため、
      // "19-5" → "18-5" へのマイグレーション結果より優先される
      const data: StoredDetailData = {
        "19-5": [{ id: "19-5-1", pc: "ng", sp: "ng", note: "legacy" }],
        "18-5": [{ id: "18-5-1", pc: "ok", sp: "ok", note: "current" }],
      };
      const result = migrateLegacyDetailData(data);
      expect(result["18-5"]).toBeDefined();
      // 現行 ID のデータが優先される
      expect(result["18-5"][0].note).toBe("current");
      expect(result["18-5"][0].pc).toBe("ok");
    });

    it("lib broken (19-*) のみで 17-1〜17-4 が共存する場合は 17-* を pwa 現行IDとして保持する", () => {
      // 17-5+ がないため 17-1〜17-4 は現行 pwa データとして扱い変換しない
      const data: StoredDetailData = {
        "19-1": [{ id: "19-1-1", pc: "ok", sp: "ok", note: "lib broken" }],
        "17-1": [{ id: "17-1-1", pc: "ok", sp: "ok", note: "pwa current" }],
        "17-4": [{ id: "17-4-1", pc: "ng", sp: "unchecked", note: "" }],
      };
      const result = migrateLegacyDetailData(data);
      // lib broken は変換される
      expect(result["18-1"]).toBeDefined();
      expect(result["18-1"][0].note).toBe("lib broken");
      // pwa 現行データは変換されずそのまま保持
      expect(result["17-1"]).toBeDefined();
      expect(result["17-1"][0].note).toBe("pwa current");
      expect(result["17-4"]).toBeDefined();
      // 16-1 には誤変換されない
      expect(result["16-1"]).toBeUndefined();
    });

    it("todo-lists の旧ID 16-12〜16-20 のみで broken version を検出して変換する", () => {
      // 17-5+ や 19-* がなくても 16-12+ があれば broken version と判定される
      const data: StoredDetailData = {
        "16-12": [{ id: "16-12-1", pc: "ok", sp: "ok", note: "" }],
        "16-20": [{ id: "16-20-1", pc: "ng", sp: "unchecked", note: "" }],
      };
      const result = migrateLegacyDetailData(data);
      expect(result["todo-lists-12"]).toBeDefined();
      expect(result["todo-lists-12"][0].id).toBe("todo-lists-12-1");
      expect(result["todo-lists-20"]).toBeDefined();
      expect(result["16-12"]).toBeUndefined();
      expect(result["16-20"]).toBeUndefined();
    });

    it("現行 lib (18-5 存在) と broken data が共存する場合は 18-1〜18-4 を変換しない", () => {
      // 19-1 (broken lib) と 18-1〜18-5 (current lib) が共存するケース
      // 18-5 の存在で 18-* は現行 lib データと確定するため、18-1〜18-4 を 17-* に誤変換しない
      const data: StoredDetailData = {
        "19-1": [{ id: "19-1-1", pc: "ok", sp: "ok", note: "lib broken" }],
        "18-1": [{ id: "18-1-1", pc: "ok", sp: "ok", note: "current lib1" }],
        "18-2": [{ id: "18-2-1", pc: "ok", sp: "ok", note: "current lib2" }],
        "18-3": [{ id: "18-3-1", pc: "ng", sp: "ok", note: "current lib3" }],
        "18-4": [{ id: "18-4-1", pc: "ok", sp: "ng", note: "current lib4" }],
        "18-5": [
          { id: "18-5-1", pc: "ng", sp: "unchecked", note: "current lib5" },
        ],
      };
      const result = migrateLegacyDetailData(data);
      // 現行 lib1〜lib4 データが保持される（17-* に誤変換されない）
      expect(result["18-1"]).toBeDefined();
      expect(result["18-1"][0].note).toBe("current lib1");
      expect(result["18-2"]).toBeDefined();
      expect(result["18-2"][0].note).toBe("current lib2");
      expect(result["18-3"]).toBeDefined();
      expect(result["18-3"][0].note).toBe("current lib3");
      expect(result["18-4"]).toBeDefined();
      expect(result["18-4"][0].note).toBe("current lib4");
      // 現行 lib5 データが保持される
      expect(result["18-5"]).toBeDefined();
      expect(result["18-5"][0].note).toBe("current lib5");
      // 17-1〜17-4 には誤変換されない
      expect(result["17-1"]).toBeUndefined();
      expect(result["17-2"]).toBeUndefined();
      expect(result["17-3"]).toBeUndefined();
      expect(result["17-4"]).toBeUndefined();
    });
  });

  describe("mergeStoredTestMatrixCategories with legacy data", () => {
    it("旧ID (17-*) のカテゴリデータをマイグレーションしてマージする", () => {
      const initial = [
        {
          id: "common-ui",
          title: "共通UI",
          items: [
            {
              id: "16-1",
              label: "ヘッダー",
              pc: "unchecked" as const,
              sp: "unchecked" as const,
              note: "",
            },
          ],
        },
      ];
      const stored = [
        {
          id: "common-ui",
          title: "共通UI",
          items: [
            {
              id: "17-1",
              label: "ヘッダー",
              pc: "ok" as const,
              sp: "na" as const,
              note: "legacy",
            },
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
      const stored: StoredDetailData = {
        "17-5": [{ id: "17-5-1", pc: "ok", sp: "ng", note: "migrated" }],
      };
      const result = mergeStoredDetailData(stored);
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
