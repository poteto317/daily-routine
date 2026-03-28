import { createWorkTrackerSessionsStateResult } from "../page/workTrackerSessionsStateResult";

describe("createWorkTrackerSessionsStateResult", () => {
  it("sessions state の公開 shape を返す", () => {
    const sessions = [
      {
        id: "s1",
        workTemplateId: "t1",
        workName: "設計",
        mood: "good" as const,
        startTime: "2026-03-07T09:00:00.000Z",
        endTime: "2026-03-07T10:00:00.000Z",
        duration: 3600,
        createdAt: "2026-03-07T10:00:00.000Z",
      },
    ];
    const setSessions = jest.fn();

    expect(
      createWorkTrackerSessionsStateResult({
        sessions,
        setSessions,
      }),
    ).toEqual({
      sessions,
      setSessions,
    });
  });
});
