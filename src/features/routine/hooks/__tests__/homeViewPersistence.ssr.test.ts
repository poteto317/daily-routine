/**
 * @jest-environment node
 */
import {
  getStoredFilterCategory,
  getStoredIsEditMode,
  getStoredViewMode,
  saveFilterCategory,
  saveIsEditMode,
  saveViewMode,
} from "../homeViewPersistence";

describe("homeViewPersistence（window が無い環境）", () => {
  it("window が無ければ localStorage に触れず既定値を返す", () => {
    expect(typeof window).toBe("undefined");

    expect(getStoredFilterCategory()).toBe("all");
    expect(getStoredViewMode(false, 3)).toBe(3);
    expect(getStoredIsEditMode()).toBe(true);
  });

  it("window が無ければ祝日でも当日曜日を返す", () => {
    // 現状: canUseStorage の判定が祝日の判定より先なので holiday にならない
    expect(getStoredViewMode(true, 3)).toBe(3);
  });

  it("window が無ければ保存は何もせず例外も出さない", () => {
    expect(() => {
      saveFilterCategory("health");
      saveViewMode(2);
      saveIsEditMode(false);
    }).not.toThrow();
  });
});
