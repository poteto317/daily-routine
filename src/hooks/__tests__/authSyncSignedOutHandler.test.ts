import { createSignedOutAuthStateHandler } from "@/hooks/authSyncSignedOutHandler";

describe("authSyncSignedOutHandler", () => {
  it("未認証時の state をまとめてリセットする", () => {
    const setUser = jest.fn();
    const setIsAdmin = jest.fn();
    const setLoading = jest.fn();
    const setIsAdminLoading = jest.fn();
    const setCurrentUserId = jest.fn();

    const handleSignedOutUser = createSignedOutAuthStateHandler({
      setUser,
      setIsAdmin,
      setLoading,
      setIsAdminLoading,
      setCurrentUserId,
    });

    handleSignedOutUser();

    expect(setCurrentUserId).toHaveBeenCalledWith(null);
    expect(setIsAdmin).toHaveBeenCalledWith(false);
    expect(setUser).toHaveBeenCalledWith(null);
    expect(setLoading).toHaveBeenCalledWith(false);
    expect(setIsAdminLoading).toHaveBeenCalledWith(false);
  });
});
