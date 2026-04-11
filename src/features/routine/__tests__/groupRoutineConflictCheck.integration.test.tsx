import { renderHook, act } from "@testing-library/react";
import type { Routine } from "@/types/routine";

// useRoutineFormSourceData だけをモック（LocalStorage層）
// hasTimeConflict, computeConflictCheckDays, useRoutineConflictInfo は非モック
jest.mock("../components/useRoutineFormSourceData", () => ({
  useRoutineFormSourceData: jest.fn(),
}));

import { useRoutineFormSourceData } from "../components/useRoutineFormSourceData";
import { useRoutineFormState } from "../components/useRoutineFormState";

const baseRoutine = (
  overrides: Partial<Routine> & { id: string },
): Routine => ({
  title: "運動",
  startTime: "07:00",
  duration: 30,
  category: "health",
  daysOfWeek: [1],
  isCompleted: false,
  description: "",
  sortOrder: 0,
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
  ...overrides,
});

/**
 * グループルーティン(月水金) + 水曜の非グループルーティン(同時間帯) のセットアップ
 *
 * 期待: 水曜の非グループルーティンはグループ編集時の重複チェックに引っ掛からない
 * （既に共存しているため）
 */
const createTestRoutines = () => {
  const groupRoutines: Routine[] = [
    baseRoutine({ id: "r1", groupId: "g1", daysOfWeek: [1] }),
    baseRoutine({ id: "r2", groupId: "g1", daysOfWeek: [3] }),
    baseRoutine({ id: "r3", groupId: "g1", daysOfWeek: [5] }),
  ];

  // 水曜に同時間帯の非グループルーティン
  const conflictingOnWed = baseRoutine({
    id: "r4",
    groupId: undefined,
    title: "朝食",
    startTime: "07:00",
    duration: 15,
    daysOfWeek: [3],
  });

  return { groupRoutines, conflictingOnWed };
};

const setupMock = (existingRoutines: Routine[]) => {
  (useRoutineFormSourceData as jest.Mock).mockReturnValue({
    existingRoutines,
    defaultDurationMinutes: 30,
    defaultNotificationMinutes: 5,
  });
};

describe("グループルーティン編集時の重複チェック統合テスト", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("グループ(g1)が月水金に存在 + 水曜に同時間の非グループルーティン存在", () => {    const { groupRoutines, conflictingOnWed } = createTestRoutines();
    const allRoutines = [...groupRoutines, conflictingOnWed];
    const editingRoutine = groupRoutines[0]!; // 月曜のルーティンを編集

    it("フォームを開いて曜日変更なし → hasConflict = false", () => {
      setupMock(allRoutines);

      const { result } = renderHook(() =>
        useRoutineFormState({
          routine: editingRoutine,
          currentDayOfWeek: 1,
          onSubmit: jest.fn(),
        }),
      );

      expect(result.current.conflictInfo.hasConflict).toBe(false);
      // 個別編集：編集対象ルーティン自身の daysOfWeek のみ
      expect(result.current.daysOfWeek).toEqual([1]);
    });

    it("土曜を追加（土曜に競合なし） → hasConflict = false", () => {
      setupMock(allRoutines);

      const { result } = renderHook(() =>
        useRoutineFormState({
          routine: editingRoutine,
          currentDayOfWeek: 1,
          onSubmit: jest.fn(),
        }),
      );

      // 土曜を追加
      act(() => {
        result.current.toggleDay(6);
      });

      expect(result.current.daysOfWeek).toEqual(
        expect.arrayContaining([1, 6]),
      );
      expect(result.current.conflictInfo.hasConflict).toBe(false);
    });

    it("土曜を追加（土曜に同時間の別ルーティン存在） → hasConflict = true（正当な検知）", () => {
      const saturdayRoutine = baseRoutine({
        id: "r5",
        groupId: undefined,
        title: "散歩",
        startTime: "07:00",
        duration: 30,
        daysOfWeek: [6],
      });

      setupMock([...allRoutines, saturdayRoutine]);

      const { result } = renderHook(() =>
        useRoutineFormState({
          routine: editingRoutine,
          currentDayOfWeek: 1,
          onSubmit: jest.fn(),
        }),
      );

      // 土曜を追加
      act(() => {
        result.current.toggleDay(6);
      });

      expect(result.current.daysOfWeek).toEqual(
        expect.arrayContaining([1, 6]),
      );
      expect(result.current.conflictInfo.hasConflict).toBe(true);
    });

    it("火曜を追加（火曜に競合なし） → hasConflict = false", () => {
      setupMock(allRoutines);

      const { result } = renderHook(() =>
        useRoutineFormState({
          routine: editingRoutine,
          currentDayOfWeek: 1,
          onSubmit: jest.fn(),
        }),
      );

      // 火曜を追加
      act(() => {
        result.current.toggleDay(2);
      });

      expect(result.current.daysOfWeek).toEqual(
        expect.arrayContaining([1, 2]),
      );
      expect(result.current.conflictInfo.hasConflict).toBe(false);
    });

    it("時刻変更なし + 既存日のみ → 重複チェック対象が空なのでsubmitボタンは有効", () => {
      setupMock(allRoutines);

      const { result } = renderHook(() =>
        useRoutineFormState({
          routine: editingRoutine,
          currentDayOfWeek: 1,
          onSubmit: jest.fn(),
        }),
      );

      // 何も変更しない → isSubmitDisabled = false
      expect(result.current.isSubmitDisabled).toBe(false);
    });
  });

  describe("グループなしルーティンの編集（従来互換テスト）", () => {
    it("非グループルーティンの重複チェックはフォームの全曜日を対象にする", () => {
      const soloRoutine = baseRoutine({
        id: "solo1",
        groupId: undefined,
        daysOfWeek: [1],
      });
      const conflictRoutine = baseRoutine({
        id: "other1",
        groupId: undefined,
        title: "朝食",
        daysOfWeek: [1],
      });

      setupMock([soloRoutine, conflictRoutine]);

      const { result } = renderHook(() =>
        useRoutineFormState({
          routine: soloRoutine,
          currentDayOfWeek: 1,
          onSubmit: jest.fn(),
        }),
      );

      // 同じ曜日・同じ時間の別ルーティンがあるのでconflict
      expect(result.current.conflictInfo.hasConflict).toBe(true);
    });
  });
});
