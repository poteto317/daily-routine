import { createTodoListSelectionStateResult } from "../todoListSelectionStateResult";

describe("createTodoListSelectionStateResult", () => {
  it("selection state の公開 shape を返す", () => {
    expect(
      createTodoListSelectionStateResult({
        effectiveSelectedId: "list-1",
      }),
    ).toEqual({
      effectiveSelectedId: "list-1",
    });
  });
});
