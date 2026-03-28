import { renderHook } from "@testing-library/react";

jest.mock("../syncSnapshotDataStateResult", () => ({
  createSyncSnapshotDataStateResult: jest.fn(),
}));

jest.mock("../useSyncSnapshotInitialLoadEffect", () => ({
  useSyncSnapshotInitialLoadEffect: jest.fn(),
}));

jest.mock("../useSyncSnapshotLoadAction", () => ({
  useSyncSnapshotLoadAction: jest.fn(),
}));

import { createSyncSnapshotDataStateResult } from "../syncSnapshotDataStateResult";
import { useSyncSnapshotDataState } from "../useSyncSnapshotDataState";
import { useSyncSnapshotInitialLoadEffect } from "../useSyncSnapshotInitialLoadEffect";
import { useSyncSnapshotLoadAction } from "../useSyncSnapshotLoadAction";

describe("useSyncSnapshotDataState composition", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const loadSnapshots = jest.fn();
    (useSyncSnapshotLoadAction as jest.Mock).mockReturnValue(loadSnapshots);
    (createSyncSnapshotDataStateResult as jest.Mock).mockImplementation(
      (result) => result,
    );
  });

  it("state/load/effect を compose する", () => {
    const { result } = renderHook(() => useSyncSnapshotDataState());

    expect(useSyncSnapshotLoadAction).toHaveBeenCalledWith({
      setError: expect.any(Function),
      setIsLoading: expect.any(Function),
      setSnapshots: expect.any(Function),
    });
    expect(useSyncSnapshotInitialLoadEffect).toHaveBeenCalledWith({
      loadSnapshots: expect.any(Function),
    });
    expect(createSyncSnapshotDataStateResult).toHaveBeenCalledWith({
      error: null,
      isLoading: true,
      loadSnapshots: expect.any(Function),
      setSnapshots: expect.any(Function),
      snapshots: [],
    });
    expect(result.current).toEqual({
      error: null,
      isLoading: true,
      loadSnapshots: expect.any(Function),
      setSnapshots: expect.any(Function),
      snapshots: [],
    });
  });
});
