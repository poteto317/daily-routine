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
