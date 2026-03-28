import { act, renderHook } from "@testing-library/react";
import { useWorkTrackerDataState } from "../page/useWorkTrackerDataState";

jest.mock("@/lib/storage", () => ({
  getTodayWorkSessions: jest.fn(),
  getWorkTemplates: jest.fn(),
}));

import { getTodayWorkSessions, getWorkTemplates } from "@/lib/storage";

const mockGetTodayWorkSessions = getTodayWorkSessions as jest.MockedFunction<
  typeof getTodayWorkSessions
>;
const mockGetWorkTemplates = getWorkTemplates as jest.MockedFunction<
  typeof getWorkTemplates
>;

describe("useWorkTrackerDataState", () => {
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

  const template = {
    id: "t1",
    name: "設計",
    createdAt: "2026-03-07T00:00:00.000Z",
    updatedAt: "2026-03-07T00:00:00.000Z",
    lastUsedAt: "2026-03-07T00:00:00.000Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTodayWorkSessions.mockReturnValue([session] as never);
    mockGetWorkTemplates.mockReturnValue([template] as never);
  });

  it("storage から初期データを読み込んで保持する", () => {
    const { result } = renderHook(() => useWorkTrackerDataState());

    expect(mockGetTodayWorkSessions).toHaveBeenCalledTimes(1);
    expect(mockGetWorkTemplates).toHaveBeenCalledTimes(1);
    expect(result.current.initialState.sessions).toEqual([session]);
    expect(result.current.initialState.templates).toEqual([template]);
    expect(result.current.sessions).toEqual([session]);
    expect(result.current.templates).toEqual([template]);
  });

  it("sessions と templates を独立して更新できる", () => {
    const nextSession = { ...session, id: "s2", workName: "実装" };
    const nextTemplate = { ...template, id: "t2", name: "実装" };
    const { result } = renderHook(() => useWorkTrackerDataState());

    act(() => {
      result.current.setSessions([nextSession]);
      result.current.setTemplates([nextTemplate]);
    });

    expect(result.current.sessions).toEqual([nextSession]);
    expect(result.current.templates).toEqual([nextTemplate]);
    expect(result.current.initialState.sessions).toEqual([session]);
    expect(result.current.initialState.templates).toEqual([template]);
  });
});
