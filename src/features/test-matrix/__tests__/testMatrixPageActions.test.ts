import { createTestMatrixPageActions } from "../testMatrixPageActions";

describe("testMatrixPageActions", () => {
  it("handleCollapseAll が categories を閉じ込めて base action に渡す", () => {
    const categories = [
      {
        id: "auth",
        title: "認証",
        items: [],
      },
    ];
    const handleCollapseAllBase = jest.fn();

    const actions = createTestMatrixPageActions({
      categories,
      handleCollapseAllBase,
    });

    actions.handleCollapseAll();

    expect(handleCollapseAllBase).toHaveBeenCalledWith(categories);
  });
});
