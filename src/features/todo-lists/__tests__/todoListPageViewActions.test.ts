import type { TodoList } from "../types";
import {
  addTodoItemFromDetailInput,
  createCompletedVisibilityToggleHandler,
  createTodoListDetailHandlers,
} from "../todoListPageViewActions";
import { normalizeTitle } from "../todoListTitleNormalization";

jest.mock("../todoListTitleNormalization", () => ({
  normalizeTitle: jest.fn(),
}));

jest.mock("../todoListDetailItemHandlers", () => ({
  createAddTodoItemHandler: jest.fn(),
  createCutTodoItemsHandler: jest.fn(),
  createDeleteTodoItemHandler: jest.fn(),
  createIndentTodoItemHandler: jest.fn(),
  createOutdentTodoItemHandler: jest.fn(),
  createPasteTodoItemsHandler: jest.fn(),
  createReorderTodoItemsHandler: jest.fn(),
  createToggleTodoItemHandler: jest.fn(),
  createUpdateTodoItemTitleHandler: jest.fn(),
}));

jest.mock("../todoListDetailBgColorHandlers", () => ({
  createUpdateTodoItemBgColorHandler: jest.fn(),
  createUpdateAllTodoItemsBgColorHandler: jest.fn(),
}));

jest.mock("../todoListDetailListHandlers", () => ({
  createDeleteTodoListHandler: jest.fn(),
  createUpdateListTitleHandler: jest.fn(),
  createUpdateListAddItemPositionHandler: jest.fn(),
}));

import {
  createAddTodoItemHandler,
  createCutTodoItemsHandler,
  createDeleteTodoItemHandler,
  createIndentTodoItemHandler,
  createOutdentTodoItemHandler,
  createPasteTodoItemsHandler,
  createReorderTodoItemsHandler,
  createToggleTodoItemHandler,
  createUpdateTodoItemTitleHandler,
} from "../todoListDetailItemHandlers";
import {
  createUpdateTodoItemBgColorHandler,
  createUpdateAllTodoItemsBgColorHandler,
} from "../todoListDetailBgColorHandlers";
import {
  createDeleteTodoListHandler,
  createUpdateListTitleHandler,
  createUpdateListAddItemPositionHandler,
} from "../todoListDetailListHandlers";

