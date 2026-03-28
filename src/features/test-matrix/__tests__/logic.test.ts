import {
  calculateCategoryStats,
  calculateOverviewStats,
  isItemMatchedByFilter,
  resolveItemStatus,
  type DetailData,
} from "../matrixComputations";
import {
  getCollapseAllButtonLabel,
  getCollapseIcon,
  getDeviceTitleText,
  getStatusTitle,
  getTotalCasesLabel,
  getTotalItemsLabel,
} from "../helpers";
import {
  calculateStatusFromDetails,
  nextStatus,
  STATUS_DISPLAY,
} from "../statusHelpers";
import type { TestCategory, TestItem } from "../types";

const baseItem: TestItem = {
  id: "1-1",
  label: "ログイン",
  pc: "unchecked",
  sp: "unchecked",
  note: "",
};

const detailData: DetailData = {
  "1-2": [
    {
      id: "case-1",
      scenario: "正常系",
      expected: "成功する",
      pc: "ok",
      sp: "ng",
      note: "",
    },
  ],
};

describe("test matrix logic", () => {
  it("ステータスを循環させる", () => {
    expect(nextStatus("unchecked")).toBe("ok");
    expect(nextStatus("ok")).toBe("ng");
    expect(nextStatus("ng")).toBe("na");
    expect(nextStatus("na")).toBe("unchecked");
  });

  it("詳細ケースから集約ステータスを計算する", () => {
    expect(calculateStatusFromDetails([], "pc")).toBe("unchecked");
    expect(calculateStatusFromDetails(detailData["1-2"], "sp")).toBe("ng");
    expect(
      calculateStatusFromDetails(
        [
          { ...detailData["1-2"][0], id: "a", pc: "ok", sp: "ok" },
          { ...detailData["1-2"][0], id: "b", pc: "ok", sp: "ok" },
        ],
        "pc",
      ),
    ).toBe("ok");
    expect(
      calculateStatusFromDetails(
        [
          { ...detailData["1-2"][0], id: "a", pc: "na", sp: "na" },
          { ...detailData["1-2"][0], id: "b", pc: "na", sp: "na" },
        ],
        "pc",
      ),
    ).toBe("na");
  });

  it("アイテムの表示用ステータスを解決する", () => {
    expect(resolveItemStatus(baseItem, detailData)).toEqual({
      detailCases: [],
      hasDetail: false,
      pcStatus: "unchecked",
      spStatus: "unchecked",
    });

    expect(resolveItemStatus({ ...baseItem, id: "1-2" }, detailData)).toEqual(
      expect.objectContaining({
        hasDetail: true,
        pcStatus: "ok",
        spStatus: "ng",
      }),
    );
  });

  it("フィルター条件に一致するアイテムだけを判定する", () => {
    expect(isItemMatchedByFilter(baseItem, detailData, "all")).toBe(true);
    expect(isItemMatchedByFilter({ ...baseItem, id: "1-2" }, detailData, "ng")).toBe(
      true,
    );
    expect(isItemMatchedByFilter(baseItem, detailData, "ok")).toBe(false);
  });

  it("カテゴリと全体の集計値を計算する", () => {
    const category: TestCategory = {
      id: "auth",
      title: "認証",
      items: [baseItem, { ...baseItem, id: "1-2", pc: "ok", sp: "ok" }],
    };

    expect(calculateCategoryStats(category, detailData)).toEqual({
      okCount: 0,
      ngCount: 1,
      totalCount: 2,
    });

    expect(calculateOverviewStats([category], detailData)).toEqual({
      totalCount: 2,
      okCount: 0,
      ngCount: 1,
      uncheckedCount: 1,
      progressPct: 50,
    });
  });

  it("表示ラベル系ヘルパーを返す", () => {
    expect(getTotalCasesLabel(3)).toBe("/ 3 ケース");
    expect(getDeviceTitleText("PC", "OK")).toBe("PC: OK");
    expect(getCollapseIcon(true)).toBe("▶");
    expect(getStatusTitle("PC", "OK", true)).toContain("詳細画面から自動計算");
    expect(getCollapseAllButtonLabel(false)).toBe("📁 すべて折りたたみ");
    expect(getTotalItemsLabel(5)).toBe("/ 5 項目");
    expect(STATUS_DISPLAY.ok.label).toBe("OK");
  });
});
