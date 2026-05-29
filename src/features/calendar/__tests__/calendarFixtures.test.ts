import { ROUTINE_CATEGORIES } from "@/types/routine";
import { sampleCalendarPomodoroHistory, sampleMonthlyHistory } from "../__fixtures__/calendarFixtures";

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;
const VALID_CATEGORIES = ROUTINE_CATEGORIES.map((c) => c.value);

describe("sampleMonthlyHistory", () => {
  it("2件のエントリを含む", () => {
    expect(Object.keys(sampleMonthlyHistory)).toHaveLength(2);
  });

  it("キーが YYYY-MM-DD 形式である", () => {
    Object.keys(sampleMonthlyHistory).forEach((key) => {
      expect(key).toMatch(DATE_KEY_PATTERN);
    });
  });

  it("各 value の date がキーと一致する", () => {
    Object.entries(sampleMonthlyHistory).forEach(([key, history]) => {
      expect(history.date).toBe(key);
    });
  });

  it("completedRoutineIds が非空の配列である", () => {
    Object.values(sampleMonthlyHistory).forEach((history) => {
      expect(Array.isArray(history.completedRoutineIds)).toBe(true);
      expect(history.completedRoutineIds.length).toBeGreaterThan(0);
    });
  });

  it("routineSnapshots が非空の配列である", () => {
    Object.values(sampleMonthlyHistory).forEach((history) => {
      expect(Array.isArray(history.routineSnapshots)).toBe(true);
      expect(history.routineSnapshots.length).toBeGreaterThan(0);
    });
  });

  it("routineSnapshots の各要素が id/title/category/startTime を持つ", () => {
    Object.values(sampleMonthlyHistory).forEach((history) => {
      history.routineSnapshots.forEach((snapshot) => {
        expect(typeof snapshot.id).toBe("string");
        expect(snapshot.id.length).toBeGreaterThan(0);
        expect(typeof snapshot.title).toBe("string");
        expect(snapshot.title.length).toBeGreaterThan(0);
        expect(VALID_CATEGORIES).toContain(snapshot.category);
        expect(snapshot.startTime).toMatch(TIME_PATTERN);
      });
    });
  });

  it("routineSnapshots の id が completedRoutineIds を全て包含する", () => {
    Object.values(sampleMonthlyHistory).forEach((history) => {
      const snapshotIds = history.routineSnapshots.map((s) => s.id);
      history.completedRoutineIds.forEach((id) => {
        expect(snapshotIds).toContain(id);
      });
    });
  });

  it("routineSnapshots の id が全件で一意である", () => {
    Object.values(sampleMonthlyHistory).forEach((history) => {
      const ids = history.routineSnapshots.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  it("completedRoutineIds の件数が routineSnapshots の件数以下である", () => {
    Object.values(sampleMonthlyHistory).forEach((history) => {
      expect(history.completedRoutineIds.length).toBeLessThanOrEqual(
        history.routineSnapshots.length,
      );
    });
  });

  it("各エントリの date が有効なカレンダー日付である", () => {
    Object.values(sampleMonthlyHistory).forEach((history) => {
      const parsed = new Date(history.date);
      expect(isNaN(parsed.getTime())).toBe(false);
    });
  });
});

describe("sampleCalendarPomodoroHistory", () => {
  it("2件のエントリを含む", () => {
    expect(Object.keys(sampleCalendarPomodoroHistory)).toHaveLength(2);
  });

  it("キーが YYYY-MM-DD 形式である", () => {
    Object.keys(sampleCalendarPomodoroHistory).forEach((key) => {
      expect(key).toMatch(DATE_KEY_PATTERN);
    });
  });

  it("各 value の date がキーと一致する", () => {
    Object.entries(sampleCalendarPomodoroHistory).forEach(([key, session]) => {
      expect(session.date).toBe(key);
    });
  });

  it("completedPomodoros が正の整数である", () => {
    Object.values(sampleCalendarPomodoroHistory).forEach((session) => {
      expect(session.completedPomodoros).toBeGreaterThan(0);
      expect(Number.isInteger(session.completedPomodoros)).toBe(true);
    });
  });

  it("sampleMonthlyHistory と同じ日付キーを持つ", () => {
    expect(new Set(Object.keys(sampleCalendarPomodoroHistory))).toEqual(
      new Set(Object.keys(sampleMonthlyHistory)),
    );
  });
});
