import { createHeaderLogoutResult } from "@/hooks/headerLogoutResult";

describe("createHeaderLogoutResult", () => {
  it("handleLogout を公開 shape に載せる", () => {
    const handleLogout = jest
      .fn<Promise<void>, []>()
      .mockResolvedValue(undefined);

    expect(createHeaderLogoutResult({ handleLogout })).toEqual({
      handleLogout,
    });
  });
});
