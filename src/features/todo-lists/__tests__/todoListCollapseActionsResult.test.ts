import { createTodoListCollapseActionsResult } from "../todoListCollapseActionsResult";

describe("createTodoListCollapseActionsResult", () => {
  it("toggleCollapseItem action の公開 shape を返す", () => {
    const toggleCollapseItem = jest.fn();

    expect(createTodoListCollapseActionsResult({ toggleCollapseItem })).toEqual(
      { toggleCollapseItem },
    );
  });
});
