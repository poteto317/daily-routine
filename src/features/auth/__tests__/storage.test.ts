import {
  buildLocalAuthUser,
  isLocalDevHostname,
  readLocalAuthSnapshot,
  subscribeLocalAuthSnapshot,
  writeLocalAuthSnapshot,
  type LocalAuthSnapshot,
} from "../storage";
import { getLocalDataUpdatedAt, setCurrentUserId } from "@/lib/storage/core";

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

  it("スナップショットの保存・削除ではローカルデータの更新時刻を変えない", () => {
    writeLocalAuthSnapshot({
      uid: "local-user-1",
      email: null,
      isAnonymous: true,
    });
    writeLocalAuthSnapshot(null);

    // ログイン・ログアウトだけで「ローカルに未同期の変更がある」扱いにしない
    expect(getLocalDataUpdatedAt()).toBe(0);
  });

  it("同じタブでの保存・削除は購読者へ通知する", () => {
    const snapshot: LocalAuthSnapshot = {
      uid: "local-user-1",
      email: null,
      isAnonymous: true,
    };
    const listener = jest.fn();
    const unsubscribe = subscribeLocalAuthSnapshot(listener);

    writeLocalAuthSnapshot(snapshot);
    writeLocalAuthSnapshot(null);

    expect(listener.mock.calls).toEqual([[null], [snapshot], [null]]);
    unsubscribe();
  });

  it("別のキーの storage event では通知しない", () => {
    const listener = jest.fn();
    const unsubscribe = subscribeLocalAuthSnapshot(listener);
    listener.mockClear();

    window.dispatchEvent(
      new StorageEvent("storage", { key: "daily-routines" }),
    );

    expect(listener).not.toHaveBeenCalled();
    unsubscribe();
  });

  it("購読を解除したら、保存や storage event があっても通知しない", () => {
    const listener = jest.fn();
    const unsubscribe = subscribeLocalAuthSnapshot(listener);
    listener.mockClear();

    unsubscribe();
    writeLocalAuthSnapshot({
      uid: "local-user-1",
      email: null,
      isAnonymous: true,
    });
    window.dispatchEvent(
      new StorageEvent("storage", { key: "local-dev-auth-user" }),
    );

    expect(listener).not.toHaveBeenCalled();
  });
});

describe("buildLocalAuthUser", () => {
  it("メールアドレスのあるユーザーは、表示名をメールにし、確認済みとして扱う", () => {
    const user = buildLocalAuthUser({
      uid: "local-user-1",
      email: "local@example.com",
      isAnonymous: false,
    });

    expect(user).toMatchObject({
      uid: "local-user-1",
      email: "local@example.com",
      displayName: "local@example.com",
      isAnonymous: false,
      emailVerified: true,
      providerId: "local",
    });
  });

  it("匿名ユーザーは未確認として扱う", () => {
    const user = buildLocalAuthUser({
      uid: "local-anon",
      email: null,
      isAnonymous: true,
    });

    expect(user).toMatchObject({
      isAnonymous: true,
      emailVerified: false,
      displayName: null,
    });
  });

  it("ID トークンはローカル用の固定値を返し、toJSON は元のスナップショットを返す", async () => {
    const snapshot: LocalAuthSnapshot = {
      uid: "local-user-1",
      email: null,
      isAnonymous: true,
    };
    const user = buildLocalAuthUser(snapshot);

    await expect(user.getIdToken()).resolves.toBe("local-dev-token");
    await expect(user.getIdTokenResult()).resolves.toMatchObject({
      token: "local-dev-token",
      claims: {},
    });
    await expect(user.reload()).resolves.toBeUndefined();
    await expect(user.delete()).resolves.toBeUndefined();
    expect(user.toJSON()).toBe(snapshot);
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
  type StorageModule = { isLocalAuthEnabled: boolean };

  afterEach(() => {
    jest.resetModules();
    delete process.env.NEXT_PUBLIC_ENABLE_LOCAL_AUTH;
  });

  it("env が設定されており jsdom デフォルト(localhost)なら true", async () => {
    process.env.NEXT_PUBLIC_ENABLE_LOCAL_AUTH = "true";
    // jsdom のデフォルト hostname は "localhost" なので isLocalDevHostname が true を返す
    let mod: StorageModule | undefined;
    await jest.isolateModulesAsync(async () => {
      mod = (await import("../storage")) as StorageModule;
    });
    expect(mod?.isLocalAuthEnabled).toBe(true);
  });

  it("NEXT_PUBLIC_ENABLE_LOCAL_AUTH が未設定なら false", async () => {
    let mod: StorageModule | undefined;
    await jest.isolateModulesAsync(async () => {
      mod = (await import("../storage")) as StorageModule;
    });
    expect(mod?.isLocalAuthEnabled).toBe(false);
  });
});
