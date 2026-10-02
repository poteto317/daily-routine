import {
  getWeightChangeClassName,
  formatWeightChange,
  formatWeightHistoryNote,
} from "../weightHistoryPresentation";
import {
  getWeightTodayEditButtonLabel,
  formatWeightTodayNote,
  WEIGHT_TODAY_EDIT_LABEL,
  WEIGHT_TODAY_ADD_LABEL,
} from "../weightTodayPresentation";

describe("weight tracker presentation helpers", () => {
  describe("weightHistoryPresentation", () => {
    it("getWeightChangeClassName returns red for increase, green for decrease, gray for unchanged", () => {
      expect(getWeightChangeClassName(0.5)).toContain("text-red-600");
      expect(getWeightChangeClassName(-0.5)).toContain("text-green-600");
      expect(getWeightChangeClassName(0)).toContain("text-gray-600");
    });

    it("formatWeightChange formats positive, negative and zero weights", () => {
      expect(formatWeightChange(0.5)).toBe("+0.5 kg");
      expect(formatWeightChange(-0.5)).toBe("-0.5 kg");
      expect(formatWeightChange(0)).toBe("0.0 kg");
    });

    it("formatWeightHistoryNote adds note prefix", () => {
      expect(formatWeightHistoryNote("夕食後")).toContain("夕食後");
    });
  });

  describe("weightTodayPresentation", () => {
    it("getWeightTodayEditButtonLabel returns edit label when hasRecord is true, add label when false", () => {
      expect(getWeightTodayEditButtonLabel(true)).toBe(WEIGHT_TODAY_EDIT_LABEL);
      expect(getWeightTodayEditButtonLabel(false)).toBe(WEIGHT_TODAY_ADD_LABEL);
    });

    it("formatWeightTodayNote adds note prefix", () => {
      expect(formatWeightTodayNote("朝起きてすぐ")).toContain("朝起きてすぐ");
    });
  });
});
