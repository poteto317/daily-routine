import { act, renderHook } from "@testing-library/react";
import { runHeaderLogout } from "@/hooks/headerLogoutActions";
import { createHeaderLogoutResult } from "@/hooks/headerLogoutResult";
import { useHeaderLogout } from "@/hooks/useHeaderLogout";

jest.mock("@/hooks/headerLogoutActions", () => ({
  runHeaderLogout: jest.fn(),
}));

jest.mock("@/hooks/headerLogoutResult", () => ({
  createHeaderLogoutResult: jest.fn(),
}));

const mockRunHeaderLogout = runHeaderLogout as jest.MockedFunction<
  typeof runHeaderLogout
>;
const mockCreateHeaderLogoutResult =
  createHeaderLogoutResult as jest.MockedFunction<
    typeof createHeaderLogoutResult
  >;

describe("useHeaderLogout", () => {
  beforeEach(() => {
    mockCreateHeaderLogoutResult.mockImplementation((args) => args);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it("handleLogout を result helper に委譲し、その callback から helper を呼ぶ", async () => {
    const signOut = jest.fn().mockResolvedValue(undefined);
    const closeMenu = jest.fn();
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
    const alertSpy = jest
      .spyOn(window, "alert")
      .mockImplementation(() => undefined);
    mockRunHeaderLogout.mockResolvedValue(true);

    const { result } = renderHook(() =>
      useHeaderLogout({ signOut, closeMenu }),
    );

    expect(mockCreateHeaderLogoutResult).toHaveBeenCalledWith({
      handleLogout: expect.any(Function),
    });

    await act(async () => {
      await result.current.handleLogout();
    });

    expect(mockRunHeaderLogout).toHaveBeenCalledWith({
      confirmLogout: expect.any(Function),
      signOut,
      closeMenu,
      alertError: expect.any(Function),
    });

    const params = mockRunHeaderLogout.mock.calls[0][0];
    expect(params.confirmLogout()).toBe(true);
    params.alertError();
    expect(confirmSpy).toHaveBeenCalledWith("ログアウトしますか？");
    expect(alertSpy).toHaveBeenCalledWith("ログアウトに失敗しました");
  });
});
