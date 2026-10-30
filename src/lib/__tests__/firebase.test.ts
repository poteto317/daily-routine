/** テスト中だけ差し替える Firebase の環境変数 */
const FIREBASE_ENV_KEYS = {
  apiKey: "NEXT_PUBLIC_FIREBASE_API_KEY",
  projectId: "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  appId: "NEXT_PUBLIC_FIREBASE_APP_ID",
} as const;

type FirebaseEnvValues = Record<keyof typeof FIREBASE_ENV_KEYS, string>;

/** 各テストの前に環境変数を設定し、後で元の値（未設定を含む）に戻す */
function withFirebaseEnv(values: FirebaseEnvValues) {
  const envNames = Object.values(FIREBASE_ENV_KEYS);
  let originals: Record<string, string | undefined> = {};

  beforeEach(() => {
    originals = Object.fromEntries(
      envNames.map((name) => [name, process.env[name]]),
    );
    for (const [field, name] of Object.entries(FIREBASE_ENV_KEYS)) {
      process.env[name] = values[field as keyof FirebaseEnvValues];
    }
  });

  afterEach(() => {
    for (const name of envNames) {
      const original = originals[name];
      if (original === undefined) {
        delete process.env[name];
      } else {
        process.env[name] = original;
      }
    }
  });
}

type FirebaseAppMock = {
  initializeApp: jest.Mock;
  getApps: jest.Mock;
  getApp: jest.Mock;
};

/**
 * lib/firebase が読み込む Firebase SDK 4 モジュールをまとめてモックする。
 * firebase/app だけはテストごとに振る舞いを変えるため引数で受け取る。
 * jest.doMock は巻き上げられないので、import より前に呼ぶこと。
 */
function mockFirebaseSdk(
  appMock: FirebaseAppMock = {
    initializeApp: jest.fn(),
    getApps: jest.fn(() => []),
    getApp: jest.fn(),
  },
) {
  jest.doMock("firebase/app", () => appMock);
  jest.doMock("firebase/messaging", () => ({
    getMessaging: jest.fn(),
    getToken: jest.fn(),
    onMessage: jest.fn(),
    isSupported: jest.fn(async () => false),
  }));
  jest.doMock("firebase/firestore", () => ({ getFirestore: jest.fn() }));
  jest.doMock("firebase/storage", () => ({ getStorage: jest.fn() }));
  jest.doMock("firebase/auth", () => ({
    getAuth: jest.fn(),
    signInAnonymously: jest.fn(),
  }));
}

describe("lib/firebase", () => {
  withFirebaseEnv({ apiKey: "", projectId: "", appId: "" });

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("設定不足時はisFirebaseConfiguredがfalseになる", async () => {
    mockFirebaseSdk();

    const mod = await import("../firebase");

    expect(mod.isFirebaseConfigured).toBe(false);
  });

  it("設定不足時のgetOrCreateUserはconfiguration-not-foundを投げる", async () => {
    mockFirebaseSdk();

    const mod = await import("../firebase");

    await expect(mod.getOrCreateUser()).rejects.toMatchObject({
      name: "FirebaseError",
      code: "auth/configuration-not-found",
    });
  });

  it("設定不足時のgetFirestoreInstanceはfirestore-not-availableを投げる", async () => {
    mockFirebaseSdk();

    const mod = await import("../firebase");

    expect(() => mod.getFirestoreInstance()).toThrow(
      "データベースが初期化されていません",
    );
  });

  it("設定不足時のgetStorageInstanceはstorage-not-availableを投げる", async () => {
    mockFirebaseSdk();

    const mod = await import("../firebase");

    expect(() => mod.getStorageInstance()).toThrow(
      "ストレージが初期化されていません",
    );
  });

  it("messaging未初期化時のonForegroundMessageはnullを返す", async () => {
    mockFirebaseSdk();

    const mod = await import("../firebase");

    const result = mod.onForegroundMessage(() => undefined);
    expect(result).toBeNull();
  });
});

describe("initializeFirebaseIfConfigured の分岐", () => {
  withFirebaseEnv({
    apiKey: "test-api-key",
    projectId: "test-project",
    appId: "test-app-id",
  });

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("getApps()が空の場合はinitializeAppが呼ばれること", async () => {
    const mockInitializeApp = jest.fn(() => ({ name: "[DEFAULT]" }));
    const mockGetApp = jest.fn();
    const mockGetApps = jest.fn(() => []);

    mockFirebaseSdk({
      initializeApp: mockInitializeApp,
      getApps: mockGetApps,
      getApp: mockGetApp,
    });

    await import("../firebase");

    expect(mockInitializeApp).toHaveBeenCalledTimes(1);
    expect(mockGetApp).not.toHaveBeenCalled();
  });

  it("getApps()が空でない場合はgetAppが呼ばれinitializeAppは呼ばれないこと", async () => {
    const mockApp = { name: "[DEFAULT]" };
    const mockInitializeApp = jest.fn();
    const mockGetApp = jest.fn(() => mockApp);
    const mockGetApps = jest.fn(() => [mockApp]);

    mockFirebaseSdk({
      initializeApp: mockInitializeApp,
      getApps: mockGetApps,
      getApp: mockGetApp,
    });

    await import("../firebase");

    expect(mockInitializeApp).not.toHaveBeenCalled();
    expect(mockGetApp).toHaveBeenCalledTimes(1);
  });

  it("initializeFirebaseIfConfiguredを複数回呼んでも例外にならないこと", async () => {
    const mockApp = { name: "[DEFAULT]" };
    const mockInitializeApp = jest.fn(() => mockApp);
    const mockGetApp = jest.fn(() => mockApp);
    const mockGetApps = jest
      .fn()
      .mockReturnValueOnce([])
      .mockReturnValue([mockApp]);

    mockFirebaseSdk({
      initializeApp: mockInitializeApp,
      getApps: mockGetApps,
      getApp: mockGetApp,
    });

    const { initializeFirebaseIfConfigured } =
      await import("../firebase-modules/initialize");

    // 1回目: app未登録 → initializeApp が呼ばれる
    expect(() => initializeFirebaseIfConfigured()).not.toThrow();
    expect(mockInitializeApp).toHaveBeenCalledTimes(1);
    expect(mockGetApp).not.toHaveBeenCalled();

    // 2回目: app登録済みをシミュレート → getApp が呼ばれ例外なし
    expect(() => initializeFirebaseIfConfigured()).not.toThrow();
    expect(mockInitializeApp).toHaveBeenCalledTimes(1); // 追加で呼ばれない
    expect(mockGetApp).toHaveBeenCalledTimes(1);
  });
});
