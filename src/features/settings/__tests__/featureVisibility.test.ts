import { getInitialVisibleFeatures } from "../state/featureVisibility";

const STORAGE_KEY_SETTINGS = "app-settings";

describe("getInitialVisibleFeatures", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("保存済みの設定に weeklyLog が無ければ true になる（古い設定との互換）", () => {
    localStorage.setItem(
      STORAGE_KEY_SETTINGS,
      JSON.stringify({ visibleFeatures: { journal: false } }),
    );

    const result = getInitialVisibleFeatures();

    expect(result.weeklyLog).toBe(true);
    expect(result.journal).toBe(false);
  });

  it("weeklyLog が false で保存されていれば false になり、journal には影響しない", () => {
    localStorage.setItem(
      STORAGE_KEY_SETTINGS,
      JSON.stringify({ visibleFeatures: { weeklyLog: false } }),
    );

    const result = getInitialVisibleFeatures();

    expect(result.weeklyLog).toBe(false);
    expect(result.journal).toBe(true);
  });

  it("保存済みの設定が無い（新規の利用者）ときは weeklyLog が true になる", () => {
    expect(getInitialVisibleFeatures().weeklyLog).toBe(true);
  });
});
