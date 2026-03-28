import { createHeaderMenuActionBindingsResult } from "@/hooks/headerMenuActionBindingsResult";

describe("createHeaderMenuActionBindingsResult", () => {
  it("menu action binding の公開 shape を組み立てる", () => {
    const filteredMenuItems = [{ id: "settings" }] as never;
    const onLogoutAction = jest.fn();

    expect(
      createHeaderMenuActionBindingsResult({
        filteredMenuItems,
        onLogoutAction,
      }),
    ).toEqual({
      filteredMenuItems,
      onLogoutAction,
    });
  });
});
