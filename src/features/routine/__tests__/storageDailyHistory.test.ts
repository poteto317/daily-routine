import { isHoliday } from "@/lib/holidays";
import { HOLIDAY_DAY_VALUE, type Routine } from "@/types/routine";
import {
  buildDailyHistoryEntry,
  createRoutineSnapshots,
  resolveHistoryDayValue,
  selectRoutinesForHistory,
} from "../storageDailyHistory";

jest.mock("@/lib/holidays", () => ({
  isHoliday: jest.fn(),
}));

const mockIsHoliday = isHoliday as jest.MockedFunction<typeof isHoliday>;

const createRoutine = (overrides: Partial<Routine>): Routine => ({
  id: "routine-1",
  title: "Morning Run",
  startTime: "07:00",
  duration: 30,
  category: "health",
  daysOfWeek: [1],
  isCompleted: false,
  sortOrder: 0,
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
  ...overrides,
});

describe("storageDailyHistory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsHoliday.mockReturnValue(false);
  });

  it("平日は曜日番号を返す", () => {
    expect(resolveHistoryDayValue(new Date("2026-03-02T00:00:00.000Z"))).toBe(1);
  });

  it("祝日は祝日用の曜日値を返す", () => {
    mockIsHoliday.mockReturnValue(true);

    expect(resolveHistoryDayValue(new Date("2026-01-01T00:00:00.000Z"))).toBe(
      HOLIDAY_DAY_VALUE,
    );
  });

  it("対象日のルーティンだけを履歴対象として抽出する", () => {
    const mondayRoutine = createRoutine({ id: "monday", daysOfWeek: [1] });
    const holidayRoutine = createRoutine({
      id: "holiday",
      daysOfWeek: [HOLIDAY_DAY_VALUE],
    });

    expect(
      selectRoutinesForHistory(
        [mondayRoutine, holidayRoutine],
        new Date("2026-03-02T00:00:00.000Z"),
      ),
    ).toEqual([mondayRoutine]);
  });

  it("祝日は祝日ルーティンを履歴対象として抽出する", () => {
    mockIsHoliday.mockReturnValue(true);
    const mondayRoutine = createRoutine({ id: "monday", daysOfWeek: [1] });
    const holidayRoutine = createRoutine({
      id: "holiday",
      daysOfWeek: [HOLIDAY_DAY_VALUE],
    });

    expect(
      selectRoutinesForHistory(
        [mondayRoutine, holidayRoutine],
        new Date("2026-01-01T00:00:00.000Z"),
      ),
    ).toEqual([holidayRoutine]);
  });

  it("履歴用のスナップショットに必要な項目だけを含める", () => {
    const routine = createRoutine({
      id: "routine-42",
      title: "Deep Work",
      category: "work",
      startTime: "09:30",
    });

    expect(createRoutineSnapshots([routine])).toEqual([
      {
        id: "routine-42",
        title: "Deep Work",
        category: "work",
        startTime: "09:30",
      },
    ]);
  });

  it("日次履歴エントリを組み立てる", () => {
    const routine = createRoutine({ id: "routine-7", daysOfWeek: [1] });

    expect(
      buildDailyHistoryEntry("2026-03-02", ["routine-7"], [routine]),
    ).toEqual({
      date: "2026-03-02",
      completedRoutineIds: ["routine-7"],
      routineSnapshots: [
        {
          id: "routine-7",
          title: "Morning Run",
          category: "health",
          startTime: "07:00",
        },
      ],
    });
  });
});
