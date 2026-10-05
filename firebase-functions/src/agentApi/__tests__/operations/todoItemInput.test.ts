/** @jest-environment node */
import {
  parseCreateItemInput,
  parseItemPatchInput,
  TODO_ITEM_CREATE_KEYS,
  TODO_ITEM_UPDATE_KEYS,
} from "../../operations/todo/todoItemInput";

describe("TODO_ITEM_CREATE_KEYS & TODO_ITEM_UPDATE_KEYS", () => {
  it("作成・更新キーの定義を検証する", () => {
    expect([...TODO_ITEM_CREATE_KEYS].sort()).toEqual(
      [
        "bgColor",
        "categoryId",
        "indent",
        "insertAfterIndex",
        "listId",
        "title",
      ].sort(),
    );
    expect([...TODO_ITEM_UPDATE_KEYS].sort()).toEqual(
      [
        "bgColor",
        "categoryId",
        "indent",
        "isCompleted",
        "listId",
        "moveToIndex",
        "title",
      ].sort(),
    );
  });
});

describe("parseCreateItemInput", () => {
  it("listId と title が必須で正しく解析する", () => {
    expect(
      parseCreateItemInput({
        listId: "l1",
        title: " 牛乳 ",
      }),
    ).toEqual({
      listId: "l1",
      fields: { title: "牛乳" },
      insertAfterIndex: undefined,
    });
  });

  it("すべてのオプションフィールド（bgColor, categoryId, indent, insertAfterIndex）を解析する", () => {
    expect(
      parseCreateItemInput({
        listId: "l1",
        title: "パン",
        bgColor: "bg-red-50",
        categoryId: "cat-1",
        indent: 2,
        insertAfterIndex: 0,
      }),
    ).toEqual({
      listId: "l1",
      fields: {
        title: "パン",
        bgColor: "bg-red-50",
        categoryId: "cat-1",
        indent: 2,
      },
      insertAfterIndex: 0,
    });
  });

  it("listId が欠落していると 400", () => {
    expect(() => parseCreateItemInput({ title: "パン" })).toThrow(
      expect.objectContaining({ status: 400, code: "invalid_field" }),
    );
  });

  it("title が欠落していると 400", () => {
    expect(() => parseCreateItemInput({ listId: "l1" })).toThrow(
      expect.objectContaining({ status: 400, code: "invalid_field" }),
    );
  });

  it("title が 500 文字を超えると 400", () => {
    expect(() =>
      parseCreateItemInput({ listId: "l1", title: "a".repeat(501) }),
    ).toThrow(expect.objectContaining({ status: 400, code: "invalid_field" }));
  });

  it("indent が負または 3 を超えると 400", () => {
    expect(() =>
      parseCreateItemInput({ listId: "l1", title: "t", indent: -1 }),
    ).toThrow(expect.objectContaining({ status: 400 }));
    expect(() =>
      parseCreateItemInput({ listId: "l1", title: "t", indent: 4 }),
    ).toThrow(expect.objectContaining({ status: 400 }));
  });
});

describe("parseItemPatchInput", () => {
  it("listId が必須で、指定フィールドをパッチとして抽出する", () => {
    expect(
      parseItemPatchInput({
        listId: "l1",
        title: "新タイトル",
        isCompleted: true,
      }),
    ).toEqual({
      listId: "l1",
      fields: { title: "新タイトル", isCompleted: true },
      moveToIndex: undefined,
    });
  });

  it("moveToIndex のみの更新も受け付ける", () => {
    expect(
      parseItemPatchInput({
        listId: "l1",
        moveToIndex: 3,
      }),
    ).toEqual({
      listId: "l1",
      fields: {},
      moveToIndex: 3,
    });
  });

  it("bgColor と categoryId の null（解除）指定を保持する", () => {
    expect(
      parseItemPatchInput({
        listId: "l1",
        bgColor: null,
        categoryId: null,
      }),
    ).toEqual({
      listId: "l1",
      fields: { bgColor: null, categoryId: null },
      moveToIndex: undefined,
    });
  });

  it("listId が欠落していると 400", () => {
    expect(() => parseItemPatchInput({ title: "新タイトル" })).toThrow(
      expect.objectContaining({ status: 400, code: "invalid_field" }),
    );
  });

  it("listId 以外に更新対象がない場合は 400 empty_patch", () => {
    expect(() => parseItemPatchInput({ listId: "l1" })).toThrow(
      expect.objectContaining({ status: 400, code: "empty_patch" }),
    );
  });
});
