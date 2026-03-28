import { renderHook } from "@testing-library/react";
import { useAuth } from "@/features/auth";
import {
  renderUseAuthHook,
  setupAuthTestDefaults,
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
