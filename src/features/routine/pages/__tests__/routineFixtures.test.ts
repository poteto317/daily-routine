import { HOLIDAY_DAY_VALUE, ROUTINE_CATEGORIES } from "@/types/routine";
import { sampleCompletedRoutines, sampleRoutines } from "../__fixtures__/routineFixtures";

describe("routineFixtures", () => {
  it("3件のルーティンを含む", () => {
    expect(sampleRoutines).toHaveLength(3);
  });

  it("id が全件で一意である", () => {
    const ids = sampleRoutines.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("sortOrder が全件で一意である", () => {
    const orders = sampleRoutines.map((r) => r.sortOrder);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it("全件の sortOrder が 0 以上の整数である", () => {
    sampleRoutines.forEach((r) => {
      expect(r.sortOrder).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(r.sortOrder)).toBe(true);
    });
  });

  it("全件の duration が正の整数である", () => {
    sampleRoutines.forEach((r) => {
      expect(r.duration).toBeGreaterThan(0);
      expect(Number.isInteger(r.duration)).toBe(true);
    });
  });

  it("全件の startTime が HH:MM 形式である", () => {
    sampleRoutines.forEach((r) => {
      expect(r.startTime).toMatch(/^\d{2}:\d{2}$/);
    });
  });

  it("全件の daysOfWeek が非空である", () => {
    sampleRoutines.forEach((r) => {
      expect(r.daysOfWeek.length).toBeGreaterThan(0);
    });
  });

  it("全件の daysOfWeek が 0〜HOLIDAY_DAY_VALUE の範囲内である", () => {
    sampleRoutines.forEach((r) => {
      r.daysOfWeek.forEach((d) => {
        expect(d).toBeGreaterThanOrEqual(0);
        expect(d).toBeLessThanOrEqual(HOLIDAY_DAY_VALUE);
      });
    });
  });

  it("全件の daysOfWeek が重複なく一意である", () => {
    sampleRoutines.forEach((r) => {
      expect(new Set(r.daysOfWeek).size).toBe(r.daysOfWeek.length);
    });
  });

  it("全件の category が有効な RoutineCategory である", () => {
    const validCategories = ROUTINE_CATEGORIES.map((c) => c.value);
    sampleRoutines.forEach((r) => {
      expect(validCategories).toContain(r.category);
    });
  });

  it("全件の duration が正の数である", () => {
    sampleRoutines.forEach((r) => {
      expect(r.duration).toBeGreaterThan(0);
    });
  });

  it("全件の createdAt・updatedAt が ISO 8601 形式である", () => {
    const ISO_8601_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
    sampleRoutines.forEach((r) => {
      expect(r.createdAt).toMatch(ISO_8601_PATTERN);
      expect(r.updatedAt).toMatch(ISO_8601_PATTERN);
    });
  });
});

describe("sampleCompletedRoutines", () => {
  it("sampleRoutines と同じ件数を持つ", () => {
    expect(sampleCompletedRoutines).toHaveLength(sampleRoutines.length);
  });

  it("全件の isCompleted が true である", () => {
    sampleCompletedRoutines.forEach((r) => {
      expect(r.isCompleted).toBe(true);
    });
  });

  it("isCompleted 以外のプロパティが sampleRoutines と一致する", () => {
    sampleCompletedRoutines.forEach((r, i) => {
      expect(r).toEqual({ ...sampleRoutines[i], isCompleted: true });
    });
  });
});
