import * as helpers from "../helpers";

describe("settings helpers re-exports", () => {
  it("all helpers are exported", () => {
    expect(helpers.THEME_OPTIONS).toBeDefined();
    expect(helpers.SYNC_ACTIONS).toBeDefined();
    expect(helpers.getSyncingStatusLabel).toBeDefined();
  });
});
