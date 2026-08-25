import { MOOD_OPTIONS } from "@/types/routine";
import type { WorkSession } from "@/types/routine";
import {
  sampleSessionHistory,
  sampleWorkSessions,
} from "../__fixtures__/workSessionFixtures";

const VALID_MOODS = MOOD_OPTIONS.map((m) => m.value);
const ISO_8601_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

describe("sampleWorkSessions", () => {
  it("3件のセッションを含む", () => {
    expect(sampleWorkSessions).toHaveLength(3);
  });

  it("全件の id が空でない文字列である", () => {
    sampleWorkSessions.forEach((s) => {
      expect(typeof s.id).toBe("string");
      expect(s.id.length).toBeGreaterThan(0);
    });
  });

  it("全件の workTemplateId が空でない文字列である", () => {
    sampleWorkSessions.forEach((s) => {
      expect(typeof s.workTemplateId).toBe("string");
      expect(s.workTemplateId.length).toBeGreaterThan(0);
    });
  });

  it("全件の workName が空でない文字列である", () => {
    sampleWorkSessions.forEach((s) => {
      expect(typeof s.workName).toBe("string");
      expect(s.workName.length).toBeGreaterThan(0);
    });
  });

  it("notes が定義されている場合は空でない文字列である", () => {
    sampleWorkSessions
      .filter(
        (s): s is WorkSession & { notes: string } => s.notes !== undefined,
      )
      .forEach((s) => {
        expect(typeof s.notes).toBe("string");
        expect(s.notes.length).toBeGreaterThan(0);
      });
  });

  it("id が全件で一意である", () => {
    const ids = sampleWorkSessions.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("全件の mood が有効な MoodType である", () => {
    sampleWorkSessions.forEach((s) => {
      expect(VALID_MOODS).toContain(s.mood);
    });
  });

  it("全件の startTime が ISO 8601 形式である", () => {
    sampleWorkSessions.forEach((s) => {
      expect(s.startTime).toMatch(ISO_8601_PATTERN);
    });
  });

  it("endTime が存在する場合は ISO 8601 形式である", () => {
    sampleWorkSessions
      .filter(
        (s): s is WorkSession & { endTime: string } => s.endTime !== undefined,
      )
      .forEach((s) => {
        expect(s.endTime).toMatch(ISO_8601_PATTERN);
      });
  });

  it("duration が存在する場合は正の数である", () => {
    sampleWorkSessions
      .filter(
        (s): s is WorkSession & { duration: number } =>
          s.duration !== undefined,
      )
      .forEach((s) => {
        expect(s.duration).toBeGreaterThan(0);
      });
  });

  it("duration が endTime - startTime（秒）と一致する", () => {
    sampleWorkSessions
      .filter(
        (s): s is WorkSession & { endTime: string; duration: number } =>
          s.endTime !== undefined && s.duration !== undefined,
      )
      .forEach((s) => {
        const durationSeconds =
          (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) /
          1000;
        expect(s.duration).toBe(durationSeconds);
      });
  });

  it("全件の createdAt が ISO 8601 形式である", () => {
    sampleWorkSessions.forEach((s) => {
      expect(s.createdAt).toMatch(ISO_8601_PATTERN);
    });
  });
});

describe("sampleSessionHistory", () => {
  it("1件の日付キーを持つ", () => {
    expect(Object.keys(sampleSessionHistory)).toHaveLength(1);
  });

  it("全セッション件数が sampleWorkSessions と一致する", () => {
    const total = Object.values(sampleSessionHistory).reduce(
      (acc, sessions) => acc + sessions.length,
      0,
    );
    expect(total).toBe(sampleWorkSessions.length);
  });

  it("キーが YYYY-MM-DD 形式である", () => {
    Object.keys(sampleSessionHistory).forEach((key) => {
      expect(key).toMatch(DATE_KEY_PATTERN);
    });
  });

  it("各 value が配列である", () => {
    Object.values(sampleSessionHistory).forEach((sessions) => {
      expect(Array.isArray(sessions)).toBe(true);
    });
  });

  it("各 value が空でない配列である", () => {
    Object.values(sampleSessionHistory).forEach((sessions) => {
      expect(sessions.length).toBeGreaterThan(0);
    });
  });

  it("sampleWorkSessions と同じセッションを参照している", () => {
    const allSessions = Object.values(sampleSessionHistory).flat();
    expect(allSessions).toEqual(sampleWorkSessions);
  });

  it("各キーがセッションの startTime 日付部分と一致する", () => {
    Object.entries(sampleSessionHistory).forEach(([date, sessions]) => {
      sessions.forEach((s) => {
        expect(s.startTime.startsWith(date)).toBe(true);
      });
    });
  });
});
