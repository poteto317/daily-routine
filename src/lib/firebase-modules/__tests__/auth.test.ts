import { signInAnonymously, type Auth, type User } from "firebase/auth";
import { getAuthInstance, getOrCreateUser } from "../auth";
import { getFirebaseState } from "../state";

let mockIsFirebaseConfigured = true;

jest.mock("firebase/auth", () => ({
  signInAnonymously: jest.fn(),
}));

jest.mock("../config", () => ({
  get isFirebaseConfigured() {
    return mockIsFirebaseConfigured;
  },
}));

jest.mock("../state", () => ({
  getFirebaseState: jest.fn(),
}));

const mockSignInAnonymously = signInAnonymously as jest.MockedFunction<
  typeof signInAnonymously
>;
const mockGetFirebaseState = getFirebaseState as jest.MockedFunction<
  typeof getFirebaseState
>;

/** auth だけを差し替えた Firebase の状態にする */
const useAuthState = (auth: Auth | null) => {
  mockGetFirebaseState.mockReturnValue({
    app: null,
    messaging: null,
    firestore: null,
    auth,
  });
};

describe("getOrCreateUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsFirebaseConfigured = true;
  });

  it("Firebase の設定が不完全なら configuration-not-found を投げる", async () => {
    mockIsFirebaseConfigured = false;
    useAuthState({ currentUser: null } as Auth);

    await expect(getOrCreateUser()).rejects.toMatchObject({
      name: "FirebaseError",
      code: "auth/configuration-not-found",
      message: "クラウド設定が不完全です",
    });
    expect(mockSignInAnonymously).not.toHaveBeenCalled();
  });

  it("Auth が未初期化なら auth-not-available を投げる", async () => {
    useAuthState(null);

    await expect(getOrCreateUser()).rejects.toMatchObject({
      name: "FirebaseError",
      code: "auth-not-available",
      message: "認証機能が初期化されていません",
    });
  });

  it("ログイン済みなら現在のユーザーを返し、匿名ログインしない", async () => {
    const currentUser = { uid: "existing" } as User;
    useAuthState({ currentUser } as Auth);

    await expect(getOrCreateUser()).resolves.toBe(currentUser);
    expect(mockSignInAnonymously).not.toHaveBeenCalled();
  });

  it("未ログインなら匿名ログインして、そのユーザーを返す", async () => {
    const auth = { currentUser: null } as Auth;
    const newUser = { uid: "anonymous" } as User;
    useAuthState(auth);
    mockSignInAnonymously.mockResolvedValue({ user: newUser } as Awaited<
      ReturnType<typeof signInAnonymously>
    >);

    await expect(getOrCreateUser()).resolves.toBe(newUser);
    expect(mockSignInAnonymously).toHaveBeenCalledWith(auth);
  });

  it("匿名ログインの失敗はそのまま投げる", async () => {
    useAuthState({ currentUser: null } as Auth);
    const error = new Error("auth/network-request-failed");
    mockSignInAnonymously.mockRejectedValue(error);

    await expect(getOrCreateUser()).rejects.toBe(error);
  });
});

describe("getAuthInstance", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("初期化済みの Auth を返す", () => {
    const auth = { currentUser: null } as Auth;
    useAuthState(auth);

    expect(getAuthInstance()).toBe(auth);
  });

  it("Auth が未初期化なら auth-not-available を投げる", () => {
    useAuthState(null);

    expect(() => getAuthInstance()).toThrow(
      expect.objectContaining({
        name: "FirebaseError",
        code: "auth-not-available",
      }),
    );
  });
});
