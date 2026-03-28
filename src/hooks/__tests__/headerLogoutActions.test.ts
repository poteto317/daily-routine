import { runHeaderLogout } from "@/hooks/headerLogoutActions";

describe("headerLogoutActions", () => {
  it("confirm が false なら signOut しない", async () => {
    const signOut = jest.fn().mockResolvedValue(undefined);
    const closeMenu = jest.fn();
    const alertError = jest.fn();

    await expect(
      runHeaderLogout({
        confirmLogout: () => false,
        signOut,
        closeMenu,
        alertError,
      }),
    ).resolves.toBe(false);

    expect(signOut).not.toHaveBeenCalled();
    expect(closeMenu).not.toHaveBeenCalled();
    expect(alertError).not.toHaveBeenCalled();
  });

  it("confirm 後に signOut 成功なら closeMenu する", async () => {
    const signOut = jest.fn().mockResolvedValue(undefined);
    const closeMenu = jest.fn();
    const alertError = jest.fn();

    await expect(
      runHeaderLogout({
        confirmLogout: () => true,
        signOut,
        closeMenu,
        alertError,
      }),
    ).resolves.toBe(true);

    expect(signOut).toHaveBeenCalledTimes(1);
    expect(closeMenu).toHaveBeenCalledTimes(1);
    expect(alertError).not.toHaveBeenCalled();
  });

  it("signOut 失敗時は alertError を呼ぶ", async () => {
    const signOut = jest.fn().mockRejectedValue(new Error("fail"));
    const closeMenu = jest.fn();
    const alertError = jest.fn();

    await expect(
      runHeaderLogout({
        confirmLogout: () => true,
        signOut,
        closeMenu,
        alertError,
      }),
    ).resolves.toBe(false);

    expect(closeMenu).not.toHaveBeenCalled();
    expect(alertError).toHaveBeenCalledTimes(1);
  });
});
