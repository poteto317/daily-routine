describe("lib/firebase", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "";
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "";
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID = "";
  });

  it("設定不足時はisFirebaseConfiguredがfalseになる", async () => {
    jest.doMock("firebase/app", () => ({
      initializeApp: jest.fn(),
      getApps: jest.fn(() => []),
      getApp: jest.fn(),
    }));
    jest.doMock("firebase/messaging", () => ({
      getMessaging: jest.fn(),
      getToken: jest.fn(),
      onMessage: jest.fn(),
      isSupported: jest.fn(async () => false),
    }));
    jest.doMock("firebase/firestore", () => ({ getFirestore: jest.fn() }));
    jest.doMock("firebase/auth", () => ({
      getAuth: jest.fn(),
      signInAnonymously: jest.fn(),
    }));

    const mod = await import("../firebase");

    expect(mod.isFirebaseConfigured).toBe(false);
  });

  it("設定不足時のgetOrCreateUserはconfiguration-not-foundを投げる", async () => {
    jest.doMock("firebase/app", () => ({
      initializeApp: jest.fn(),
      getApps: jest.fn(() => []),
      getApp: jest.fn(),
    }));
    jest.doMock("firebase/messaging", () => ({
      getMessaging: jest.fn(),
      getToken: jest.fn(),
      onMessage: jest.fn(),
      isSupported: jest.fn(async () => false),
    }));
    jest.doMock("firebase/firestore", () => ({ getFirestore: jest.fn() }));
    jest.doMock("firebase/auth", () => ({
      getAuth: jest.fn(),
      signInAnonymously: jest.fn(),
    }));

    const mod = await import("../firebase");

    await expect(mod.getOrCreateUser()).rejects.toMatchObject({
      name: "FirebaseError",
      code: "auth/configuration-not-found",
    });
  });

  it("設定不足時のgetFirestoreInstanceはfirestore-not-availableを投げる", async () => {
    jest.doMock("firebase/app", () => ({
      initializeApp: jest.fn(),
      getApps: jest.fn(() => []),
      getApp: jest.fn(),
    }));
    jest.doMock("firebase/messaging", () => ({
      getMessaging: jest.fn(),
      getToken: jest.fn(),
      onMessage: jest.fn(),
      isSupported: jest.fn(async () => false),
    }));
    jest.doMock("firebase/firestore", () => ({ getFirestore: jest.fn() }));
    jest.doMock("firebase/auth", () => ({
      getAuth: jest.fn(),
      signInAnonymously: jest.fn(),
    }));

    const mod = await import("../firebase");

    expect(() => mod.getFirestoreInstance()).toThrow(
      "データベースが初期化されていません",
    );
  });

  it("messaging未初期化時のonForegroundMessageはnullを返す", async () => {
    jest.doMock("firebase/app", () => ({
      initializeApp: jest.fn(),
      getApps: jest.fn(() => []),
      getApp: jest.fn(),
    }));
    jest.doMock("firebase/messaging", () => ({
      getMessaging: jest.fn(),
      getToken: jest.fn(),
      onMessage: jest.fn(),
      isSupported: jest.fn(async () => false),
    }));
    jest.doMock("firebase/firestore", () => ({ getFirestore: jest.fn() }));
    jest.doMock("firebase/auth", () => ({
      getAuth: jest.fn(),
      signInAnonymously: jest.fn(),
    }));

    const mod = await import("../firebase");

    const result = mod.onForegroundMessage(() => undefined);
    expect(result).toBeNull();
  });
});

describe("initializeFirebaseIfConfigured の分岐", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "test-api-key";
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "test-project";
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID = "test-app-id";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "";
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "";
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID = "";
  });

  it("getApps()が空の場合はinitializeAppが呼ばれること", async () => {
    const mockInitializeApp = jest.fn(() => ({ name: "[DEFAULT]" }));
    const mockGetApp = jest.fn();
    const mockGetApps = jest.fn(() => []);

    jest.doMock("firebase/app", () => ({
      initializeApp: mockInitializeApp,
      getApps: mockGetApps,
      getApp: mockGetApp,
    }));
    jest.doMock("firebase/messaging", () => ({
      getMessaging: jest.fn(),
      getToken: jest.fn(),
      onMessage: jest.fn(),
      isSupported: jest.fn(async () => false),
    }));
    jest.doMock("firebase/firestore", () => ({ getFirestore: jest.fn() }));
    jest.doMock("firebase/auth", () => ({
      getAuth: jest.fn(),
      signInAnonymously: jest.fn(),
    }));

    await import("../firebase");

    expect(mockInitializeApp).toHaveBeenCalledTimes(1);
    expect(mockGetApp).not.toHaveBeenCalled();
  });

  it("getApps()が空でない場合はgetAppが呼ばれinitializeAppは呼ばれないこと", async () => {
    const mockApp = { name: "[DEFAULT]" };
    const mockInitializeApp = jest.fn();
    const mockGetApp = jest.fn(() => mockApp);
    const mockGetApps = jest.fn(() => [mockApp]);

    jest.doMock("firebase/app", () => ({
      initializeApp: mockInitializeApp,
      getApps: mockGetApps,
      getApp: mockGetApp,
    }));
    jest.doMock("firebase/messaging", () => ({
      getMessaging: jest.fn(),
      getToken: jest.fn(),
      onMessage: jest.fn(),
      isSupported: jest.fn(async () => false),
    }));
    jest.doMock("firebase/firestore", () => ({ getFirestore: jest.fn() }));
    jest.doMock("firebase/auth", () => ({
      getAuth: jest.fn(),
      signInAnonymously: jest.fn(),
    }));

    await import("../firebase");

    expect(mockInitializeApp).not.toHaveBeenCalled();
    expect(mockGetApp).toHaveBeenCalledTimes(1);
  });

  it("initializeFirebaseIfConfiguredを複数回呼んでも例外にならないこと", async () => {
    const mockApp = { name: "[DEFAULT]" };
    const mockInitializeApp = jest.fn(() => mockApp);
    const mockGetApp = jest.fn(() => mockApp);
    const mockGetApps = jest.fn()
      .mockReturnValueOnce([])
      .mockReturnValue([mockApp]);

    jest.doMock("firebase/app", () => ({
      initializeApp: mockInitializeApp,
      getApps: mockGetApps,
      getApp: mockGetApp,
    }));
    jest.doMock("firebase/messaging", () => ({
      getMessaging: jest.fn(),
      getToken: jest.fn(),
      onMessage: jest.fn(),
      isSupported: jest.fn(async () => false),
    }));
    jest.doMock("firebase/firestore", () => ({ getFirestore: jest.fn() }));
    jest.doMock("firebase/auth", () => ({
      getAuth: jest.fn(),
      signInAnonymously: jest.fn(),
    }));

    const { initializeFirebaseIfConfigured } = await import(
      "../firebase-modules/initialize"
    );

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
