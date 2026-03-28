import { renderHook } from "@testing-library/react";

jest.mock("../syncManagementPageActionBindings", () => ({
  createSyncManagementPageActionBindings: jest.fn(),
}));

jest.mock("../syncManagementPageStateResult", () => ({
  createSyncManagementPageStateResult: jest.fn(),
}));

jest.mock("../useSyncSnapshotActions", () => ({
  useSyncSnapshotActions: jest.fn(),
}));

jest.mock("../useSyncSnapshotDataState", () => ({
  useSyncSnapshotDataState: jest.fn(),
}));

import { createSyncManagementPageActionBindings } from "../syncManagementPageActionBindings";
import { createSyncManagementPageStateResult } from "../syncManagementPageStateResult";
import { useSyncManagementPageState } from "../useSyncManagementPageState";
import { useSyncSnapshotActions } from "../useSyncSnapshotActions";
import { useSyncSnapshotDataState } from "../useSyncSnapshotDataState";

describe("useSyncManagementPageState composition", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useSyncSnapshotDataState as jest.Mock).mockReturnValue({
      error: null,
      isLoading: false,
      loadSnapshots: jest.fn(),
      setSnapshots: jest.fn(),
      snapshots: [],
    });
    (createSyncManagementPageActionBindings as jest.Mock).mockReturnValue({
      bound: true,
    });
    (useSyncSnapshotActions as jest.Mock).mockReturnValue({
      activeSnapshotId: null,
      handleApply: jest.fn(),
      handleDelete: jest.fn(),
    });
    (createSyncManagementPageStateResult as jest.Mock).mockReturnValue({
      composed: true,
    });
  });

  it("data/actions/result を compose する", () => {
    const { result } = renderHook(() => useSyncManagementPageState());

    expect(createSyncManagementPageActionBindings).toHaveBeenCalledWith({
      setSnapshots: expect.any(Function),
    });
    expect(useSyncSnapshotActions).toHaveBeenCalledWith({ bound: true });
    expect(createSyncManagementPageStateResult).toHaveBeenCalledWith({
      activeSnapshotId: null,
      error: null,
      isLoading: false,
      loadSnapshots: expect.any(Function),
      snapshots: [],
      handleApply: expect.any(Function),
      handleDelete: expect.any(Function),
    });
    expect(result.current).toEqual({ composed: true });
  });
});
