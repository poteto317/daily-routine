import {
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
