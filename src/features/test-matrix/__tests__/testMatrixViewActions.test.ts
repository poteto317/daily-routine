import {
  createCollapseAllState,
  toggleCollapsedCategoryId,
} from "../testMatrixViewActions";

describe("testMatrixViewActions", () => {
  const categories = [
    {
      id: "auth",
      title: "認証",
      items: [],
    },
  ];

  it("折りたたみ state を切り替える", () => {
    const collapsed = toggleCollapsedCategoryId(new Set<string>(), "auth");

    expect(collapsed.has("auth")).toBe(true);
    expect(toggleCollapsedCategoryId(collapsed, "auth").size).toBe(0);
    expect(createCollapseAllState(false, categories)).toEqual({
      collapseAll: true,
      collapsedIds: new Set(["auth"]),
    });
    expect(createCollapseAllState(true, categories)).toEqual({
      collapseAll: false,
      collapsedIds: new Set(),
    });
  });
});
