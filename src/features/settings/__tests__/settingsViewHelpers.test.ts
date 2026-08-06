import {
  SWIPE_ACTION_OPTIONS,
  THEME_OPTIONS,
  getUpdatedSettingsForSwipeAction,
} from "../helpers/appearance";
import {
  DEFAULT_DURATION_FIELD,
  DEFAULT_NOTIFICATION_FIELD,
  POMODORO_FIELDS,
} from "../helpers/defaultAndPomodoro";
import {
  FEATURE_VISIBILITY_ITEMS,
  getFeatureThumbClassName,
  getFeatureToggleClassName,
  getUpdatedVisibleFeatures,
} from "../helpers/featureVisibility";
import {
  getLineOptionLabel,
  getMonitoredLinesCountLabel,
  getTrainDelayThumbClassName,
  getTrainDelayToggleClassName,
  isAddLineButtonDisabled,
} from "../helpers/trainDelay";
import type { VisibleFeaturesState } from "../state/featureVisibility";

describe("settings view helpers", () => {
  it("visibility toggle と class 名を返す", () => {
    const visibleFeatures: VisibleFeaturesState = {
      budget: true,
      weather: false,
      statistics: true,
      calendar: true,
      meal: false,
      weightTracker: false,
      workoutTracker: false,
      worktracker: true,
      pomodoro: true,
      journal: true,
      preset: true,
      syncManagement: false,
      testMatrix: false,
      todoLists: true,
      accountAdmin: false,
    };

    expect(getUpdatedVisibleFeatures(visibleFeatures, "weather")).toEqual({
      ...visibleFeatures,
      weather: true,
    });
    expect(getFeatureToggleClassName(true)).toContain("bg-blue-600");
    expect(getFeatureThumbClassName(false)).toContain("translate-x-1");
    expect(FEATURE_VISIBILITY_ITEMS.length).toBeGreaterThan(0);
  });

  it("appearance と field 定義を保持する", () => {
    expect(THEME_OPTIONS.map((option) => option.value)).toEqual([
      "light",
      "dark",
      "auto",
    ]);
    expect(SWIPE_ACTION_OPTIONS.map((option) => option.value)).toEqual([
      "delete",
      "edit",
    ]);
    expect(
      getUpdatedSettingsForSwipeAction(
        {
          defaultDurationMinutes: 30,
          defaultNotificationMinutes: 0,
          theme: "auto",
          swipeAction: "delete",
          pomodoroFocusMinutes: 25,
          pomodoroBreakMinutes: 5,
        },
        "edit",
      ),
    ).toMatchObject({ swipeAction: "edit" });
    expect(DEFAULT_DURATION_FIELD.min).toBe(1);
    expect(DEFAULT_NOTIFICATION_FIELD.max).toBe(120);
    expect(POMODORO_FIELDS).toHaveLength(2);
  });

  it("train delay 表示 helper を返す", () => {
    expect(getMonitoredLinesCountLabel(2)).toBe("監視中の路線 (2)");
    expect(getTrainDelayToggleClassName(true)).toContain("bg-blue-600");
    expect(getTrainDelayThumbClassName(false)).toContain("translate-x-1");
    expect(isAddLineButtonDisabled("")).toBe(true);
    expect(
      getLineOptionLabel({
        id: "yamanote",
        name: "山手線",
        company: "JR東日本",
      }),
    ).toBe("JR東日本 - 山手線");
  });
});
