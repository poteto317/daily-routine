import { createTodoListEffectiveSelectedIdResult } from "../todoListEffectiveSelectedIdResult";

describe("createTodoListEffectiveSelectedIdResult", () => {
  it("effective selected id の公開 shape を返す", () => {
    expect(
      createTodoListEffectiveSelectedIdResult({
        effectiveSelectedId: "list-1",
      }),
    ).toEqual({
      effectiveSelectedId: "list-1",
    });
  });
});
