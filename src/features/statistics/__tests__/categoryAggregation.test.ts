import { createHistory } from "./statisticsTestUtils";
import {
  accumulateCategoryHistory,
  aggregateCategoryHistory,
  buildCategoryStats,
  createCategoryStatsAccumulator,
} from "../statistics/categoryAggregation";

describe("categoryAggregation", () => {
  it("カテゴリ集計用の空アキュムレータを作る", () => {
    expect(createCategoryStatsAccumulator()).toEqual({});
  });

  it("1日分の履歴をカテゴリ単位で加算する", () => {
    const result = accumulateCategoryHistory(
      createCategoryStatsAccumulator(),
      createHistory({
        completedRoutineIds: ["1", "3"],
        routineSnapshots: [
          { id: "1", title: "朝活", category: "health", startTime: "07:00" },
          { id: "2", title: "散歩", category: "health", startTime: "08:00" },
          { id: "3", title: "読書", category: "study", startTime: "20:00" },
        ],
      }),
    );

    expect(result).toEqual({
      health: { completed: 1, total: 2 },
      study: { completed: 1, total: 1 },
    });
  });

  it("複数日の履歴を同じカテゴリへまとめる", () => {
    const result = aggregateCategoryHistory({
      "2024-01-10": createHistory({
        date: "2024-01-10",
        completedRoutineIds: ["1"],
        routineSnapshots: [
          { id: "1", title: "朝活", category: "health", startTime: "07:00" },
          { id: "2", title: "会議", category: "work", startTime: "09:00" },
        ],
      }),
      "2024-01-11": createHistory({
        date: "2024-01-11",
        completedRoutineIds: ["2", "3"],
        routineSnapshots: [
          { id: "2", title: "会議", category: "work", startTime: "09:00" },
          { id: "3", title: "勉強", category: "study", startTime: "21:00" },
        ],
      }),
    });

    expect(result).toEqual({
      health: { completed: 1, total: 1 },
      work: { completed: 1, total: 2 },
      study: { completed: 1, total: 1 },
    });
  });

  it("カテゴリ集計から表示用DTOを作る", () => {
    expect(
      buildCategoryStats({
        health: { completed: 3, total: 4 },
        work: { completed: 0, total: 0 },
      }),
    ).toEqual([
      {
        category: "health",
        completed: 3,
        total: 4,
        achievementRate: 75,
      },
      {
        category: "work",
        completed: 0,
        total: 0,
        achievementRate: 0,
      },
    ]);
  });
});
