import { getApiKeyStatusLabel } from "../helpers";
import texts from "../locales/ja.json";

describe("getApiKeyStatusLabel", () => {
  it("null は確認中、true は発行済み、false は未発行", () => {
    expect(getApiKeyStatusLabel(null)).toBe(texts.statusLoading);
    expect(getApiKeyStatusLabel(true)).toBe(texts.statusIssued);
    expect(getApiKeyStatusLabel(false)).toBe(texts.statusNone);
  });
});
