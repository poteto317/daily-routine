import {
  SWIPE_ACTION_OPTIONS,
  THEME_OPTIONS,
  getUpdatedSettingsForSwipeAction,
} from "../helpers/appearance";
import {
  BACKGROUND_REFRESH_FIELD,
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
      weeklyLog: true,
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

  it("定期リフレッシュ間隔の表示名と説明文が、実際の動作（表示中の間隔。復帰時はすぐ再評価）を説明している", () => {
    // 期待値は定数を参照せず、文字列をそのまま書く（定数を変えたときにテストが気づけるようにする）
    expect(BACKGROUND_REFRESH_FIELD).toEqual({
      label: "表示中の定期リフレッシュ間隔（分）",
      description:
        "アプリを表示したままのときに、ルーティンの背景色（経過色）を再評価する間隔です。バックグラウンドから戻したときは、この値に関係なくすぐに再評価します。0を設定すると定期的な再評価は行われません。",
      min: 0,
      max: 60,
      errorText: "0～60分の範囲で入力してください（0で定期更新なし）",
      hint: "推奨: 30分",
    });

    // 以前の誤解を招く言い回し（復帰してから待つ、と読める表現）が残っていない
    expect(BACKGROUND_REFRESH_FIELD.label).not.toContain(
      "バックグラウンド復帰",
    );
    expect(BACKGROUND_REFRESH_FIELD.description).not.toContain("最大待機時間");
  });
});
