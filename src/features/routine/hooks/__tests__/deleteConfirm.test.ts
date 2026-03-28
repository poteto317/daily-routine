import { confirmDeleteRoutine } from "../deleteConfirm";
import { type Routine } from "@/types/routine";

describe("confirmDeleteRoutine", () => {
  const routine = {
    id: "r1",
    groupId: "g1",
    title: "朝活",
    startTime: "08:00",
    duration: 30,
    category: "health",
    daysOfWeek: [1],
    isCompleted: false,
    sortOrder: 0,
    createdAt: "2026-02-12T00:00:00.000Z",
    updatedAt: "2026-02-12T00:00:00.000Z",
  } as Routine;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("単体ルーティン削除時は単体メッセージを表示する", () => {
    const confirmSpy = jest.spyOn(global, "confirm").mockReturnValue(true);

    const result = confirmDeleteRoutine({ ...routine, groupId: undefined }, [
      routine,
    ]);

    expect(result).toBe(true);
    expect(confirmSpy).toHaveBeenCalledWith(
      "このルーティンを削除してもよろしいですか？",
    );

    confirmSpy.mockRestore();
  });

  it("グループ削除時は曜日一覧付きメッセージを表示する", () => {
    const confirmSpy = jest.spyOn(global, "confirm").mockReturnValue(false);
    const allRoutines = [
      { ...routine, daysOfWeek: [1] },
      { ...routine, id: "r2", daysOfWeek: [3] },
    ] as Routine[];

    const result = confirmDeleteRoutine(routine, allRoutines);

    expect(result).toBe(false);
    expect(confirmSpy).toHaveBeenCalledWith(
      "「朝活」(月, 水)を削除してもよろしいですか？",
    );

    confirmSpy.mockRestore();
  });
});
