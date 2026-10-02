import * as helpers from "../helpers";

describe("weight-tracker page helpers re-exports", () => {
  it("all presentation and query helpers are properly exported and executable", () => {
    // constants
    expect(helpers.WEIGHT_FORM_CANCEL_LABEL).toBeDefined();
    expect(helpers.WEIGHT_FORM_NOTES_LABEL).toBeDefined();
    expect(helpers.WEIGHT_FORM_NOTES_PLACEHOLDER).toBeDefined();
    expect(helpers.WEIGHT_FORM_SAVE_LABEL).toBeDefined();
    expect(helpers.WEIGHT_FORM_WEIGHT_LABEL).toBeDefined();
    expect(helpers.WEIGHT_FORM_WEIGHT_PLACEHOLDER).toBeDefined();
    expect(helpers.WEIGHT_HISTORY_DELETE_ARIA_LABEL).toBeDefined();
    expect(helpers.WEIGHT_HISTORY_NOTE_PREFIX).toBeDefined();
    expect(helpers.WEIGHT_HISTORY_TODAY_BADGE).toBeDefined();
    expect(helpers.WEIGHT_TRACKER_HISTORY_LIST_TEXT).toBeDefined();
    expect(helpers.WEIGHT_TRACKER_MESSAGES).toBeDefined();
    expect(helpers.WEIGHT_TRACKER_PAGE_TEXT).toBeDefined();
    expect(helpers.WEIGHT_TODAY_ADD_LABEL).toBeDefined();
    expect(helpers.WEIGHT_TODAY_EDIT_LABEL).toBeDefined();
    expect(helpers.WEIGHT_TODAY_EMPTY_LABEL).toBeDefined();
    expect(helpers.WEIGHT_TODAY_NOTE_PREFIX).toBeDefined();
    expect(helpers.WEIGHT_TODAY_TITLE).toBeDefined();
    expect(helpers.WEIGHT_TODAY_UPDATED_AT_LABEL).toBeDefined();

    // functions execution
    expect(helpers.formatWeightChange(0.5)).toBeDefined();
    expect(helpers.formatWeightHistoryNote("memo")).toBeDefined();
    expect(helpers.getWeightChangeClassName(0.5)).toBeDefined();
    expect(helpers.calculateWeightChange(65, 64)).toBeDefined();
    expect(helpers.formatWeightDate("2026-03-15")).toBeDefined();
    expect(helpers.getRecentWeightRecords({}, 5)).toBeDefined();
    expect(helpers.getTodayDateKey()).toBeDefined();
    expect(helpers.formatWeightTodayNote("memo")).toBeDefined();
    expect(helpers.getWeightTodayEditButtonLabel(true)).toBeDefined();
  });
});
