// storybook/test は Jest 環境では解決できないためモックする
jest.mock("storybook/test", () => ({
  fn: jest.fn(() => jest.fn()),
}));

import {
  createBaseView,
  sortedDaysAndHoliday,
  baseDisplay,
  sampleTrainDelay,
} from "../__fixtures__/homeStoryFixtures";

describe("createBaseView", () => {
  it("呼び出しごとに独立した fn() インスタンスを返す", () => {
    const view1 = createBaseView();
    const view2 = createBaseView();
    expect(view1.toggleEditModeAction).not.toBe(view2.toggleEditModeAction);
    expect(view1.setViewModeAction).not.toBe(view2.setViewModeAction);
    expect(view1.setFilterCategoryAction).not.toBe(view2.setFilterCategoryAction);
  });

  it("HomeToolbarProps['view'] の必須プロパティを全て持つ", () => {
    const view = createBaseView();
    expect(view).toHaveProperty("currentDate");
    expect(view).toHaveProperty("isTodayHoliday");
    expect(view).toHaveProperty("isEditMode");
    expect(view).toHaveProperty("viewMode");
    expect(view).toHaveProperty("filterCategory");
    expect(view).toHaveProperty("sortedDaysAndHoliday");
    expect(view).toHaveProperty("toggleEditModeAction");
    expect(view).toHaveProperty("setViewModeAction");
    expect(view).toHaveProperty("setFilterCategoryAction");
  });

  it("デフォルト値が正しく設定されている", () => {
    const view = createBaseView();
    expect(view.isTodayHoliday).toBe(false);
    expect(view.isEditMode).toBe(false);
    expect(view.filterCategory).toBe("all");
    expect(view.viewMode).toBe(6);
  });
});

describe("sortedDaysAndHoliday", () => {
  it("8要素（曜日7つ + holiday）を含む", () => {
    expect(sortedDaysAndHoliday).toHaveLength(8);
  });

  it("'holiday' 文字列を1つ含む", () => {
    expect(sortedDaysAndHoliday.filter((d) => d === "holiday")).toHaveLength(1);
  });

  it("曜日オブジェクトの value が 0〜6 の範囲内である", () => {
    sortedDaysAndHoliday
      .filter((d): d is { value: number; label: string } => d !== "holiday")
      .forEach((d) => {
        expect(d.value).toBeGreaterThanOrEqual(0);
        expect(d.value).toBeLessThanOrEqual(6);
      });
  });

  it("曜日の value が重複なく一意である", () => {
    const dayValues = sortedDaysAndHoliday
      .filter((d): d is { value: number; label: string } => d !== "holiday")
      .map((d) => d.value);
    expect(new Set(dayValues).size).toBe(dayValues.length);
  });

  it("曜日オブジェクトの label が空でない文字列である", () => {
    sortedDaysAndHoliday
      .filter((d): d is { value: number; label: string } => d !== "holiday")
      .forEach((d) => {
        expect(typeof d.label).toBe("string");
        expect(d.label.length).toBeGreaterThan(0);
      });
  });
});

describe("sampleTrainDelay", () => {
  it("lineId, lineName, company, delayMinutes, lastUpdated を持つ", () => {
    expect(sampleTrainDelay).toHaveProperty("lineId");
    expect(sampleTrainDelay).toHaveProperty("lineName");
    expect(sampleTrainDelay).toHaveProperty("company");
    expect(sampleTrainDelay).toHaveProperty("delayMinutes");
    expect(sampleTrainDelay).toHaveProperty("lastUpdated");
  });

  it("delayMinutes が正の数である", () => {
    expect(sampleTrainDelay.delayMinutes).toBeGreaterThan(0);
  });

  it("lastUpdated が ISO 8601 形式である", () => {
    expect(sampleTrainDelay.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });
});

describe("baseDisplay", () => {
  it("progressPercentage が completedMinutes / totalMinutes と一致する", () => {
    const expected = Math.round((baseDisplay.completedMinutes / baseDisplay.totalMinutes) * 100);
    expect(baseDisplay.progressPercentage).toBe(expected);
  });

  it("completedMinutes が totalMinutes 以下である", () => {
    expect(baseDisplay.completedMinutes).toBeLessThanOrEqual(baseDisplay.totalMinutes);
  });
});
