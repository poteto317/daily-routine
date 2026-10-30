import type { Routine } from "@/types/routine";

export const FIXED_NOW = "2026-04-13T00:31:00.000Z";
export const CREATED_AT = "2026-02-13T00:00:00.000Z";

type Uuid = `${string}-${string}-${string}-${string}-${string}`;

export const makeRoutine = (overrides: Partial<Routine>): Routine => ({
  id: "r",
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

/** 結果のうち検証したい項目だけを取り出す */
export const pick = <K extends keyof Routine>(routines: Routine[], keys: K[]) =>
  routines.map((routine) =>
    Object.fromEntries(keys.map((key) => [key, routine[key]])),
  );

/**
 * 現在時刻を FIXED_NOW に固定し、crypto.randomUUID を generated-1, generated-2, ... の連番にする。
 * テストファイルのトップレベル（または describe 内）で 1 回呼ぶ。
 * 戻り値の `randomUuidSpy()` で呼び出し回数を検証できる。
 */
export const setupFixedClockAndSequentialUuid = () => {
  let spy: jest.SpyInstance | undefined;
  let uuidCounter = 0;

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(FIXED_NOW));
    uuidCounter = 0;
    spy = jest
      .spyOn(crypto, "randomUUID")
      .mockImplementation(() => `generated-${++uuidCounter}` as Uuid);
  });

  afterEach(() => {
    spy?.mockRestore();
    jest.useRealTimers();
  });

  return {
    randomUuidSpy: (): jest.SpyInstance => {
      if (!spy) throw new Error("beforeEach の外では参照できない");
      return spy;
    },
  };
};
