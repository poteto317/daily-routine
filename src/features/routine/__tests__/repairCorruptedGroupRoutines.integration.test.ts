/**
 * グループルーティンデータ修復の統合テスト
 *
 * repairCorruptedGroupRoutines による汚染データ・爆発データの修復を検証する。
 */
import {
  saveRoutines,
} from "@/features/routine/storage";
import { initializeRoutineState } from "../hooks/routineLifecycleState";
import { setCurrentUserId } from "@/lib/storage/core";
import type { Routine } from "@/types/routine";

// localStorage mock
const mockStorage = new Map<string, string>();
let originalLocalStorage: Storage;

beforeAll(() => {
  originalLocalStorage = window.localStorage;
  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: (key: string) => mockStorage.get(key) ?? null,
      setItem: (key: string, value: string) => mockStorage.set(key, value),
      removeItem: (key: string) => mockStorage.delete(key),
      clear: () => mockStorage.clear(),
      get length() {
        return mockStorage.size;
      },
      key: (index: number) => [...mockStorage.keys()][index] ?? null,
    },
    writable: true,
  });
});

afterAll(() => {
  Object.defineProperty(window, "localStorage", {
    value: originalLocalStorage,
    writable: true,
  });
});

beforeEach(() => {
  mockStorage.clear();
  setCurrentUserId(null);
});

// テスト用グループルーティンを作成
const createGroupRoutines = (overrides?: Partial<Routine>): Routine[] => {
  const now = new Date().toISOString();
  const groupId = "test-group-1";
  return [
    {
      id: "r-mon",
      title: "Morning Exercise",
      category: "health",
      daysOfWeek: [1],
      startTime: "07:00",
      duration: 30,
      sortOrder: 0,
      isCompleted: false,
      groupId,
      createdAt: now,
      updatedAt: now,
      ...overrides,
    },
    {
      id: "r-wed",
      title: "Morning Exercise",
      category: "health",
      daysOfWeek: [3],
      startTime: "07:00",
      duration: 30,
      sortOrder: 1,
      isCompleted: false,
      groupId,
      createdAt: now,
      updatedAt: now,
      ...overrides,
    },
    {
      id: "r-fri",
      title: "Morning Exercise",
      category: "health",
      daysOfWeek: [5],
      startTime: "07:00",
      duration: 30,
      sortOrder: 2,
      isCompleted: false,
      groupId,
      createdAt: now,
      updatedAt: now,
      ...overrides,
    },
  ];
};

describe("グループルーティンデータ修復テスト", () => {
  it("汚染されたデータ（daysOfWeek が全メンバーで同一化）でも repairCorruptedGroupRoutines で修復される", () => {
    // 汚染データ：全メンバーの daysOfWeek が [1, 3, 5] に上書きされた状態
    const contaminatedRoutines: Routine[] = createGroupRoutines().map(
      (r) => ({
        ...r,
        daysOfWeek: [1, 3, 5],
      }),
    );
    saveRoutines(contaminatedRoutines);

    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(
      "daily-progress",
      JSON.stringify({
        date: today,
        completedRoutineIds: [],
        lastResetTime: new Date().toISOString(),
      }),
    );

    const repairedState = initializeRoutineState();

    // 修復後、3 曜日にそれぞれ 1 エントリずつ存在すること
    const group = repairedState.filter(
      (r) => r.groupId === "test-group-1",
    );
    const days = group.flatMap((r) => r.daysOfWeek).sort();
    expect(days).toEqual([1, 3, 5]);
    expect(group).toHaveLength(3);

    // 各エントリが単一曜日であること
    for (const member of group) {
      expect(member.daysOfWeek).toHaveLength(1);
    }
  });

  it("爆発データ（重複エントリ）でも repairCorruptedGroupRoutines で修復される", () => {
    // 爆発データ：各曜日に 3 エントリずつ（合計 9 エントリ）
    const now = new Date().toISOString();
    const explodedRoutines: Routine[] = [];
    for (let copy = 0; copy < 3; copy++) {
      for (const day of [1, 3, 5]) {
        explodedRoutines.push({
          id: `r-${day}-${copy}`,
          title: "Morning Exercise",
          category: "health",
          daysOfWeek: [day],
          startTime: "07:00",
          duration: 30,
          sortOrder: explodedRoutines.length,
          isCompleted: false,
          groupId: "test-group-1",
          createdAt: now,
          updatedAt: now,
        });
      }
    }
    saveRoutines(explodedRoutines);

    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(
      "daily-progress",
      JSON.stringify({
        date: today,
        completedRoutineIds: [],
        lastResetTime: new Date().toISOString(),
      }),
    );

    const repairedState = initializeRoutineState();

    // 修復後、各曜日 1 エントリで合計 3 エントリ
    const group = repairedState.filter(
      (r) => r.groupId === "test-group-1",
    );
    expect(group).toHaveLength(3);
    const days = group.flatMap((r) => r.daysOfWeek).sort();
    expect(days).toEqual([1, 3, 5]);
  });

  it("全メンバーが汚染されているケースでは既存メンバーの ID が再利用される", () => {
    // 汚染データ：3 メンバーが全て daysOfWeek: [1, 3, 5] を持つ
    const contaminatedRoutines: Routine[] = createGroupRoutines().map((r) => ({
      ...r,
      daysOfWeek: [1, 3, 5],
    }));
    const originalIds = contaminatedRoutines.map((r) => r.id);
    saveRoutines(contaminatedRoutines);

    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(
      "daily-progress",
      JSON.stringify({
        date: today,
        completedRoutineIds: [],
        lastResetTime: new Date().toISOString(),
      }),
    );

    const repairedState = initializeRoutineState();
    const group = repairedState.filter((r) => r.groupId === "test-group-1");

    // 修復後の ID が元のメンバー ID を含むこと（新規 UUID だけにならない）
    const repairedIds = group.map((r) => r.id);
    const reusedCount = repairedIds.filter((id) => originalIds.includes(id)).length;
    expect(reusedCount).toBeGreaterThan(0);

    // 修復後のエントリ数と曜日が正しいこと
    expect(group).toHaveLength(3);
    const days = group.flatMap((r) => r.daysOfWeek).sort();
    expect(days).toEqual([1, 3, 5]);
    for (const member of group) {
      expect(member.daysOfWeek).toHaveLength(1);
    }
  });
});
