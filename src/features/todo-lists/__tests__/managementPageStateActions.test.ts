import type { TodoList } from "../types";
import {
  createClosedTodoListFormState,
  createTodoListAndPersist,
  deleteTodoListAndPersist,
  isTodoListVisible,
  persistManagedTodoLists,
  shouldFocusTodoListForm,
  toggleTodoListVisibilityAndPersist,
} from "../managementPageStateActions";

const baseList: TodoList = {
  id: "list-1",
  title: "Inbox",
  items: [],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
};

describe("managementPageStateActions", () => {
  it("リスト永続化で state と storage を更新する", () => {
    const setLists = jest.fn();
    const saveLists = jest.fn();

    persistManagedTodoLists({
      nextLists: [baseList],
      setLists,
      saveLists,
    });

    expect(setLists).toHaveBeenCalledWith([baseList]);
    expect(saveLists).toHaveBeenCalledWith([baseList]);
  });

  it("フォームを閉じる初期状態を返す", () => {
    expect(createClosedTodoListFormState()).toEqual({
      showForm: false,
      titleInput: "",
    });
  });

  it("リスト作成成功時に永続化する", () => {
    const persist = jest.fn();

    const nextLists = createTodoListAndPersist({
      lists: [baseList],
      titleInput: "買い物",
      persist,
    });

    expect(nextLists).toEqual(
      expect.arrayContaining([expect.objectContaining({ title: "買い物" })]),
    );
    expect(persist).toHaveBeenCalledWith(nextLists);
  });

  it("空タイトルなら作成しない", () => {
    const persist = jest.fn();

    expect(
      createTodoListAndPersist({
        lists: [baseList],
        titleInput: "   ",
        persist,
      }),
    ).toBeNull();
    expect(persist).not.toHaveBeenCalled();
  });

  it("表示切替後に永続化する", () => {
    const persist = jest.fn();

    const nextLists = toggleTodoListVisibilityAndPersist(
      [baseList],
      "list-1",
      persist,
    );

    expect(nextLists[0].isHidden).toBe(true);
    expect(persist).toHaveBeenCalledWith(nextLists);
  });

  it("削除確認後に永続化する", () => {
    const persist = jest.fn();

    const nextLists = deleteTodoListAndPersist({
      lists: [baseList],
      list: baseList,
      message: "delete?",
      persist,
      confirmDelete: jest.fn(() => true),
    });

    expect(nextLists).toEqual([]);
    expect(persist).toHaveBeenCalledWith([]);
  });

  it("削除キャンセル時は何もしない", () => {
    const persist = jest.fn();

    expect(
      deleteTodoListAndPersist({
        lists: [baseList],
        list: baseList,
        message: "delete?",
        persist,
        confirmDelete: jest.fn(() => false),
      }),
    ).toBeNull();
    expect(persist).not.toHaveBeenCalled();
  });

  it("フォーム表示時だけfocus対象にする", () => {
    expect(shouldFocusTodoListForm(true)).toBe(true);
    expect(shouldFocusTodoListForm(false)).toBe(false);
  });

  it("非表示フラグから可視状態を判定する", () => {
    expect(isTodoListVisible(baseList)).toBe(true);
    expect(isTodoListVisible({ ...baseList, isHidden: true })).toBe(false);
  });
});
