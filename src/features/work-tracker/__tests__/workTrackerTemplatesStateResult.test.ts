import { createWorkTrackerTemplatesStateResult } from "../page/workTrackerTemplatesStateResult";

describe("createWorkTrackerTemplatesStateResult", () => {
  it("templates state の公開 shape を返す", () => {
    const templates = [
      {
        id: "t1",
        name: "設計",
        createdAt: "2026-03-07T00:00:00.000Z",
        updatedAt: "2026-03-07T00:00:00.000Z",
        lastUsedAt: "2026-03-07T00:00:00.000Z",
      },
    ];
    const setTemplates = jest.fn();

    expect(
      createWorkTrackerTemplatesStateResult({
        templates,
        setTemplates,
      }),
    ).toEqual({
      templates,
      setTemplates,
    });
  });
});
