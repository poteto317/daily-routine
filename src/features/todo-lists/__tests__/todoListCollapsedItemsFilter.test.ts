import { filterCollapsedItems } from "../todoListCollapsedItemsFilter";
import { getItemIndentLevel } from "../todoListItemIndentLevel";
import type { TodoListItem } from "../types";

jest.mock("../todoListItemIndentLevel", () => ({
  ...jest.requireActual("../todoListItemIndentLevel"),
  getItemIndentLevel: jest.fn(),
}));

const item = (
  id: string,
  indent: number,
  isCompleted = false,
): TodoListItem => ({
  id,
  title: id,
  isCompleted,
  createdAt: "",
  indent,
});

describe("filterCollapsedItems", () => {
  const items: TodoListItem[] = [
    item("A", 0),
    item("B", 1),
    item("C", 2),
    item("D", 1),
    item("E", 0),
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // デフォルトは実装に委譲（各テストで上書き可能）
    const real = jest.requireActual<
      typeof import("../todoListItemIndentLevel")
    >("../todoListItemIndentLevel");
    (getItemIndentLevel as jest.Mock).mockImplementation(
      real.getItemIndentLevel,
    );
  });

  it("collapsedItemIds が空なら全アイテムをそのまま返す", () => {
    expect(filterCollapsedItems(items, new Set())).toEqual(items);
  });

  it("親を折りたたむと子孫が全て非表示になる", () => {
    const result = filterCollapsedItems(items, new Set(["A"]));
    expect(result.map((entry) => entry.id)).toEqual(["A", "E"]);
  });

  it("中間の親を折りたたむとその子のみ非表示になる", () => {
    const result = filterCollapsedItems(items, new Set(["B"]));
    expect(result.map((entry) => entry.id)).toEqual(["A", "B", "D", "E"]);
  });

  it("複数の親を同時に折りたためる", () => {
    const result = filterCollapsedItems(items, new Set(["A", "E"]));
    expect(result.map((entry) => entry.id)).toEqual(["A", "E"]);
  });

  it("子がいないアイテムを折りたたんでも影響がない", () => {
    const result = filterCollapsedItems(items, new Set(["C"]));
    expect(result.map((entry) => entry.id)).toEqual(["A", "B", "C", "D", "E"]);
  });

  it("3階層ネストを折りたたむと全子孫が非表示になる", () => {
    const deep: TodoListItem[] = [
      item("root", 0),
      item("child", 1),
      item("grandchild", 2),
      item("great", 3),
      item("sibling", 0),
    ];
    const result = filterCollapsedItems(deep, new Set(["root"]));
    expect(result.map((entry) => entry.id)).toEqual(["root", "sibling"]);
  });

  it("indent が未設定のアイテムは 0 として扱う", () => {
    const noIndent: TodoListItem[] = [
      { id: "P", title: "P", isCompleted: false, createdAt: "" },
      { id: "C", title: "C", isCompleted: false, createdAt: "", indent: 1 },
    ];
    const result = filterCollapsedItems(noIndent, new Set(["P"]));
    expect(result.map((entry) => entry.id)).toEqual(["P"]);
  });

  it("indent レベルの取得を getItemIndentLevel に委譲する", () => {
    const twoItems = [item("X", 0), item("Y", 1)];
    filterCollapsedItems(twoItems, new Set(["X"]));

    expect(getItemIndentLevel).toHaveBeenCalledWith(twoItems[0]);
    expect(getItemIndentLevel).toHaveBeenCalledWith(twoItems[1]);
  });

  it("getItemIndentLevel が返す値に基づいて子孫を除外する", () => {
    // indent プロパティに関係なく getItemIndentLevel の戻り値で判定する
    const twoItems = [item("P", 0), item("C", 0)];
    (getItemIndentLevel as jest.Mock)
      .mockReturnValueOnce(0) // P
      .mockReturnValueOnce(2); // C → P の子として扱われる

    const result = filterCollapsedItems(twoItems, new Set(["P"]));
    expect(result.map((i) => i.id)).toEqual(["P"]);
  });
});
