import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, isSupported } from "firebase/messaging";
import { getStorage } from "firebase/storage";
import { initializeFirebaseIfConfigured } from "../initialize";
import { getFirebaseState, setFirebaseState } from "../state";

let mockIsFirebaseConfigured = true;
const mockApp = { name: "[DEFAULT]" };

jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(() => mockApp),
  getApps: jest.fn(() => []),
  getApp: jest.fn(() => mockApp),
}));
jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({ id: "auth" })),
}));
jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(() => ({ id: "firestore" })),
}));
jest.mock("firebase/storage", () => ({
  getStorage: jest.fn(() => ({ id: "storage" })),
}));
jest.mock("firebase/messaging", () => ({
  getMessaging: jest.fn(() => ({ id: "messaging" })),
  isSupported: jest.fn(),
}));
jest.mock("../config", () => ({
  firebaseConfig: { apiKey: "k", projectId: "p", appId: "a" },
  get isFirebaseConfigured() {
    return mockIsFirebaseConfigured;
  },
}));

const mockIsSupported = isSupported as jest.MockedFunction<typeof isSupported>;

/** isSupported().then(...) の後続処理を流し切る */
const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("initializeFirebaseIfConfigured", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsFirebaseConfigured = true;
    (getApps as jest.Mock).mockReturnValue([]);
    setFirebaseState({
      app: null,
      auth: null,
      firestore: null,
      storage: null,
      messaging: null,
    });
  });

  it("設定が不完全なら何も初期化しない", () => {
    mockIsFirebaseConfigured = false;

    initializeFirebaseIfConfigured();

    expect(initializeApp).not.toHaveBeenCalled();
    expect(getFirebaseState().app).toBeNull();
  });

  it("App・Firestore・Auth・Storage を初期化して状態に保存する", () => {
    mockIsSupported.mockResolvedValue(false);

    initializeFirebaseIfConfigured();

    const state = getFirebaseState();
    expect(state.app).toBe(mockApp);
    expect(getFirestore).toHaveBeenCalledWith(mockApp);
    expect(getAuth).toHaveBeenCalledWith(mockApp);
    expect(getStorage).toHaveBeenCalledWith(mockApp);
    expect(state.firestore).toEqual({ id: "firestore" });
    expect(state.auth).toEqual({ id: "auth" });
    expect(state.storage).toEqual({ id: "storage" });
  });

  it("ブラウザが Messaging に対応していれば Messaging も初期化する", async () => {
    mockIsSupported.mockResolvedValue(true);

    initializeFirebaseIfConfigured();
    await flushPromises();

    expect(getMessaging).toHaveBeenCalledWith(mockApp);
    expect(getFirebaseState().messaging).toEqual({ id: "messaging" });
  });

  it("Messaging に対応していなければ Messaging は null のまま", async () => {
    mockIsSupported.mockResolvedValue(false);

    initializeFirebaseIfConfigured();
    await flushPromises();

    expect(getMessaging).not.toHaveBeenCalled();
    expect(getFirebaseState().messaging).toBeNull();
  });

  it("対応判定の間に App が消えていれば Messaging を初期化しない", async () => {
    let resolveSupported: (supported: boolean) => void = () => {};
    mockIsSupported.mockReturnValue(
      new Promise<boolean>((resolve) => {
        resolveSupported = resolve;
      }),
    );

    initializeFirebaseIfConfigured();
    setFirebaseState({ app: null });
    resolveSupported(true);
    await flushPromises();

    expect(getMessaging).not.toHaveBeenCalled();
  });
});
