import {
  getBlockAnchorIndices,
  splitIntoItemBlocks,
} from "../todoListItemBlocks";
import type { TodoListItem } from "../types";

const item = (id: string, indent: number): TodoListItem => ({
  id,
  title: id,
  isCompleted: false,
  createdAt: "",
  indent,
});

describe("splitIntoItemBlocks", () => {
  it("空配列は空配列を返す", () => {
    expect(splitIntoItemBlocks([])).toEqual([]);
  });

  it("インデントのないフラットな配列は各アイテムが1件ずつのブロックになる", () => {
    const items = [item("A", 0), item("B", 0), item("C", 0)];

    const blocks = splitIntoItemBlocks(items);

    expect(blocks.map((block) => block.map((i) => i.id))).toEqual([
      ["A"],
      ["B"],
      ["C"],
    ]);
  });

  it("親＋子孫は1つのブロックにまとまる", () => {
    const items = [
      item("parent1", 0),
      item("child1", 1),
      item("grandchild1", 2),
      item("parent2", 0),
      item("child2", 1),
    ];

    const blocks = splitIntoItemBlocks(items);

    expect(blocks.map((block) => block.map((i) => i.id))).toEqual([
      ["parent1", "child1", "grandchild1"],
      ["parent2", "child2"],
    ]);
  });

  it("先頭アイテムがindent>0（親が配列に含まれない孤立した子）でも、その子自身を起点としたブロックになる", () => {
    const items = [item("orphan-child", 1), item("sibling", 1)];

    const blocks = splitIntoItemBlocks(items);

    // orphan-childのインデント(1)以下のsiblingが来た時点でブロックが区切られる
    expect(blocks.map((block) => block.map((i) => i.id))).toEqual([
      ["orphan-child"],
      ["sibling"],
    ]);
  });

  it("元の配列を変更しない（イミュータブル）", () => {
    const items = [item("A", 0), item("B", 1)];
    const copy = [...items];

    splitIntoItemBlocks(items);

    expect(items.map((i) => i.id)).toEqual(copy.map((i) => i.id));
  });
});

describe("getBlockAnchorIndices", () => {
  it("空配列は空集合を返す", () => {
    expect(getBlockAnchorIndices([])).toEqual(new Set());
  });

  it("インデントのないフラットな配列は全インデックスがアンカーになる", () => {
    const items = [item("A", 0), item("B", 0), item("C", 0)];

    expect(getBlockAnchorIndices(items)).toEqual(new Set([0, 1, 2]));
  });

  it("親＋子孫の子孫部分のインデックスはアンカーに含まれない", () => {
    const items = [
      item("parent1", 0),
      item("child1", 1),
      item("grandchild1", 2),
      item("parent2", 0),
      item("child2", 1),
    ];

    // parent1=0, child1=1, grandchild1=2, parent2=3, child2=4
    // アンカーは各ブロックの先頭である 0 と 3 のみ
    expect(getBlockAnchorIndices(items)).toEqual(new Set([0, 3]));
  });

  it("先頭アイテムがindent>0（孤立した子）でも自身を起点としたアンカーになる", () => {
    const items = [item("orphan-child", 1), item("sibling", 1)];

    expect(getBlockAnchorIndices(items)).toEqual(new Set([0, 1]));
  });
});
