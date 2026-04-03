import { isItemCompleted } from "../todoListItemCompletedPredicate";
import { filterIncompleteItems } from "../todoListIncompleteItemsFilter";

jest.mock("../todoListItemCompletedPredicate", () => ({
  ...jest.requireActual("../todoListItemCompletedPredicate"),
  isItemCompleted: jest.fn(),
}));

describe("filterIncompleteItems", () => {
  beforeEach(() => {
    const real = jest.requireActual<
      typeof import("../todoListItemCompletedPredicate")
    >("../todoListItemCompletedPredicate");
    (isItemCompleted as jest.Mock).mockImplementation(real.isItemCompleted);
  });
  it("完了済みアイテムを除外する", () => {
    expect(
      filterIncompleteItems([
        {
          id: "item-1",
          title: "Open",
          isCompleted: false,
          createdAt: "2026-03-07T00:00:00.000Z",
        },
        {
          id: "item-2",
          title: "Done",
          isCompleted: true,
          createdAt: "2026-03-07T00:00:00.000Z",
        },
      ]),
    ).toEqual([expect.objectContaining({ id: "item-1" })]);
  });

  it("未完了のみなら全アイテムを返す", () => {
    const items = [
      {
        id: "item-1",
        title: "Open",
        isCompleted: false,
        createdAt: "2026-03-07T00:00:00.000Z",
      },
    ];

    expect(filterIncompleteItems(items)).toEqual(items);
  });

  it("空配列なら空配列を返す", () => {
    expect(filterIncompleteItems([])).toEqual([]);
  });

  it("filterIncompleteItems は isItemCompleted に委譲して完了判定を行う", () => {
    (isItemCompleted as jest.Mock).mockReturnValue(false);

    const items = [
      {
        id: "item-1",
        title: "Open",
        isCompleted: false,
        createdAt: "2026-03-07T00:00:00.000Z",
      },
    ];
    filterIncompleteItems(items);

    expect(isItemCompleted).toHaveBeenCalledWith(
      expect.objectContaining({ id: "item-1" }),
    );
  });
});
