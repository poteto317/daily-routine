import { renderHook } from "@testing-library/react";
// useAuth は @/features/auth から直接 import しない。
// この setup より先に読み込むと jest.mock の登録前に firebase/auth の
// 実モジュールがバインドされ、モックが効かなくなるため。
import {
  renderUseAuthHook,
  setupAuthTestDefaults,
  useAuth,
  withMockAuthInstance,
} from "./AuthContext.test-setup";

describe("AuthContext useAuth", () => {
  beforeEach(() => {
    setupAuthTestDefaults();
  });

  it("AuthProviderの外部で使用するとエラーをスローする", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow("useAuth must be used within an AuthProvider");

    consoleError.mockRestore();
  });

  it("AuthProviderの内部で使用できる", () => {
    withMockAuthInstance();

    const { result } = renderUseAuthHook();

    expect(result.current).toBeDefined();
    expect(result.current.user).toBeNull();
    expect(typeof result.current.signIn).toBe("function");
    expect(typeof result.current.signUp).toBe("function");
    expect(typeof result.current.signOut).toBe("function");
  });
});
