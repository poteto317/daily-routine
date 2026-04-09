import type { UserCredential } from "firebase/auth";
import {
  mockCreateUserWithEmailAndPassword,
  mockSignInWithEmailAndPassword,
  renderUseAuthHook,
  setupAuthTestDefaults,
  withMockAuthInstance,
} from "./AuthContext.test-setup";

describe("AuthContext signInAsTestUser", () => {
  beforeEach(() => {
    setupAuthTestDefaults();
  });

  it("既存のテストアカウントでログインできる", async () => {
    const mockAuth = withMockAuthInstance();
    mockSignInWithEmailAndPassword.mockResolvedValue({} as UserCredential);

    const { result } = renderUseAuthHook();
    await result.current.signInAsTestUser();

    expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
      mockAuth,
      "test@example.com",
      "test123456",
    );
  });

  it("テストアカウントが存在しない場合は新規作成する", async () => {
    const mockAuth = withMockAuthInstance();
    mockSignInWithEmailAndPassword.mockRejectedValue({
      code: "auth/user-not-found",
    });
    mockCreateUserWithEmailAndPassword.mockResolvedValue({} as UserCredential);

    const { result } = renderUseAuthHook();
    await result.current.signInAsTestUser();

    expect(mockSignInWithEmailAndPassword).toHaveBeenCalled();
    expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
      mockAuth,
      "test@example.com",
      "test123456",
    );
  });
});
