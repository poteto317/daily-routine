import { buildInitialData } from "../initialData";

describe("buildInitialData", () => {
  it("テストマトリクスの初期データを返す", () => {
    const data = buildInitialData();

    expect(data.length).toBeGreaterThan(10);
    expect(data[0]).toEqual(
      expect.objectContaining({
        id: "auth",
        title: expect.stringContaining("認証"),
        items: expect.any(Array),
      }),
    );
    expect(data.every((category) => category.items.length > 0)).toBe(true);
    expect(data.find((category) => category.id === "budget")).toEqual(
      expect.objectContaining({
        badge: { text: "実装済", color: "bg-green-500" },
      }),
    );
    expect(data.find((category) => category.id === "journal")).toEqual(
      expect.objectContaining({
        badge: { text: "実装済", color: "bg-green-500" },
      }),
    );
    expect(
      data
        .flatMap((category) => category.items)
        .every((item) => {
          return (
            typeof item.id === "string" &&
            typeof item.label === "string" &&
            item.pc === "unchecked" &&
            item.sp === "unchecked" &&
            item.note === ""
          );
        }),
    ).toBe(true);
  });

  it("業務日誌はジャーナルのカテゴリから独立し、項目 ID は 27-1〜27-3 になる", () => {
    const data = buildInitialData();
    const journalItemIds = data
      .find((category) => category.id === "journal")
      ?.items.map((item) => item.id);

    expect(journalItemIds).toEqual(["3-1", "3-2", "3-3", "3-4", "3-5", "3-6"]);

    const weeklyLog = data.find((category) => category.id === "weekly-log");

    expect(weeklyLog).toEqual(
      expect.objectContaining({
        title: "27. 業務日誌（Weekly Log）",
        badge: { text: "実装済", color: "bg-green-500" },
      }),
    );
    expect(weeklyLog?.items.map((item) => item.id)).toEqual([
      "27-1",
      "27-2",
      "27-3",
    ]);
  });

  it("項目 ID はカテゴリをまたいで重複しない", () => {
    const itemIds = buildInitialData().flatMap((category) =>
      category.items.map((item) => item.id),
    );

    expect(new Set(itemIds).size).toBe(itemIds.length);
  });
});
