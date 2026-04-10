import {
  EMPTY_TEMPLATE_STATS,
  formatNewWorkNameLabel,
  formatWorkSessionStatsSummary,
  formatWorkSessionTimeRange,
  getFilteredTemplates,
  getSessionCountLabel,
  getSessionHistoryMeta,
  getTemplateInsightCards,
  getTemplateStatsSummaryLabel,
  getTimerGradientClassName,
  getTimerStatusLabel,
  getTotalTimeToday,
  getTrendMessage,
  shouldShowTemplateDropdown,
} from "../page/helpers";
import {
  findMoodOption,
  isSessionImprovement,
  isSessionNewRecord,
} from "../page/sessionHistoryMeta";

const mockGetSessionsByTemplateId = jest.fn();
const mockGetTemplateStats = jest.fn();

jest.mock("@/lib/storage", () => ({
  getSessionsByTemplateId: (...args: unknown[]) =>
    mockGetSessionsByTemplateId(...args),
  getTemplateStats: (...args: unknown[]) => mockGetTemplateStats(...args),
}));

describe("work-tracker page helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("合計時間を計算できる", () => {
    expect(
      getTotalTimeToday([
        { id: "s1", duration: 120 },
        { id: "s2" },
        { id: "s3", duration: 30 },
      ] as never),
    ).toBe(150);
  });

  it("テンプレートを検索して最終利用順に最大5件返す", () => {
    const templates = [
      { id: "1", name: "設計", lastUsedAt: "2026-02-10T10:00:00.000Z" },
      { id: "2", name: "設計レビュー", lastUsedAt: "2026-02-12T10:00:00.000Z" },
      { id: "3", name: "調査", lastUsedAt: "2026-02-09T10:00:00.000Z" },
      { id: "4", name: "設計メモ", lastUsedAt: "2026-02-11T10:00:00.000Z" },
      { id: "5", name: "基本設計", lastUsedAt: "2026-02-08T10:00:00.000Z" },
      { id: "6", name: "詳細設計" },
      { id: "7", name: "実装" },
    ];

    expect(getFilteredTemplates(templates as never, "設計")).toEqual([
      expect.objectContaining({ id: "2" }),
      expect.objectContaining({ id: "4" }),
      expect.objectContaining({ id: "1" }),
      expect.objectContaining({ id: "5" }),
      expect.objectContaining({ id: "6" }),
    ]);
  });

  it("セッション履歴メタを組み立てる", () => {
    const session = {
      id: "s2",
      workTemplateId: "t1",
      mood: "good",
      duration: 90,
    };
    mockGetTemplateStats.mockReturnValue({
      count: 3,
      bestDuration: 90,
      averageDuration: 100,
    });
    mockGetSessionsByTemplateId.mockReturnValue([
      { id: "s1", duration: 120 },
      { id: "s2", duration: 90 },
    ]);

    expect(getSessionHistoryMeta(session as never)).toEqual(
      expect.objectContaining({
        moodOption: expect.objectContaining({ value: "good", emoji: "😊" }),
        stats: expect.objectContaining({ count: 3, bestDuration: 90 }),
        isImprovement: true,
        isNewRecord: true,
      }),
    );
  });

  it("セッション履歴メタの補助関数を判定できる", () => {
    const session = {
      id: "s1",
      mood: "tired",
      duration: 150,
    };

    expect(findMoodOption("tired")).toEqual(
      expect.objectContaining({ emoji: "😮‍💨", label: "疲れた" }),
    );
    expect(
      isSessionImprovement(
        session as never,
        [{ id: "s1", duration: 160 }] as never,
      ),
    ).toBe(false);
    expect(
      isSessionImprovement(
        { ...session, id: "s2" } as never,
        [
          { id: "s1", duration: 140 },
          { id: "s2", duration: 150 },
        ] as never,
      ),
    ).toBe(false);
    expect(
      isSessionImprovement(
        { ...session, id: "s3", duration: 130 } as never,
        [
          { id: "s1", duration: 140 },
          { id: "s3", duration: 130 },
        ] as never,
      ),
    ).toBe(true);
    expect(
      isSessionImprovement(
        { ...session, id: "s3", duration: undefined } as never,
        [{ id: "s1" }, { id: "s3", duration: undefined }] as never,
      ),
    ).toBe(true);
    expect(
      isSessionNewRecord(session as never, { count: 1, bestDuration: 150 }),
    ).toBe(false);
    expect(
      isSessionNewRecord({ ...session, duration: undefined } as never, {
        count: 2,
        bestDuration: 0,
      }),
    ).toBe(true);
  });

  it("時間範囲を整形できる", () => {
    expect(
      formatWorkSessionTimeRange(
        "2026-02-12T09:00:00.000+09:00",
        "2026-02-12T10:30:00.000+09:00",
      ),
    ).toBe("09:00 - 10:30");
    expect(formatWorkSessionTimeRange("2026-02-12T09:00:00.000+09:00")).toBe(
      "09:00",
    );
  });

  it("統計サマリー文言を整形できる", () => {
    expect(
      formatWorkSessionStatsSummary({
        bestDuration: "01:20",
        averageDuration: "01:40",
        count: 3,
      }),
    ).toBe("ベスト: 01:20 / 平均: 01:40 / 回数: 3回");
  });

  it("テンプレート入力関連のラベルを返す", () => {
    expect(shouldShowTemplateDropdown(true, "設計")).toBe(true);
    expect(shouldShowTemplateDropdown(true, "")).toBe(false);
    expect(getTemplateStatsSummaryLabel(4, "01:20")).toBe(
      "4回 | ベスト: 01:20",
    );
    expect(formatNewWorkNameLabel("新規作業")).toBe("「新規作業」");
  });

  it("タイマーとサマリーの文言を返す", () => {
    expect(getTimerStatusLabel(true)).toBe("⏱️ 作業中...");
    expect(getTimerStatusLabel(false)).toBe("⏸️ 停止中");
    expect(getTimerGradientClassName(true)).toBe("from-green-500 to-teal-500");
    expect(getTimerGradientClassName(false)).toBe(
      "from-blue-500 to-indigo-500",
    );
    expect(getSessionCountLabel(2)).toBe("2 セッション");
  });

  it("インサイトカードを構築できる", () => {
    const formatDuration = (seconds: number) => `${seconds}s`;
    expect(
      getTemplateInsightCards(
        {
          count: 2,
          averageDuration: 95.5,
          bestDuration: 80,
          latestDuration: 100,
          trend: "stable",
        },
        formatDuration,
      ),
    ).toEqual([
      expect.objectContaining({ id: "count", value: "2" }),
      expect.objectContaining({ id: "best", value: "80s" }),
      expect.objectContaining({ id: "average", value: "96s" }),
    ]);
  });

  it("トレンドメッセージを条件ごとに返す", () => {
    expect(
      getTrendMessage({
        stats: {
          ...EMPTY_TEMPLATE_STATS,
          trend: "improving",
          averageDuration: 120,
        },
        elapsedTime: 100,
      }),
    ).toEqual(
      expect.objectContaining({
        icon: "📈",
        message: "改善傾向！ベスト記録に近づいています",
      }),
    );

    expect(
      getTrendMessage({
        stats: {
          ...EMPTY_TEMPLATE_STATS,
          trend: "declining",
          averageDuration: 100,
          bestDuration: 80,
        },
        elapsedTime: 120,
      }),
    ).toEqual(
      expect.objectContaining({
        icon: "📉",
        message: "平均より時間がかかっています",
      }),
    );

    expect(
      getTrendMessage({
        stats: {
          ...EMPTY_TEMPLATE_STATS,
          trend: "stable",
          averageDuration: 100,
          bestDuration: 80,
        },
        elapsedTime: 70,
      }),
    ).toEqual(expect.objectContaining({ icon: "🎉", message: "新記録達成！" }));

    expect(
      getTrendMessage({
        stats: {
          ...EMPTY_TEMPLATE_STATS,
          trend: "declining",
          averageDuration: 100,
          bestDuration: 80,
        },
        elapsedTime: 90,
      }),
    ).toBeNull();
  });
});
