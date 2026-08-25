import { normalizeCoreSyncData } from "../sync/syncDataNormalizer";
import { routineFixture } from "./sync.test.fixtures";
import * as routineStorage from "@/features/routine/storage";
import * as settingsStorage from "@/features/settings/storage";
import * as pomodoroStorage from "@/features/pomodoro/storage";
import * as workTrackerStorage from "@/features/work-tracker/storage";
import * as weightTrackerStorage from "@/features/weight-tracker/storage";
import * as workoutTrackerStorage from "@/features/workout-tracker/storage";
import * as journalStorage from "@/features/journal/storage";
import * as mealStorage from "@/features/meal/storage";
import * as presetStorage from "@/features/preset/storage";

jest.mock("@/features/routine/storage");
jest.mock("@/features/settings/storage");
jest.mock("@/features/pomodoro/storage");
jest.mock("@/features/work-tracker/storage");
jest.mock("@/features/weight-tracker/storage");
jest.mock("@/features/workout-tracker/storage");
jest.mock("@/features/journal/storage");
jest.mock("@/features/meal/storage");
jest.mock("@/features/preset/storage");

const LOCAL = {
  routines: [{ id: "local-r1" }],
  dailyHistory: { "2026-02-12": { date: "2026-02-12" } },
  settings: { theme: "dark" },
  pomodoroHistory: { "2026-02-12": { completedPomodoros: 3 } },
  workSessionHistory: { "2026-02-12": [{ id: "local-s1" }] },
  workTemplates: [{ id: "local-t1" }],
  weightHistory: { "2026-02-12": { weight: 60 } },
  workoutRecordHistory: { "2026-02-12": [{ id: "local-w1" }] },
  journalHistory: { "2026-02-12": [{ id: "local-j1" }] },
  mealHistory: { "2026-02-12": [{ id: "local-m1" }] },
  presets: [{ id: "local-p1" }],
};

const mockLocalStorageValues = (): void => {
  (routineStorage.getRoutines as jest.Mock).mockReturnValue(LOCAL.routines);
  (routineStorage.getMonthlyHistory as jest.Mock).mockReturnValue(
    LOCAL.dailyHistory,
  );
  (settingsStorage.getSettings as jest.Mock).mockReturnValue(LOCAL.settings);
  (pomodoroStorage.getPomodoroHistory as jest.Mock).mockReturnValue(
    LOCAL.pomodoroHistory,
  );
  (workTrackerStorage.getWorkSessionHistory as jest.Mock).mockReturnValue(
    LOCAL.workSessionHistory,
  );
  (workTrackerStorage.getWorkTemplates as jest.Mock).mockReturnValue(
    LOCAL.workTemplates,
  );
  (weightTrackerStorage.getWeightHistory as jest.Mock).mockReturnValue(
    LOCAL.weightHistory,
  );
  (workoutTrackerStorage.getWorkoutRecordHistory as jest.Mock).mockReturnValue(
    LOCAL.workoutRecordHistory,
  );
  (journalStorage.getJournalHistory as jest.Mock).mockReturnValue(
    LOCAL.journalHistory,
  );
  (mealStorage.getMealHistory as jest.Mock).mockReturnValue(LOCAL.mealHistory);
  (presetStorage.getPresets as jest.Mock).mockReturnValue(LOCAL.presets);
};

