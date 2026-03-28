import { renderHook } from "@testing-library/react";

jest.mock("../syncSnapshotActionsResult", () => ({
  createSyncSnapshotActionsResult: jest.fn(),
}));

jest.mock("../useSyncSnapshotActionHandlers", () => ({
  useSyncSnapshotActionHandlers: jest.fn(),
}));

jest.mock("../useSyncSnapshotActiveState", () => ({
  useSyncSnapshotActiveState: jest.fn(),
}));

import { createSyncSnapshotActionsResult } from "../syncSnapshotActionsResult";
import { useSyncSnapshotActionHandlers } from "../useSyncSnapshotActionHandlers";
import { useSyncSnapshotActiveState } from "../useSyncSnapshotActiveState";
import { useSyncSnapshotActions } from "../useSyncSnapshotActions";

describe("useSyncSnapshotActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createSyncSnapshotActionsResult as jest.Mock).mockImplementation(
      (args) => args,
    );
    (useSyncSnapshotActiveState as jest.Mock).mockReturnValue({
      activeSnapshotId: null,
      setActiveSnapshotId: jest.fn(),
    });
    (useSyncSnapshotActionHandlers as jest.Mock).mockReturnValue({
      handleApply: jest.fn(),
      handleDelete: jest.fn(),
    });
  });

  it("active state と action handlers を compose する", () => {
    const setSnapshots = jest.fn();
    const resultShape = {
      activeSnapshotId: null,
      handleApply: jest.fn(),
      handleDelete: jest.fn(),
      composed: true,
    };
    (createSyncSnapshotActionsResult as jest.Mock).mockReturnValue(resultShape);

    const { result } = renderHook(() =>
      useSyncSnapshotActions({ setSnapshots }),
    );

    expect(useSyncSnapshotActiveState).toHaveBeenCalledTimes(1);
    expect(useSyncSnapshotActionHandlers).toHaveBeenCalledWith({
      setActiveSnapshotId: expect.any(Function),
      setSnapshots,
    });
    expect(createSyncSnapshotActionsResult).toHaveBeenCalledWith({
      activeSnapshotId: null,
      handleApply: expect.any(Function),
      handleDelete: expect.any(Function),
    });
    expect(result.current).toBe(resultShape);
  });
});
