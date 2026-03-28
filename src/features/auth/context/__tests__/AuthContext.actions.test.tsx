import { UserCredential } from "firebase/auth";
import {
  mockCreateUserWithEmailAndPassword,
  mockFirebaseSignOut,
  mockSignInAnonymously,
  mockSignInWithEmailAndPassword,
  renderUseAuthHook,
  setupAuthTestDefaults,
  withMockAuthInstance,
} from "./AuthContext.test-setup";

describe("AuthContext actions", () => {
  beforeEach(() => {
    setupAuthTestDefaults();
  });

  it("メールとパスワードでログインできる", async () => {
    const mockAuth = withMockAuthInstance();
    mockSignInWithEmailAndPassword.mockResolvedValue({} as UserCredential);

    const { result } = renderUseAuthHook();
    await result.current.signIn("test@example.com", "password123");

    expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
      mockAuth,
      "test@example.com",
      "password123",
    );
  });

  it("メールとパスワードで新規登録できる", async () => {
    const mockAuth = withMockAuthInstance();
    mockCreateUserWithEmailAndPassword.mockResolvedValue({} as UserCredential);

    const { result } = renderUseAuthHook();
    await result.current.signUp("test@example.com", "password123");

    expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
      mockAuth,
      "test@example.com",
      "password123",
    );
  });

  it("ログアウトできる", async () => {
    const mockAuth = withMockAuthInstance();
    mockFirebaseSignOut.mockResolvedValue();

    const { result } = renderUseAuthHook();
    await result.current.signOut();

    expect(mockFirebaseSignOut).toHaveBeenCalledWith(mockAuth);
  });

  it("匿名ログインできる", async () => {
    const mockAuth = withMockAuthInstance();
    mockSignInAnonymously.mockResolvedValue({} as UserCredential);

    const { result } = renderUseAuthHook();
    await result.current.signInAnonymous();

    expect(mockSignInAnonymously).toHaveBeenCalledWith(mockAuth);
  });
});
