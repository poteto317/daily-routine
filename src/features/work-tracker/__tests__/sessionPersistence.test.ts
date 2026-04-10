import { persistWorkSession } from "../page/sessionPersistence";

jest.mock("@/lib/storage", () => ({
  addWorkSession: jest.fn(),
  getOrCreateWorkTemplate: jest.fn(),
  updateWorkTemplateLastUsed: jest.fn(),
}));

import {
  addWorkSession,
  getOrCreateWorkTemplate,
  updateWorkTemplateLastUsed,
} from "@/lib/storage";

const mockAddWorkSession = addWorkSession as jest.MockedFunction<
  typeof addWorkSession
>;
const mockGetOrCreateWorkTemplate =
  getOrCreateWorkTemplate as jest.MockedFunction<
    typeof getOrCreateWorkTemplate
  >;
const mockUpdateWorkTemplateLastUsed =
  updateWorkTemplateLastUsed as jest.MockedFunction<
    typeof updateWorkTemplateLastUsed
  >;

describe("persistWorkSession", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-07T12:00:00.000Z"));
    jest.spyOn(Math, "random").mockReturnValue(0.123456);
    mockGetOrCreateWorkTemplate.mockReturnValue({
      id: "t1",
      name: "設計",
    } as never);
  });

  afterEach(() => {
    jest.useRealTimers();
    (Math.random as jest.Mock).mockRestore();
  });

  it("テンプレートを更新して作業セッションを保存する", () => {
    persistWorkSession({
      workName: " 設計 ",
      selectedMood: "good",
      elapsedTime: 180,
      notes: "  集中できた  ",
      startTime: new Date("2026-03-07T11:57:00.000Z"),
    });

    expect(mockGetOrCreateWorkTemplate).toHaveBeenCalledWith("設計");
    expect(mockUpdateWorkTemplateLastUsed).toHaveBeenCalledWith("t1");
    expect(mockAddWorkSession).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "ws-1772884800000-123456",
        workTemplateId: "t1",
        workName: "設計",
        mood: "good",
        startTime: "2026-03-07T11:57:00.000Z",
        endTime: "2026-03-07T12:00:00.000Z",
        duration: 180,
        notes: "集中できた",
        createdAt: "2026-03-07T12:00:00.000Z",
      }),
    );
  });

  it("開始時刻なしと空メモにも対応する", () => {
    persistWorkSession({
      workName: "設計",
      selectedMood: "normal",
      elapsedTime: 0,
      notes: "   ",
      startTime: null,
    });

    expect(mockAddWorkSession).toHaveBeenCalledWith(
      expect.objectContaining({
        startTime: "2026-03-07T12:00:00.000Z",
        notes: undefined,
      }),
    );
  });
});
