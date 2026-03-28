import { createWorkTrackerSessionVisibilityStateResult } from "../page/workTrackerSessionVisibilityStateResult";

describe("createWorkTrackerSessionVisibilityStateResult", () => {
  it("visibility state の公開 shape を返す", () => {
    const setShowInputForm = jest.fn();
    const setShowTemplateDropdown = jest.fn();

    expect(
      createWorkTrackerSessionVisibilityStateResult({
        showInputForm: true,
        setShowInputForm,
        showTemplateDropdown: false,
        setShowTemplateDropdown,
      }),
    ).toEqual({
      showInputForm: true,
      setShowInputForm,
      showTemplateDropdown: false,
      setShowTemplateDropdown,
    });
  });
});
