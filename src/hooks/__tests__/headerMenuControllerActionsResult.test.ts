import { createHeaderMenuControllerActionsResult } from "@/hooks/headerMenuControllerActionsResult";

describe("createHeaderMenuControllerActionsResult", () => {
  it("menu action の公開 shape を組み立てる", async () => {
    const filteredMenuItems = [{ id: "settings" }] as never;
    const onLogoutAction = jest.fn().mockResolvedValue(undefined);

    expect(
      createHeaderMenuControllerActionsResult({
        filteredMenuItems,
        onLogoutAction,
      }),
    ).toEqual({
      filteredMenuItems,
      onLogoutAction,
    });
  });
});