const list: TodoList = {
  id: "list-1",
  title: "Inbox",
  items: [],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
};
describe("todoListPageViewActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const real = jest.requireActual<
      typeof import("../todoListTitleNormalization")
    >("../todoListTitleNormalization");
    (normalizeTitle as jest.Mock).mockImplementation(real.normalizeTitle);
  });

  it("入力値から Todo 追加を実行し、成功時に入力をリセットする", () => {
    const onAddItem = jest.fn();
    const clearInput = jest.fn();
    const focusInput = jest.fn();

    expect(
      addTodoItemFromDetailInput({
        inputText: " New Task ",
        listId: "list-1",
        onAddItem,
        clearInput,
        focusInput,
      }),
    ).toBe(true);

    expect(onAddItem).toHaveBeenCalledWith("list-1", "New Task");
    expect(clearInput).toHaveBeenCalled();
    expect(focusInput).toHaveBeenCalled();
  });

  it("空白のみの入力では追加せず false を返す", () => {
    const onAddItem = jest.fn();
    const clearInput = jest.fn();
    const focusInput = jest.fn();

    expect(
      addTodoItemFromDetailInput({
        inputText: "   ",
        listId: "list-1",
        onAddItem,
        clearInput,
        focusInput,
      }),
    ).toBe(false);

    expect(onAddItem).not.toHaveBeenCalled();
    expect(clearInput).not.toHaveBeenCalled();
    expect(focusInput).not.toHaveBeenCalled();
  });

  it("完了済み表示 toggle handler を作る", () => {
    const setHideCompleted = jest.fn();

    createCompletedVisibilityToggleHandler(setHideCompleted)();

    const updater = setHideCompleted.mock.calls[0][0] as (
      value: boolean,
    ) => boolean;
    expect(updater(false)).toBe(true);
    expect(updater(true)).toBe(false);
  });

  it("詳細 view 用 handler 群を組み立てる", () => {
    const persist = jest.fn();
    const onAddItem = jest.fn();
    const onToggleItem = jest.fn();
    const onDeleteItem = jest.fn();
    const onDeleteList = jest.fn();
    const onIndentItem = jest.fn();
    const onOutdentItem = jest.fn();
    const onReorderItems = jest.fn();
    const onUpdateItemTitle = jest.fn();
    const onUpdateListTitle = jest.fn();
    const onUpdateListAddItemPosition = jest.fn();
    const onUpdateItemBgColor = jest.fn();
    const onUpdateAllItemsBgColor = jest.fn();
    const onCutItems = jest.fn();
    const onPasteItems = jest.fn();

    (createAddTodoItemHandler as jest.Mock).mockReturnValue(onAddItem);
    (createCutTodoItemsHandler as jest.Mock).mockReturnValue(onCutItems);
    (createToggleTodoItemHandler as jest.Mock).mockReturnValue(onToggleItem);
    (createDeleteTodoItemHandler as jest.Mock).mockReturnValue(onDeleteItem);
    (createDeleteTodoListHandler as jest.Mock).mockReturnValue(onDeleteList);
    (createIndentTodoItemHandler as jest.Mock).mockReturnValue(onIndentItem);
    (createOutdentTodoItemHandler as jest.Mock).mockReturnValue(onOutdentItem);
    (createPasteTodoItemsHandler as jest.Mock).mockReturnValue(onPasteItems);
    (createReorderTodoItemsHandler as jest.Mock).mockReturnValue(
      onReorderItems,
    );
    (createUpdateTodoItemTitleHandler as jest.Mock).mockReturnValue(
      onUpdateItemTitle,
    );
    (createUpdateListTitleHandler as jest.Mock).mockReturnValue(
      onUpdateListTitle,
    );
    (createUpdateListAddItemPositionHandler as jest.Mock).mockReturnValue(
      onUpdateListAddItemPosition,
    );
    (createUpdateTodoItemBgColorHandler as jest.Mock).mockReturnValue(
      onUpdateItemBgColor,
    );
    (createUpdateAllTodoItemsBgColorHandler as jest.Mock).mockReturnValue(
      onUpdateAllItemsBgColor,
    );

    const deleteItemConfirmTemplate = jest.fn(
      (title: string) => `item:${title}`,
    );
    const deleteListConfirmTemplate = jest.fn(
      (title: string) => `list:${title}`,
    );

    const handlers = createTodoListDetailHandlers({
      lists: [list],
      persist,
      deleteItemConfirmTemplate,
      deleteListConfirmTemplate,
    });

    expect(createAddTodoItemHandler).toHaveBeenCalledWith({
      lists: [list],
      persist,
    });
    expect(createCutTodoItemsHandler).toHaveBeenCalledWith({
      lists: [list],
      persist,
    });
    expect(createToggleTodoItemHandler).toHaveBeenCalledWith({
      lists: [list],
      persist,
    });
    expect(createDeleteTodoItemHandler).toHaveBeenCalledWith({
      lists: [list],
      persist,
      deleteItemConfirmTemplate,
    });
    expect(createDeleteTodoListHandler).toHaveBeenCalledWith({
      lists: [list],
      persist,
      deleteListConfirmTemplate,
    });
    expect(createIndentTodoItemHandler).toHaveBeenCalledWith({
      lists: [list],
      persist,
    });
    expect(createOutdentTodoItemHandler).toHaveBeenCalledWith({
      lists: [list],
      persist,
    });
    expect(createReorderTodoItemsHandler).toHaveBeenCalledWith({
      lists: [list],
      persist,
    });
    expect(createUpdateTodoItemTitleHandler).toHaveBeenCalledWith({
      lists: [list],
      persist,
    });
    expect(createUpdateListTitleHandler).toHaveBeenCalledWith({
      lists: [list],
      persist,
    });
    expect(createUpdateListAddItemPositionHandler).toHaveBeenCalledWith({
      lists: [list],
      persist,
    });
    expect(createUpdateTodoItemBgColorHandler).toHaveBeenCalledWith({
      lists: [list],
      persist,
    });
    expect(createUpdateAllTodoItemsBgColorHandler).toHaveBeenCalledWith({
      lists: [list],
      persist,
    });
    expect(createPasteTodoItemsHandler).toHaveBeenCalledWith({
      lists: [list],
      persist,
    });
    expect(handlers).toEqual({
      onAddItem,
      onToggleItem,
      onDeleteItem,
      onDeleteList,
      onIndentItem,
      onOutdentItem,
      onReorderItems,
      onUpdateItemTitle,
      onUpdateListTitle,
      onUpdateListAddItemPosition,
      onUpdateItemBgColor,
      onUpdateAllItemsBgColor,
      onCutItems,
      onPasteItems,
    });
  });

  it("入力値の前後の空白をトリムして追加する", () => {
    const onAddItem = jest.fn();

    addTodoItemFromDetailInput({
      inputText: "  trimmed task  ",
      listId: "list-2",
      onAddItem,
      clearInput: jest.fn(),
      focusInput: jest.fn(),
    });

    expect(onAddItem).toHaveBeenCalledWith("list-2", "trimmed task");
  });

  it("空文字の入力では追加せず false を返す", () => {
    const onAddItem = jest.fn();

    expect(
      addTodoItemFromDetailInput({
        inputText: "",
        listId: "list-1",
        onAddItem,
        clearInput: jest.fn(),
        focusInput: jest.fn(),
      }),
    ).toBe(false);

    expect(onAddItem).not.toHaveBeenCalled();
  });

  it("追加成功後に clearInput と focusInput を両方呼ぶ", () => {
    const clearInput = jest.fn();
    const focusInput = jest.fn();

    addTodoItemFromDetailInput({
      inputText: "task",
      listId: "list-1",
      onAddItem: jest.fn(),
      clearInput,
      focusInput,
    });

    expect(clearInput).toHaveBeenCalledTimes(1);
    expect(focusInput).toHaveBeenCalledTimes(1);
  });

  it("addTodoItemFromDetailInput は normalizeTitle に委譲する", () => {
    const onAddItem = jest.fn();
    (normalizeTitle as jest.Mock).mockReturnValue("NormalizedTask");

    addTodoItemFromDetailInput({
      inputText: "  raw input  ",
      listId: "list-1",
      onAddItem,
      clearInput: jest.fn(),
      focusInput: jest.fn(),
    });

    expect(normalizeTitle).toHaveBeenCalledWith("  raw input  ");
    expect(onAddItem).toHaveBeenCalledWith("list-1", "NormalizedTask");
  });

  it("normalizeTitle が null を返すと onAddItem を呼ばずに false を返す", () => {
    const onAddItem = jest.fn();
    (normalizeTitle as jest.Mock).mockReturnValue(null);

    const result = addTodoItemFromDetailInput({
      inputText: "   ",
      listId: "list-1",
      onAddItem,
      clearInput: jest.fn(),
      focusInput: jest.fn(),
    });

    expect(result).toBe(false);
    expect(onAddItem).not.toHaveBeenCalled();
  });
});
