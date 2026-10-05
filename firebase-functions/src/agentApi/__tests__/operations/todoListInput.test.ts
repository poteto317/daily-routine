/** @jest-environment node */
import {
  parseCreateListInput,
  parseListPatchInput,
  TODO_LIST_KEYS,
} from "../../operations/todo/todoListInput";

describe("TODO_LIST_KEYS", () => {
  it("許可された 5 つのキーを含む", () => {
    expect([...TODO_LIST_KEYS].sort()).toEqual(
      [
        "addItemPosition",
        "defaultItemBgColor",
        "hideCompleted",
        "isHidden",
        "title",
      ].sort(),
    );
  });
});

describe("parseCreateListInput", () => {
  it("title 必須で、前後の空白を除去して返す", () => {
    expect(parseCreateListInput({ title: "  買い物リスト  " })).toEqual({
      title: "買い物リスト",
    });
  });

  it("任意のオプションフィールドを正しく解析する", () => {
    const input = {
      title: "タスク",
      addItemPosition: "first",
      defaultItemBgColor: "bg-blue-50",
      isHidden: true,
      hideCompleted: false,
    };
    expect(parseCreateListInput(input)).toEqual({
      title: "タスク",
      addItemPosition: "first",
      defaultItemBgColor: "bg-blue-50",
      isHidden: true,
      hideCompleted: false,
    });
  });

  it("title が未指定の場合は 400 invalid_field", () => {
    expect(() => parseCreateListInput({})).toThrow(
      expect.objectContaining({ status: 400, code: "invalid_field" }),
    );
  });

  it("title が空文字・空白のみの場合は 400 invalid_field", () => {
    expect(() => parseCreateListInput({ title: "" })).toThrow(
      expect.objectContaining({ status: 400, code: "invalid_field" }),
    );
    expect(() => parseCreateListInput({ title: "   " })).toThrow(
      expect.objectContaining({ status: 400, code: "invalid_field" }),
    );
  });

  it("title が 100 文字を超える場合は 400", () => {
    expect(() => parseCreateListInput({ title: "a".repeat(101) })).toThrow(
      expect.objectContaining({ status: 400, code: "invalid_field" }),
    );
  });

  it("addItemPosition が不正な値なら 400", () => {
    expect(() =>
      parseCreateListInput({ title: "t", addItemPosition: "invalid" }),
    ).toThrow(expect.objectContaining({ status: 400, code: "invalid_field" }));
  });
});

describe("parseListPatchInput", () => {
  it("指定されたフィールドのみをパッチとして返す", () => {
    expect(parseListPatchInput({ title: "新タイトル" })).toEqual({
      title: "新タイトル",
    });
    expect(
      parseListPatchInput({ defaultItemBgColor: null, isHidden: true }),
    ).toEqual({
      defaultItemBgColor: null,
      isHidden: true,
    });
  });

  it("空のオブジェクトは 400 empty_patch", () => {
    expect(() => parseListPatchInput({})).toThrow(
      expect.objectContaining({ status: 400, code: "empty_patch" }),
    );
  });
});
