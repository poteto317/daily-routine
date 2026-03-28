import { createTodoListSelectedIdValueResult } from "../todoListSelectedIdValueResult";

describe("createTodoListSelectedIdValueResult", () => {
  it("selected id value の公開 shape を返す", () => {
    expect(
      createTodoListSelectedIdValueResult({
        effectiveSelectedId: "list-1",
        selectedId: "missing",
      }),
    ).toEqual({
      effectiveSelectedId: "list-1",
      selectedId: "missing",
    });
  });
});
