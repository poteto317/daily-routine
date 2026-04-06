import { watchRemoteChanges } from "../sync/watchRemote";

// ---------- firebase モック ----------
const mockOnSnapshot = jest.fn();
const mockDoc = jest.fn(() => ({ path: "users/user-1" }));
jest.mock("firebase/firestore", () => ({
  doc: (...args: unknown[]) => mockDoc(...(args as [])),
  onSnapshot: (...args: unknown[]) => mockOnSnapshot(...(args as [])),
}));

jest.mock("@/lib/firebase", () => ({
  getAuthInstance: jest.fn(() => ({ currentUser: { uid: "user-1" } })),
  getFirestoreInstance: jest.fn(() => ({})),
}));
// ------------------------------------

jest.mock("../sync/deviceId", () => ({
  getDeviceId: jest.fn(() => "device-a"),
}));

jest.mock("../sync/remoteChangeNotification", () => ({
  notifyRemoteChange: jest.fn(),
}));

jest.mock("../sync/remoteStatus", () => ({
  setSyncStatusFromComparison: jest.fn(),
}));

jest.mock("../sync/statusStore", () => ({
  setSyncStatus: jest.fn(),
}));

jest.mock("../sync/timestamp", () => ({
  extractTimestamp: jest.fn((v: number) => v),
}));

jest.mock("../sync/errorMessage", () => ({
  getSyncErrorMessage: jest.fn((_err: unknown, msg: string) => msg),
}));

import * as firebaseLib from "@/lib/firebase";
import * as remoteChangeNotification from "../sync/remoteChangeNotification";
import * as remoteStatus from "../sync/remoteStatus";
import * as statusStore from "../sync/statusStore";

const mockGetAuthInstance = firebaseLib.getAuthInstance as jest.MockedFunction<
  typeof firebaseLib.getAuthInstance
>;
const mockNotifyRemoteChange =
  remoteChangeNotification.notifyRemoteChange as jest.MockedFunction<
    typeof remoteChangeNotification.notifyRemoteChange
  >;
const mockSetSyncStatusFromComparison =
  remoteStatus.setSyncStatusFromComparison as jest.MockedFunction<
    typeof remoteStatus.setSyncStatusFromComparison
  >;
const mockSetSyncStatus = statusStore.setSyncStatus as jest.MockedFunction<
  typeof statusStore.setSyncStatus
>;

// snapshot ヘルパー
const makeSnapshot = (exists: boolean, data?: Record<string, unknown>) => ({
  exists: () => exists,
  data: () => data ?? {},
});

describe("watchRemoteChanges", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAuthInstance.mockReturnValue({
      currentUser: { uid: "user-1" },
    } as never);
    mockOnSnapshot.mockReturnValue(() => undefined); // unsubscribe 関数
  });

  it("未ログインの場合は null を返し onSnapshot を呼ばない", () => {
    mockGetAuthInstance.mockReturnValue({ currentUser: null } as never);

    const result = watchRemoteChanges(jest.fn());

    expect(result).toBeNull();
    expect(mockOnSnapshot).not.toHaveBeenCalled();
  });

  it("ログイン済みの場合は Unsubscribe 関数を返す", () => {
    const result = watchRemoteChanges(jest.fn());
    expect(typeof result).toBe("function");
  });

  it("スナップショットが存在しない場合 callback(false) を呼び setSyncStatusFromComparison(0) を呼ぶ", () => {
    const callback = jest.fn();
    watchRemoteChanges(callback);

    // onSnapshot に渡した success ハンドラを取り出して実行
    const successHandler = mockOnSnapshot.mock.calls[0][1] as (
      snapshot: ReturnType<typeof makeSnapshot>,
    ) => void;
    successHandler(makeSnapshot(false));

    expect(callback).toHaveBeenCalledWith(false);
    expect(mockSetSyncStatusFromComparison).toHaveBeenCalledWith(0);
    expect(mockNotifyRemoteChange).not.toHaveBeenCalled();
  });

  it("同じデバイスからの変更は callback(false) を呼び notifyRemoteChange を呼ばない", () => {
    const callback = jest.fn();
    watchRemoteChanges(callback);

    const successHandler = mockOnSnapshot.mock.calls[0][1] as (
      snapshot: ReturnType<typeof makeSnapshot>,
    ) => void;
    successHandler(
      makeSnapshot(true, {
        deviceId: "device-a", // 自分のデバイス ID と同じ
        lastModified: 9999,
      }),
    );

    expect(callback).toHaveBeenCalledWith(false);
    expect(mockNotifyRemoteChange).not.toHaveBeenCalled();
  });

  it("別デバイスからの変更は callback(true) を呼ぶ", () => {
    const callback = jest.fn();
    watchRemoteChanges(callback);

    const successHandler = mockOnSnapshot.mock.calls[0][1] as (
      snapshot: ReturnType<typeof makeSnapshot>,
    ) => void;
    successHandler(
      makeSnapshot(true, {
        deviceId: "device-b", // 別デバイス
        lastModified: 9999,
      }),
    );

    expect(callback).toHaveBeenCalledWith(true);
  });

  it("別デバイスからの変更は notifyRemoteChange を呼ぶ", () => {
    const callback = jest.fn();
    watchRemoteChanges(callback);

    const successHandler = mockOnSnapshot.mock.calls[0][1] as (
      snapshot: ReturnType<typeof makeSnapshot>,
    ) => void;
    successHandler(
      makeSnapshot(true, {
        deviceId: "device-b",
        lastModified: 9999,
      }),
    );

    expect(mockNotifyRemoteChange).toHaveBeenCalledTimes(1);
  });

  it("lastModified が 0 の場合は hasChanges=false で callback(false) を呼ぶ", () => {
    const callback = jest.fn();
    watchRemoteChanges(callback);

    const successHandler = mockOnSnapshot.mock.calls[0][1] as (
      snapshot: ReturnType<typeof makeSnapshot>,
    ) => void;
    successHandler(
      makeSnapshot(true, {
        deviceId: "device-b",
        lastModified: 0,
      }),
    );

    expect(callback).toHaveBeenCalledWith(false);
    expect(mockNotifyRemoteChange).not.toHaveBeenCalled();
  });

  it("onSnapshot エラー時は setSyncStatus にエラーメッセージを設定する", () => {
    watchRemoteChanges(jest.fn());

    // onSnapshot に渡した error ハンドラを取り出して実行
    const errorHandler = mockOnSnapshot.mock.calls[0][2] as (
      error: Error,
    ) => void;
    errorHandler(new Error("network error"));

    expect(mockSetSyncStatus).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) }),
    );
  });

  it("getAuthInstance が例外を投げた場合は null を返す", () => {
    mockGetAuthInstance.mockImplementation(() => {
      throw new Error("auth error");
    });

    const result = watchRemoteChanges(jest.fn());

    expect(result).toBeNull();
  });
});
