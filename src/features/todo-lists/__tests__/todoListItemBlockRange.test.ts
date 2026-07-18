import { getItemBlockEndIndex } from "../todoListItemBlockRange";
import type { TodoListItem } from "../types";

const item = (id: string, indent: number): TodoListItem => ({
  id,
  title: id,
  isCompleted: false,
  createdAt: "",
  indent,
});

describe("getItemBlockEndIndex", () => {
  const items: TodoListItem[] = [
    item("A", 0),
    item("B", 1),
    item("C", 2),
    item("D", 1),
    item("E", 0),
  ];

  it("後続に自分より深いインデントのアイテムが連続する間はブロックに含める", () => {
    // A(0) → B(1) → C(2) はすべてAより深いので、Aのブロックは D(1) の手前まで
    expect(getItemBlockEndIndex(items, 0)).toBe(4);
  });

  it("自分より深いインデントの後続アイテムがない場合は自分の直後を返す", () => {
    expect(getItemBlockEndIndex(items, 3)).toBe(4); // D(1) → E(0) はDより浅い
    expect(getItemBlockEndIndex(items, 4)).toBe(5); // E(0) は末尾
  });

  it("子孫の途中から呼び出した場合はその子孫自身を起点としたブロックを返す", () => {
    expect(getItemBlockEndIndex(items, 1)).toBe(3); // B(1) → C(2)はBより深い、D(1)はBと同じ深さで終了
  });

  it("範囲外のインデックスはそのまま返す", () => {
    expect(getItemBlockEndIndex(items, -1)).toBe(-1);
    expect(getItemBlockEndIndex(items, 10)).toBe(10);
  });

  it("indentが未設定のアイテムは0として扱う", () => {
    const noIndent: TodoListItem[] = [
      { id: "X", title: "X", isCompleted: false, createdAt: "" },
      { id: "Y", title: "Y", isCompleted: false, createdAt: "", indent: 1 },
      { id: "Z", title: "Z", isCompleted: false, createdAt: "" },
    ];
    expect(getItemBlockEndIndex(noIndent, 0)).toBe(2);
  });

  it("1要素のみのリストはその直後のインデックスを返す", () => {
    expect(getItemBlockEndIndex([item("solo", 0)], 0)).toBe(1);
  });
});
