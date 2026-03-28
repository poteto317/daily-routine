import { act, renderHook } from "@testing-library/react";

jest.mock("@/lib/storage", () => ({
  getWorkTemplates: jest.fn(),
}));

jest.mock("../page/workTrackerTemplatesStateResult", () => ({
  createWorkTrackerTemplatesStateResult: jest.fn(),
}));

import { getWorkTemplates } from "@/lib/storage";
import { createWorkTrackerTemplatesStateResult } from "../page/workTrackerTemplatesStateResult";
import { useWorkTrackerTemplatesState } from "../page/useWorkTrackerTemplatesState";

const mockGetWorkTemplates = getWorkTemplates as jest.MockedFunction<
  typeof getWorkTemplates
>;

describe("useWorkTrackerTemplatesState", () => {
  const template = {
    id: "t1",
    name: "設計",
    createdAt: "2026-03-07T00:00:00.000Z",
    updatedAt: "2026-03-07T00:00:00.000Z",
    lastUsedAt: "2026-03-07T00:00:00.000Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetWorkTemplates.mockReturnValue([template] as never);
    (createWorkTrackerTemplatesStateResult as jest.Mock).mockImplementation(
      (args) => args,
    );
  });

  it("templates を読み込んで更新できる", () => {
    const { result } = renderHook(() => useWorkTrackerTemplatesState());

    expect(mockGetWorkTemplates).toHaveBeenCalledTimes(1);
    expect(createWorkTrackerTemplatesStateResult).toHaveBeenCalledWith({
      templates: [template],
      setTemplates: expect.any(Function),
    });
    expect(result.current.templates).toEqual([template]);

    act(() => {
      result.current.setTemplates([{ ...template, id: "t2" }]);
    });

    expect(result.current.templates).toEqual([
      expect.objectContaining({ id: "t2" }),
    ]);
    expect(createWorkTrackerTemplatesStateResult).toHaveBeenLastCalledWith({
      templates: [expect.objectContaining({ id: "t2" })],
      setTemplates: expect.any(Function),
    });
  });
});
