import { act, renderHook } from "@testing-library/react";

jest.mock("../journalPageReloadActions", () => ({
  createLoadJournalDataAction: jest.fn(),
}));

jest.mock("../journalPageReloadActionResult", () => ({
  createJournalPageReloadActionResult: jest.fn(),
}));

import { createJournalPageReloadActionResult } from "../journalPageReloadActionResult";
import { createLoadJournalDataAction } from "../journalPageReloadActions";
import { useJournalPageReloadAction } from "../useJournalPageReloadAction";

describe("useJournalPageReloadAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("load action を組み立てて委譲する", () => {
    const loadAction = jest.fn();
    const resultShape = { loadData: loadAction, composed: true };
    (createLoadJournalDataAction as jest.Mock).mockReturnValue(loadAction);
    (createJournalPageReloadActionResult as jest.Mock).mockReturnValue(
      resultShape,
    );

    const params = {
      setTodayEntry: jest.fn(),
      setTitleInput: jest.fn(),
      setContentInput: jest.fn(),
      setDateInput: jest.fn(),
      setRecentEntries: jest.fn(),
    };
    const { result } = renderHook(() => useJournalPageReloadAction(params));

    expect(result.current).toBe(resultShape);
    expect(createJournalPageReloadActionResult).toHaveBeenCalledWith({
      loadData: expect.any(Function),
    });

    const builtLoadData = (createJournalPageReloadActionResult as jest.Mock)
      .mock.calls[0][0].loadData as () => void;

    act(() => {
      builtLoadData();
    });

    expect(createLoadJournalDataAction).toHaveBeenCalledWith(params);
    expect(loadAction).toHaveBeenCalled();
  });
});
