import { createCollapseToggleHandler } from "../todoListCollapseToggleHandler";

describe("createCollapseToggleHandler", () => {
  it("空の Set にアイテムIDを追加する", () => {
    const setState = jest.fn();
    createCollapseToggleHandler(setState)("item-1");

    const updater = setState.mock.calls[0][0] as (
      prev: Set<string>,
    ) => Set<string>;
    expect(updater(new Set()).has("item-1")).toBe(true);
  });

  it("既に含まれているアイテムIDを削除する", () => {
    const setState = jest.fn();
    createCollapseToggleHandler(setState)("item-1");

    const updater = setState.mock.calls[0][0] as (
      prev: Set<string>,
    ) => Set<string>;
    expect(updater(new Set(["item-1"])).has("item-1")).toBe(false);
  });

  it("他のアイテムIDを保持したまま新規IDを追加する", () => {
    const setState = jest.fn();
    createCollapseToggleHandler(setState)("item-2");

    const updater = setState.mock.calls[0][0] as (
      prev: Set<string>,
    ) => Set<string>;
    const result = updater(new Set(["item-1"]));

    expect(result.has("item-1")).toBe(true);
    expect(result.has("item-2")).toBe(true);
  });

  it("IDを削除しても他のアイテムIDは残る", () => {
    const setState = jest.fn();
    createCollapseToggleHandler(setState)("item-1");

    const updater = setState.mock.calls[0][0] as (
      prev: Set<string>,
    ) => Set<string>;
    const result = updater(new Set(["item-1", "item-2"]));

    expect(result.has("item-1")).toBe(false);
    expect(result.has("item-2")).toBe(true);
  });

  it("前の Set を変更せず新しい Set を返す（immutable）", () => {
    const setState = jest.fn();
    createCollapseToggleHandler(setState)("item-1");

    const updater = setState.mock.calls[0][0] as (
      prev: Set<string>,
    ) => Set<string>;
    const prev = new Set<string>();
    const result = updater(prev);

    expect(prev).not.toBe(result);
    expect(prev.size).toBe(0);
  });

  it("setState を1回だけ呼び出す", () => {
    const setState = jest.fn();
    createCollapseToggleHandler(setState)("item-1");

    expect(setState).toHaveBeenCalledTimes(1);
  });

  it("異なるアイテムIDで複数回呼べる", () => {
    const setState = jest.fn();
    const handler = createCollapseToggleHandler(setState);

    handler("item-1");
    handler("item-2");
    handler("item-3");

    expect(setState).toHaveBeenCalledTimes(3);
  });

  it("同じIDで2回呼ぶとトグルになる（追加 → 削除）", () => {
    const setState = jest.fn();
    const handler = createCollapseToggleHandler(setState);

    handler("item-1");
    const updaterAdd = setState.mock.calls[0][0] as (
      prev: Set<string>,
    ) => Set<string>;
    const afterAdd = updaterAdd(new Set());
    expect(afterAdd.has("item-1")).toBe(true);

    handler("item-1");
    const updaterRemove = setState.mock.calls[1][0] as (
      prev: Set<string>,
    ) => Set<string>;
    const afterRemove = updaterRemove(afterAdd);
    expect(afterRemove.has("item-1")).toBe(false);
  });
});
