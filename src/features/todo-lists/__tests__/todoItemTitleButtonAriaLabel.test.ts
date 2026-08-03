import { buildTodoItemTitleButtonAriaLabel } from "../todoItemTitleButtonAriaLabel";

describe("buildTodoItemTitleButtonAriaLabel", () => {
  it("未完了・非選択のとき「を完了にする」のみ", () => {
    expect(
      buildTodoItemTitleButtonAriaLabel({
        title: "牛乳を買う",
        isCompleted: false,
        isSelected: false,
      }),
    ).toBe("「牛乳を買う」を完了にする");
  });

  it("未完了・選択中のとき「を完了にする（選択中）」", () => {
    expect(
      buildTodoItemTitleButtonAriaLabel({
        title: "牛乳を買う",
        isCompleted: false,
        isSelected: true,
      }),
    ).toBe("「牛乳を買う」を完了にする（選択中）");
  });

  it("完了済み・非選択のとき「を未完了に戻す」のみ", () => {
    expect(
      buildTodoItemTitleButtonAriaLabel({
        title: "牛乳を買う",
        isCompleted: true,
        isSelected: false,
      }),
    ).toBe("「牛乳を買う」を未完了に戻す");
  });

  it("完了済み・選択中のとき「を未完了に戻す（選択中）」", () => {
    expect(
      buildTodoItemTitleButtonAriaLabel({
        title: "牛乳を買う",
        isCompleted: true,
        isSelected: true,
      }),
    ).toBe("「牛乳を買う」を未完了に戻す（選択中）");
  });

  it("タイトルが変わるとラベルにも反映される", () => {
    expect(
      buildTodoItemTitleButtonAriaLabel({
        title: "別のタスク",
        isCompleted: false,
        isSelected: false,
      }),
    ).toBe("「別のタスク」を完了にする");
  });
});
