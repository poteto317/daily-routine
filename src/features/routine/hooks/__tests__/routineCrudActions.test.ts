import type { Routine } from "@/types/routine";

jest.mock("../routineStateModel", () => ({
  buildUpdatedRoutine: jest.fn(
    (routine: Routine, updates: Partial<Routine>, now: string): Routine => ({
      ...routine,
      ...updates,
      updatedAt: now,
    }),
  ),
  createRoutinesForBatchInput: jest.fn(() => []),
  createRoutinesForSingleInput: jest.fn(() => []),
  sortRoutinesByOrder: jest.fn((routines: Routine[]) => routines),
}));

import {
  buildUpdatedRoutine,
  createRoutinesForBatchInput,
  createRoutinesForSingleInput,
  sortRoutinesByOrder,
} from "../routineStateModel";
import {
  addRoutineToState,
  addRoutinesToState,
  deleteRoutineFromState,
  deleteRoutineGroupFromState,
  replaceRoutinesForDaysInState,
  updateRoutineInState,
} from "../routineCrudActions";

describe("routineCrudActions", () => {
  const routines: Routine[] = [
    {
      id: "1",
      groupId: "g1",
      title: "Morning Run",
      startTime: "07:00",
      duration: 30,
      category: "health",
      daysOfWeek: [1],
      isCompleted: false,
      description: "",
      notificationMinutes: 10,
      sortOrder: 0,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    {
      id: "2",
      groupId: "g2",
      title: "Read",
      startTime: "21:00",
      duration: 20,
      category: "study",
      daysOfWeek: [2],
      isCompleted: false,
      description: "",
      notificationMinutes: 0,
      sortOrder: 1,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("単一追加で作成済みルーティンを末尾に連結して並び替える", () => {
    const created = [{ ...routines[0], id: "3" }];
    (createRoutinesForSingleInput as jest.Mock).mockReturnValue(created);

    const updated = addRoutineToState(routines, {
      title: "Study",
      startTime: "20:00",
      duration: 60,
      category: "study",
      daysOfWeek: [3],
      isCompleted: false,
      notificationMinutes: 0,
      sortOrder: 0,
    });

    expect(createRoutinesForSingleInput).toHaveBeenCalledWith(
      routines,
      expect.objectContaining({ title: "Study" }),
    );
    expect(sortRoutinesByOrder).toHaveBeenCalledWith([...routines, ...created]);
    expect(updated).toEqual([...routines, ...created]);
  });

  it("複数追加で batch 作成結果を連結して並び替える", () => {
    const created = [{ ...routines[0], id: "4" }];
    (createRoutinesForBatchInput as jest.Mock).mockReturnValue(created);

    const updated = addRoutinesToState(routines, [
      {
        title: "Batch",
        startTime: "18:00",
        duration: 15,
        category: "work",
        daysOfWeek: [4],
        isCompleted: false,
        notificationMinutes: 5,
      },
    ]);

    expect(createRoutinesForBatchInput).toHaveBeenCalledWith(
      routines,
      expect.any(Array),
    );
    expect(updated).toEqual([...routines, ...created]);
  });

  it("単体更新で一致IDだけ buildUpdatedRoutine を適用する", () => {
    const updated = updateRoutineInState(
      routines,
      "1",
      { title: "Updated" },
      "2024-02-01T00:00:00.000Z",
    );

    expect(buildUpdatedRoutine).toHaveBeenCalledWith(
      routines[0],
      { title: "Updated" },
      "2024-02-01T00:00:00.000Z",
    );
    expect(updated[0].title).toBe("Updated");
    expect(updated[1]).toEqual(routines[1]);
  });

  it("単体削除とグループ削除を行える", () => {
    expect(deleteRoutineFromState(routines, "1")).toEqual([routines[1]]);
    expect(deleteRoutineGroupFromState(routines, "g2")).toEqual([routines[0]]);
  });

  it("曜日差し替えで対象曜日を除外して新規作成分を追加する", () => {
    const created = [{ ...routines[0], id: "5", daysOfWeek: [1, 3] }];
    (createRoutinesForBatchInput as jest.Mock).mockReturnValue(created);

    const updated = replaceRoutinesForDaysInState(
      routines,
      [1],
      [
        {
          title: "Replacement",
          startTime: "10:00",
          duration: 30,
          category: "work",
          daysOfWeek: [1, 3],
          isCompleted: false,
          notificationMinutes: 0,
        },
      ],
    );

    expect(createRoutinesForBatchInput).toHaveBeenCalledWith(
      [routines[1]],
      expect.any(Array),
    );
    expect(sortRoutinesByOrder).toHaveBeenCalledWith([routines[1], ...created]);
    expect(updated).toEqual([routines[1], ...created]);
  });

});

