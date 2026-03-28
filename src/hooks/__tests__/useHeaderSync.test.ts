import { renderHook } from "@testing-library/react";
import { createHeaderSyncResult } from "@/hooks/headerSyncResult";
import { useHeaderSync } from "@/hooks/useHeaderSync";

jest.mock("@/hooks/headerSyncResult", () => ({
  createHeaderSyncResult: jest.fn(),
}));

jest.mock("@/hooks/useHeaderSyncStatus", () => ({
  useHeaderSyncStatus: jest.fn(),
}));

jest.mock("@/hooks/useHeaderSyncActions", () => ({
  useHeaderSyncActions: jest.fn(),
}));

import { useHeaderSyncActions } from "@/hooks/useHeaderSyncActions";
import { useHeaderSyncStatus } from "@/hooks/useHeaderSyncStatus";

const mockUseHeaderSyncStatus = useHeaderSyncStatus as jest.MockedFunction<
  typeof useHeaderSyncStatus
>;
const mockUseHeaderSyncActions = useHeaderSyncActions as jest.MockedFunction<
  typeof useHeaderSyncActions
>;

describe("useHeaderSync", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createHeaderSyncResult as jest.Mock).mockImplementation((args) => args);
    mockUseHeaderSyncStatus.mockReturnValue({
      isSyncing: false,
      lastSyncTime: null,
      localLastModified: null,
      remoteLastModified: null,
      hasRemoteChanges: false,
      hasLocalChanges: false,
      error: null,
    });
    mockUseHeaderSyncActions.mockReturnValue({
      handleUpload: jest.fn(),
      handleDownload: jest.fn(),
    });
  });

  it("status hook と actions hook を compose する", () => {
    const resultShape = {
      syncStatus: { isSyncing: false },
      handleUpload: jest.fn(),
      handleDownload: jest.fn(),
      composed: true,
    };
    (createHeaderSyncResult as jest.Mock).mockReturnValue(resultShape);

    const { result } = renderHook(() => useHeaderSync());

    expect(mockUseHeaderSyncStatus).toHaveBeenCalled();
    expect(mockUseHeaderSyncActions).toHaveBeenCalledWith(false);
    expect(createHeaderSyncResult).toHaveBeenCalledWith({
      syncStatus: (mockUseHeaderSyncStatus as jest.Mock).mock.results[0].value,
      ...(mockUseHeaderSyncActions as jest.Mock).mock.results[0].value,
    });
    expect(result.current).toBe(resultShape);
  });
});
