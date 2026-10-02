import * as helpers from "../helpers";

describe("routine pages helpers re-exports", () => {
  it("all helpers and presentation models are properly exported", () => {
    expect(helpers.CATEGORY_FILTER_TEXT).toBeDefined();
    expect(helpers.getCategoryFilterButtonClassName).toBeDefined();
    expect(helpers.DAYS).toBeDefined();
    expect(helpers.DAY_SELECTOR_TEXT).toBeDefined();
    expect(helpers.getDaySelectorButtonClassName).toBeDefined();
    expect(helpers.createHomeContentViewModel).toBeDefined();
    expect(helpers.createHomePageViewModel).toBeDefined();
    expect(helpers.HOME_PAGE_TEXT).toBeDefined();
    expect(helpers.HOME_TOOLBAR_TEXT).toBeDefined();
    expect(helpers.getAddButtonLabel).toBeDefined();
    expect(helpers.getEmptyMessage).toBeDefined();
    expect(helpers.ROUTINE_EMPTY_STATE_TEXT).toBeDefined();
  });
});
