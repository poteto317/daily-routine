import type { Routine } from "@/types/routine";

import { repairGroupMembers } from "../routineGroupDayRepair";

const FIXED_NOW = "2026-04-13T00:31:00.000Z";
const CREATED_AT = "2026-02-13T00:00:00.000Z";

type Uuid = `${string}-${string}-${string}-${string}-${string}`;

const makeRoutine = (overrides: Partial<Routine>): Routine => ({
  id: "r",
  groupId: "g",
  title: "朝活",
  startTime: "08:00",
  duration: 30,
  category: "health",
  daysOfWeek: [1],
  isCompleted: false,
  sortOrder: 0,
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
  ...overrides,
});

describe("repairGroupMembers", () => {
  let randomUuidSpy: jest.SpyInstance;
  let uuidCounter: number;

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(FIXED_NOW));
    uuidCounter = 0;
    randomUuidSpy = jest
      .spyOn(crypto, "randomUUID")
      .mockImplementation(() => `generated-${++uuidCounter}` as Uuid);
  });

  afterEach(() => {
    randomUuidSpy.mockRestore();
    jest.useRealTimers();
  });

  it("メンバーが空なら空配列を返し、id を生成しない", () => {
    expect(repairGroupMembers([], undefined)).toEqual([]);
    expect(randomUuidSpy).not.toHaveBeenCalled();
  });

  it("曜日が 1 つも無いメンバーだけなら空配列を返す", () => {
    const members = [makeRoutine({ id: "a", daysOfWeek: [] })];

    expect(repairGroupMembers(members, undefined)).toEqual([]);
  });

  it("単一曜日のメンバーが揃っていれば、同じオブジェクトを曜日の昇順で返す", () => {
    const wednesday = makeRoutine({ id: "wed", daysOfWeek: [3] });
    const monday = makeRoutine({ id: "mon", daysOfWeek: [1] });

    const result = repairGroupMembers([wednesday, monday], undefined);

    expect(result).toHaveLength(2);
    expect(result[0]).toBe(monday);
    expect(result[1]).toBe(wednesday);
  });

  it("同じ曜日が重複していれば、今日完了済みのメンバーを優先して残す", () => {
    const first = makeRoutine({ id: "first", daysOfWeek: [1] });
    const completed = makeRoutine({ id: "completed", daysOfWeek: [1] });

    expect(
      repairGroupMembers([first, completed], new Set(["completed"])),
    ).toEqual([completed]);
    expect(repairGroupMembers([first, completed], undefined)).toEqual([first]);
  });

  it("空いた曜日は複数曜日メンバーの id と createdAt を再利用し、尽きたら新しい id を作る", () => {
    const template = makeRoutine({
      id: "multi",
      daysOfWeek: [1, 3, 5],
      sortOrder: 10,
      createdAt: "2026-01-01T00:00:00.000Z",
    });

    const result = repairGroupMembers([template], undefined);

    expect(
      result.map(({ id, daysOfWeek, sortOrder, createdAt, updatedAt }) => ({
        id,
        daysOfWeek,
        sortOrder,
        createdAt,
        updatedAt,
      })),
    ).toEqual([
      {
        id: "multi",
        daysOfWeek: [1],
        sortOrder: 10,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: FIXED_NOW,
      },
      {
        id: "generated-1",
        daysOfWeek: [3],
        sortOrder: 11,
        createdAt: FIXED_NOW,
        updatedAt: FIXED_NOW,
      },
      {
        id: "generated-2",
        daysOfWeek: [5],
        sortOrder: 12,
        createdAt: FIXED_NOW,
        updatedAt: FIXED_NOW,
      },
    ]);
  });

  it("先頭メンバーの sortOrder が未設定なら 0 を起点に振る", () => {
    const template = makeRoutine({
      id: "multi",
      daysOfWeek: [2, 4],
      sortOrder: undefined,
    });

    expect(
      repairGroupMembers([template], undefined).map(
        (routine) => routine.sortOrder,
      ),
    ).toEqual([0, 1]);
  });
});
