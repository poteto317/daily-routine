import { act, renderHook } from "@testing-library/react";

jest.mock("@/lib/storage", () => ({
  getTodayWorkSessions: jest.fn(),
}));

jest.mock("../page/workTrackerSessionsStateResult", () => ({
  createWorkTrackerSessionsStateResult: jest.fn(),
}));

import { getTodayWorkSessions } from "@/lib/storage";
import { createWorkTrackerSessionsStateResult } from "../page/workTrackerSessionsStateResult";
import { useWorkTrackerSessionsState } from "../page/useWorkTrackerSessionsState";

const mockGetTodayWorkSessions = getTodayWorkSessions as jest.MockedFunction<
  typeof getTodayWorkSessions
>;

describe("useWorkTrackerSessionsState", () => {
  const session = {
    id: "s1",
    workTemplateId: "t1",
    workName: "設計",
    mood: "good" as const,
    startTime: "2026-03-07T09:00:00.000Z",
    endTime: "2026-03-07T10:00:00.000Z",
    duration: 3600,
    createdAt: "2026-03-07T10:00:00.000Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTodayWorkSessions.mockReturnValue([session] as never);
    (createWorkTrackerSessionsStateResult as jest.Mock).mockImplementation(
      (args) => args,
    );
  });

  it("today sessions を読み込んで更新できる", () => {
    const { result } = renderHook(() => useWorkTrackerSessionsState());

    expect(mockGetTodayWorkSessions).toHaveBeenCalledTimes(1);
    expect(createWorkTrackerSessionsStateResult).toHaveBeenCalledWith({
      sessions: [session],
      setSessions: expect.any(Function),
    });
    expect(result.current.sessions).toEqual([session]);

    act(() => {
      result.current.setSessions([{ ...session, id: "s2" }]);
    });

    expect(result.current.sessions).toEqual([
      expect.objectContaining({ id: "s2" }),
    ]);
    expect(createWorkTrackerSessionsStateResult).toHaveBeenLastCalledWith({
      sessions: [expect.objectContaining({ id: "s2" })],
      setSessions: expect.any(Function),
    });
  });
});
