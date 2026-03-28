import { createTodoListSelectedIdStoreValueResult } from "../todoListSelectedIdStoreValueResult";

describe("createTodoListSelectedIdStoreValueResult", () => {
  it("selectedId の公開 shape を返す", () => {
    expect(
      createTodoListSelectedIdStoreValueResult({
        selectedId: "list-1",
      }),
    ).toEqual({
      selectedId: "list-1",
    });
  });
});
