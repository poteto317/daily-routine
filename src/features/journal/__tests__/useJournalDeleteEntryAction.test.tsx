import { act, renderHook } from "@testing-library/react";

jest.mock("../journalPageMutationHandlers", () => ({
  createDeleteJournalEntryHandler: jest.fn(),
}));

import { createDeleteJournalEntryHandler } from "../journalPageMutationHandlers";
import { useJournalDeleteEntryAction } from "../useJournalDeleteEntryAction";

describe("useJournalDeleteEntryAction", () => {
  it("delete handler を組み立てて委譲する", () => {
    const deleteAction = jest.fn();
    (createDeleteJournalEntryHandler as jest.Mock).mockReturnValue(
      deleteAction,
    );
    const loadData = jest.fn();
    const entry = {
      id: "entry-1",
      date: "2024-01-12",
      title: "t",
      content: "c",
      createdAt: "2024-01-12T00:00:00.000Z",
      updatedAt: "2024-01-12T00:00:00.000Z",
    };

    const { result } = renderHook(() =>
      useJournalDeleteEntryAction({
        loadData,
      }),
    );

    act(() => {
      result.current(entry);
    });

    expect(createDeleteJournalEntryHandler).toHaveBeenCalledWith({
      reloadData: loadData,
    });
    expect(deleteAction).toHaveBeenCalledWith(entry);
  });
});
