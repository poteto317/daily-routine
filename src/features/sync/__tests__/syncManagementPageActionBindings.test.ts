import { createSyncManagementPageActionBindings } from "../syncManagementPageActionBindings";

describe("syncManagementPageActionBindings", () => {
  it("sync action 用の依存を束ねる", () => {
    const setSnapshots = jest.fn();

    expect(
      createSyncManagementPageActionBindings({
        setSnapshots,
      }),
    ).toEqual({
      setSnapshots,
    });
  });
});
