import { getTodoItemBgClass, TODO_ITEM_BG_COLORS } from "../todoItemBgColor";
import type { TodoItemBgColorValue } from "../types";

// ── TODO_ITEM_BG_COLORS 構造テスト ──────────────────────────────────────────

describe("TODO_ITEM_BG_COLORS", () => {
  it("8 色定義されている", () => {
    expect(TODO_ITEM_BG_COLORS).toHaveLength(8);
  });

  it("先頭エントリはデフォルト（value=undefined）", () => {
    expect(TODO_ITEM_BG_COLORS[0].value).toBeUndefined();
    expect(TODO_ITEM_BG_COLORS[0].label).toBe("デフォルト");
  });

  it("全エントリに空でない label が存在する", () => {
    for (const entry of TODO_ITEM_BG_COLORS) {
      expect(typeof entry.label).toBe("string");
      expect(entry.label.length).toBeGreaterThan(0);
    }
  });

  it("全エントリに空でない class が存在する", () => {
    for (const entry of TODO_ITEM_BG_COLORS) {
      expect(typeof entry.class).toBe("string");
      expect(entry.class.length).toBeGreaterThan(0);
    }
  });

  it("全エントリの class にダークモード用クラスが含まれる", () => {
    for (const entry of TODO_ITEM_BG_COLORS) {
      expect(entry.class).toContain("dark:");
    }
  });

  it("デフォルト以外の全エントリの value は 'bg-' で始まる文字列である", () => {
    for (const entry of TODO_ITEM_BG_COLORS.slice(1)) {
      expect(typeof entry.value).toBe("string");
      expect(entry.value).toMatch(/^bg-/);
    }
  });

  it("デフォルト以外の全エントリで class の先頭部分が value と一致する", () => {
    for (const entry of TODO_ITEM_BG_COLORS.slice(1)) {
      // value が "bg-red-50" なら class は "bg-red-50 dark:..." のように始まる
      expect(entry.class).toMatch(new RegExp(`^${entry.value}\\s`));
    }
  });

  it("label の重複がない", () => {
    const labels = TODO_ITEM_BG_COLORS.map((e) => e.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("value の重複がない（undefined は 1 つだけ）", () => {
    const values = TODO_ITEM_BG_COLORS.map((e) => e.value);
    expect(new Set(values).size).toBe(values.length);
  });
});

// ── getTodoItemBgClass テスト ────────────────────────────────────────────────

describe("getTodoItemBgClass", () => {
  it("undefined を渡すとデフォルトクラスを返す", () => {
    expect(getTodoItemBgClass(undefined)).toBe("bg-white dark:bg-gray-700");
  });

  it("引数なしでもデフォルトクラスを返す", () => {
    expect(getTodoItemBgClass()).toBe("bg-white dark:bg-gray-700");
  });

  it("空文字を渡すとデフォルトクラスにフォールバックする", () => {
    expect(getTodoItemBgClass("" as never)).toBe("bg-white dark:bg-gray-700");
  });

  it("未定義の色値はデフォルトクラスにフォールバックする", () => {
    expect(getTodoItemBgClass("bg-unknown-999" as never)).toBe(
      "bg-white dark:bg-gray-700",
    );
  });

  it("TODO_ITEM_BG_COLORS の各エントリで value → class の対応が正しい", () => {
    for (const entry of TODO_ITEM_BG_COLORS) {
      expect(getTodoItemBgClass(entry.value)).toBe(entry.class);
    }
  });

  it("各色値に対応したクラスを個別に返す", () => {
    const cases: Array<[TodoItemBgColorValue, string]> = [
      ["bg-red-50", "bg-red-50 dark:bg-red-900"],
      ["bg-orange-50", "bg-orange-50 dark:bg-orange-900"],
      ["bg-yellow-50", "bg-yellow-50 dark:bg-yellow-900"],
      ["bg-green-50", "bg-green-50 dark:bg-green-900"],
      ["bg-blue-50", "bg-blue-50 dark:bg-blue-900"],
      ["bg-purple-50", "bg-purple-50 dark:bg-purple-900"],
      ["bg-pink-50", "bg-pink-50 dark:bg-pink-900"],
    ];

    for (const [value, expected] of cases) {
      expect(getTodoItemBgClass(value)).toBe(expected);
    }
  });

  it("戻り値は常にダークモード用クラスを含む", () => {
    for (const entry of TODO_ITEM_BG_COLORS) {
      expect(getTodoItemBgClass(entry.value)).toContain("dark:");
    }
  });
});
