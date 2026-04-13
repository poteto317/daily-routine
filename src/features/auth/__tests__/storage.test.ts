import {
  isLocalAuthEnabled,
  isLocalDevHostname,
  readLocalAuthSnapshot,
  subscribeLocalAuthSnapshot,
  writeLocalAuthSnapshot,
  type LocalAuthSnapshot,
} from "../storage";
import { setCurrentUserId } from "@/lib/storage/core";

describe("auth storage", () => {
  beforeEach(() => {
    localStorage.clear();
    setCurrentUserId(null);
  });

  it("ローカル認証スナップショットはユーザースコープ切替後も読み出せる", () => {
    const snapshot: LocalAuthSnapshot = {
      uid: "local-user-1",
      email: "local@example.com",
      isAnonymous: false,
    };

    writeLocalAuthSnapshot(snapshot);
    setCurrentUserId(snapshot.uid);

    expect(readLocalAuthSnapshot()).toEqual(snapshot);
    expect(localStorage.getItem("local-dev-auth-user")).toBe(
      JSON.stringify(snapshot),
    );
    expect(
      localStorage.getItem(`user:${snapshot.uid}:local-dev-auth-user`),
    ).toBeNull();
  });

  it("ログアウト時はcurrentUserIdが設定済みでも固定キーのスナップショットを削除する", () => {
    const snapshot: LocalAuthSnapshot = {
      uid: "local-user-1",
      email: "local@example.com",
      isAnonymous: false,
    };

    writeLocalAuthSnapshot(snapshot);
    setCurrentUserId(snapshot.uid);

    writeLocalAuthSnapshot(null);

    expect(readLocalAuthSnapshot()).toBeNull();
    expect(localStorage.getItem("local-dev-auth-user")).toBeNull();
  });

  it("storage eventは固定キーで他タブ更新を検知する", () => {
    const initialSnapshot: LocalAuthSnapshot = {
      uid: "local-user-1",
      email: "local@example.com",
      isAnonymous: false,
    };
    const updatedSnapshot: LocalAuthSnapshot = {
      uid: "local-user-2",
      email: null,
      isAnonymous: true,
    };
    const listener = jest.fn();

    localStorage.setItem(
      "local-dev-auth-user",
      JSON.stringify(initialSnapshot),
    );
    setCurrentUserId(initialSnapshot.uid);

    const unsubscribe = subscribeLocalAuthSnapshot(listener);

    localStorage.setItem(
      "local-dev-auth-user",
      JSON.stringify(updatedSnapshot),
    );
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "local-dev-auth-user",
        newValue: JSON.stringify(updatedSnapshot),
        storageArea: localStorage,
      }),
    );

    expect(listener).toHaveBeenNthCalledWith(1, initialSnapshot);
    expect(listener).toHaveBeenLastCalledWith(updatedSnapshot);

    unsubscribe();
  });
});

describe("isLocalDevHostname", () => {
  it.each([
    ["localhost", true],
    ["127.0.0.1", true],
    ["::1", true],
    ["example.com", false],
    ["malicious-localhost.com", false],
    ["", false],
  ])("hostname=%s のとき %s を返す", (hostname, expected) => {
    expect(isLocalDevHostname(hostname)).toBe(expected);
  });
});

describe("isLocalAuthEnabled", () => {
  it("jsdom デフォルト (localhost) かつ env 未設定なら false", () => {
    // NEXT_PUBLIC_ENABLE_LOCAL_AUTH が未設定のテスト環境では false
    expect(isLocalAuthEnabled).toBe(false);
  });
});