describe("normalizeCoreSyncData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorageValues();
  });

  it("全フィールドが欠損している場合はすべてローカルの値を返す", () => {
    // リモートに項目が存在しないのは、その機能を知らない古いバージョンの端末が
    // アップロードした場合がある。空で上書きするとローカルデータが消えてしまう。
    expect(normalizeCoreSyncData({})).toEqual(LOCAL);
  });

  it("リモートに値があればその値を採用し、指定のないフィールドはローカルを維持する", () => {
    const remoteRoutines = [routineFixture];

    const result = normalizeCoreSyncData({ routines: remoteRoutines });

    expect(result.routines).toEqual(remoteRoutines);
    expect(result.journalHistory).toEqual(LOCAL.journalHistory);
    expect(result.presets).toEqual(LOCAL.presets);
  });

  it("明示的な空配列/空オブジェクトはそのまま採用する（ユーザーが全削除した結果を尊重する）", () => {
    const result = normalizeCoreSyncData({
      routines: [],
      presets: [],
      journalHistory: {},
      workoutRecordHistory: {},
    });

    expect(result.routines).toEqual([]);
    expect(result.presets).toEqual([]);
    expect(result.journalHistory).toEqual({});
    expect(result.workoutRecordHistory).toEqual({});
  });

  describe("settings", () => {
    // settingsは単一オブジェクトの中に独立した設定項目が時期をずらして
    // 追加されていくため、丸ごと置き換えると古いバージョンが送ったsettingsで
    // 新しい設定項目のユーザー値が失われる。
    it("リモートに存在しない設定項目はローカルの値を維持する", () => {
      (settingsStorage.getSettings as jest.Mock).mockReturnValue({
        theme: "dark",
        backgroundRefreshIntervalMinutes: 60,
      });

      const result = normalizeCoreSyncData({
        settings: { theme: "light" } as never,
      });

      expect(result.settings).toEqual({
        theme: "light",
        backgroundRefreshIntervalMinutes: 60,
      });
    });

    it("リモートに存在する設定項目はリモートの値を採用する", () => {
      (settingsStorage.getSettings as jest.Mock).mockReturnValue({
        theme: "dark",
        defaultDurationMinutes: 30,
      });

      const result = normalizeCoreSyncData({
        settings: { theme: "light", defaultDurationMinutes: 45 } as never,
      });

      expect(result.settings).toEqual({
        theme: "light",
        defaultDurationMinutes: 45,
      });
    });

    it("settings自体が欠損していればローカルの値を維持する", () => {
      expect(normalizeCoreSyncData({}).settings).toEqual(LOCAL.settings);
    });

    it("visibleFeaturesはキー単位でマージし、リモートに無いキーのローカル値を消さない", () => {
      // visibleFeaturesはネストしたオブジェクトの中に機能フラグが時期をずらして
      // 追加されていく。トップレベルのシャローマージだけだと、リモートが一部
      // キーのみ持つ場合にネスト全体が置き換わり、ローカル側の未知キーが消える。
      (settingsStorage.getSettings as jest.Mock).mockReturnValue({
        theme: "dark",
        visibleFeatures: { journal: true, budget: false },
      });

      const result = normalizeCoreSyncData({
        settings: {
          theme: "light",
          visibleFeatures: { journal: false },
        } as never,
      });

      expect(result.settings.visibleFeatures).toEqual({
        journal: false,
        budget: false,
      });
    });

    it("trainDelayはキー単位でマージし、リモートに無いキーのローカル値を消さない", () => {
      (settingsStorage.getSettings as jest.Mock).mockReturnValue({
        theme: "dark",
        trainDelay: { enabled: true, monitoredLines: [{ lineId: "l1" }] },
      });

      const result = normalizeCoreSyncData({
        settings: { theme: "light", trainDelay: { enabled: false } } as never,
      });

      expect(result.settings.trainDelay).toEqual({
        enabled: false,
        monitoredLines: [{ lineId: "l1" }],
      });
    });

    it("visibleFeatures/trainDelayがリモートに存在しなければローカルの値を維持する", () => {
      (settingsStorage.getSettings as jest.Mock).mockReturnValue({
        theme: "dark",
        visibleFeatures: { journal: true },
        trainDelay: { enabled: true, monitoredLines: [] },
      });

      const result = normalizeCoreSyncData({
        settings: { theme: "light" } as never,
      });

      expect(result.settings.visibleFeatures).toEqual({ journal: true });
      expect(result.settings.trainDelay).toEqual({
        enabled: true,
        monitoredLines: [],
      });
    });
  });

  it("ストレージへの書き込みは行わない（正規化のみを担う）", () => {
    normalizeCoreSyncData({});

    expect(routineStorage.saveRoutines).not.toHaveBeenCalled();
    expect(presetStorage.savePresets).not.toHaveBeenCalled();
    expect(journalStorage.saveJournalHistory).not.toHaveBeenCalled();
  });
});
