/**
 * ルーティン起動時の初期化の結合テスト
 *
 * 保存済みデータ → 旧形式の移行・汚染データの修復 → 今日の完了状態の反映 → 保存
 * の流れを、本物の storage（jsdom の localStorage）を使って検証する。
 */
import {
  getDailyProgress,
  getRoutines,
  saveDailyProgress,
  saveRoutines,
} from "@/features/routine/storage";
import {
  getLocalDataUpdatedAt,
  getTodayString,
  setCurrentUserId,
} from "@/lib/storage/core";
import type { Routine } from "@/types/routine";
import { initializeRoutineStateWithMeta } from "../hooks/routineLifecycleState";

const CREATED_AT = "2026-02-13T00:00:00.000Z";

const makeRoutine = (overrides: Partial<Routine>): Routine => ({
  id: "r",
  title: "朝活",
  startTime: "07:00",
  duration: 30,
  category: "health",
  daysOfWeek: [1],
  isCompleted: false,
  sortOrder: 0,
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
  ...overrides,
});

const saveProgress = (date: string, completedRoutineIds: string[]) => {
  saveDailyProgress({
    date,
    completedRoutineIds,
    lastResetTime: `${date}T00:00:00.000Z`,
  });
};

const summarize = (routines: Routine[]) =>
  routines.map(({ id, groupId, daysOfWeek, isCompleted }) => ({
    id,
    groupId,
    daysOfWeek,
    isCompleted,
  }));

describe("ルーティン起動時の初期化の流れ", () => {
  let randomUuidSpy: jest.SpyInstance;
  let uuidCounter: number;

  beforeEach(() => {
    localStorage.clear();
    setCurrentUserId(null);
    uuidCounter = 0;
    randomUuidSpy = jest
      .spyOn(crypto, "randomUUID")
      .mockImplementation(
        () => `generated-${++uuidCounter}` as ReturnType<Crypto["randomUUID"]>,
      );
  });

  afterEach(() => {
    randomUuidSpy.mockRestore();
  });

  it("旧形式の複数曜日ルーティンを曜日ごとに分け、今日の完了状態を反映し、保存データには完了状態を残さない", () => {
    saveRoutines([
      makeRoutine({ id: "legacy", daysOfWeek: [1, 3, 5], isCompleted: true }),
    ]);
    saveProgress(getTodayString(), ["legacy"]);
    const updatedAtBefore = getLocalDataUpdatedAt();

    const result = initializeRoutineStateWithMeta();

    expect(result.didRepairOrMigrate).toBe(true);
    expect(summarize(result.routines)).toEqual([
      { id: "legacy", groupId: "legacy", daysOfWeek: [1], isCompleted: true },
      {
        id: "generated-1",
        groupId: "legacy",
        daysOfWeek: [3],
        isCompleted: false,
      },
      {
        id: "generated-2",
        groupId: "legacy",
        daysOfWeek: [5],
        isCompleted: false,
      },
    ]);
    // 保存し直したデータは完了状態を持たない（完了状態は daily-progress 側で管理する）
    expect(getRoutines().map((routine) => routine.isCompleted)).toEqual([
      false,
      false,
      false,
    ]);
    // 移行・修復はユーザー操作ではないため、ローカルの更新時刻は変えない
    // （呼び出し元が didRepairOrMigrate を見て必要なら更新する）
    expect(getLocalDataUpdatedAt()).toBe(updatedAtBefore);
  });

  it("2 回目の起動では移行・修復を行わず、同じ状態を返す", () => {
    saveRoutines([makeRoutine({ id: "legacy", daysOfWeek: [1, 3] })]);
    saveProgress(getTodayString(), ["legacy"]);

    const first = initializeRoutineStateWithMeta();
    const storedAfterFirst = localStorage.getItem("daily-routines");
    const second = initializeRoutineStateWithMeta();

    expect(second.didRepairOrMigrate).toBe(false);
    expect(second.routines).toEqual(first.routines);
    expect(localStorage.getItem("daily-routines")).toBe(storedAfterFirst);
  });

  it("同じ曜日が重複したグループは、今日完了済みのメンバーを残して完了表示のまま返す", () => {
    saveRoutines([
      makeRoutine({ id: "mon-1", groupId: "g", sortOrder: 0 }),
      makeRoutine({ id: "mon-2", groupId: "g", sortOrder: 1 }),
      makeRoutine({ id: "wed", groupId: "g", daysOfWeek: [3], sortOrder: 2 }),
    ]);
    saveProgress(getTodayString(), ["mon-2"]);

    const result = initializeRoutineStateWithMeta();

    expect(result.didRepairOrMigrate).toBe(true);
    expect(summarize(result.routines)).toEqual([
      { id: "mon-2", groupId: "g", daysOfWeek: [1], isCompleted: true },
      { id: "wed", groupId: "g", daysOfWeek: [3], isCompleted: false },
    ]);
    expect(getRoutines().map((routine) => routine.id)).toEqual([
      "mon-2",
      "wed",
    ]);
    // 今日の進捗はそのまま残る
    expect(getDailyProgress()?.completedRoutineIds).toEqual(["mon-2"]);
  });

  it("進捗が前日のものなら完了済みを優先せず、進捗を今日の空の状態にリセットする", () => {
    saveRoutines([
      makeRoutine({ id: "mon-1", groupId: "g", sortOrder: 0 }),
      makeRoutine({ id: "mon-2", groupId: "g", sortOrder: 1 }),
    ]);
    saveProgress("2000-01-01", ["mon-2"]);

    const result = initializeRoutineStateWithMeta();

    expect(summarize(result.routines)).toEqual([
      { id: "mon-1", groupId: "g", daysOfWeek: [1], isCompleted: false },
    ]);
    expect(getDailyProgress()).toMatchObject({
      date: getTodayString(),
      completedRoutineIds: [],
    });
  });

  it("ログイン中のユーザーのキーだけを読み書きし、他のユーザーのデータには触れない", () => {
    setCurrentUserId("user-2");
    saveRoutines([makeRoutine({ id: "other-user", daysOfWeek: [1, 2] })]);
    setCurrentUserId("user-1");
    saveRoutines([makeRoutine({ id: "mine", daysOfWeek: [1, 2] })]);
    const otherUserStored = localStorage.getItem("user:user-2:daily-routines");

    const result = initializeRoutineStateWithMeta();

    expect(result.routines.map((routine) => routine.groupId)).toEqual([
      "mine",
      "mine",
    ]);
    expect(localStorage.getItem("user:user-2:daily-routines")).toBe(
      otherUserStored,
    );
  });
});
