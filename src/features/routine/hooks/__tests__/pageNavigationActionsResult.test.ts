import { createPageNavigationActionsResult } from "../pageNavigationActionsResult";

describe("createPageNavigationActionsResult", () => {
  it("onPageChangeAction を公開 shape に載せる", () => {
    const onPageChangeAction = jest.fn();

    expect(createPageNavigationActionsResult({ onPageChangeAction })).toEqual({
      onPageChangeAction,
    });
  });
});
