import { createTodoListDetailProgressResult } from "../todoListDetailProgressResult";

describe("createTodoListDetailProgressResult", () => {
  it("progress の公開 shape を返す", () => {
    expect(
      createTodoListDetailProgressResult({
        progress: { completed: 1, total: 2, percentage: 50 },
      }),
    ).toEqual({
      progress: { completed: 1, total: 2, percentage: 50 },
    });
  });

  it("0件（total=0）でも shape をそのまま返す", () => {
    expect(
      createTodoListDetailProgressResult({
        progress: { completed: 0, total: 0, percentage: 0 },
      }),
    ).toEqual({
      progress: { completed: 0, total: 0, percentage: 0 },
    });
  });

  it("全完了（percentage=100）も shape をそのまま返す", () => {
    expect(
      createTodoListDetailProgressResult({
        progress: { completed: 3, total: 3, percentage: 100 },
      }),
    ).toEqual({
      progress: { completed: 3, total: 3, percentage: 100 },
    });
  });
});
