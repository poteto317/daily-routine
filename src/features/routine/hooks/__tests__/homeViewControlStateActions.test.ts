import { createInitialHomeViewControlState } from "../homeViewControlStateActions";

describe("homeViewControlStateActions", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("保存済みの filter/edit 状態から初期 state を構築する（選択中のタブは含めない）", () => {
    localStorage.setItem("filterCategory", "health");
    localStorage.setItem("isEditMode", "false");
    localStorage.setItem("viewMode", "3");

    expect(createInitialHomeViewControlState()).toEqual({
      filterCategory: "health",
      isEditMode: false,
    });
  });

  it("保存が無ければ filter は all、編集モードは true", () => {
    expect(createInitialHomeViewControlState()).toEqual({
      filterCategory: "all",
      isEditMode: true,
    });
  });
});
