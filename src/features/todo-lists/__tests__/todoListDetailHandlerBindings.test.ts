import { createTodoListDetailHandlerBindings } from "../todoListDetailHandlerBindings";

describe("todoListDetailHandlerBindings", () => {
  it("detail handler 用の依存を束ねる", () => {
    const list = {
      id: "list-1",
      title: "Inbox",
      items: [],
      createdAt: "2026-03-07T00:00:00.000Z",
      updatedAt: "2026-03-07T00:00:00.000Z",
    };
    const persist = jest.fn();

    expect(
      createTodoListDetailHandlerBindings({
        list,
        lists: [list],
        persist,
      }),
    ).toEqual({
      list,
      lists: [list],
      persist,
    });
  });
});
