import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { saveTodoLists, saveSelectedTodoListId } from "./storage";
import { sampleTodoLists } from "./__fixtures__/todoListFixtures";
import { TodoListsPage } from "./TodoListsPage";

// TodoListsPage は useTodoListSelectionState() / useTodoListDetailState() を内部で呼び出す。
// localStorage が空のとき「リストを選択してください」の初期状態で描画される。
// WithSelectedList では sampleTodoLists を保存しリスト選択状態を設定して
// リスト詳細（アイテム一覧）が表示された状態を確認できる。

const clearTodoListsStorage = (): void => {
  saveTodoLists([]);
  saveSelectedTodoListId(null);
};

const meta = {
  title: "Features/TodoLists/TodoListsPage",
  component: TodoListsPage,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof TodoListsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  beforeEach() {
    clearTodoListsStorage();
    return clearTodoListsStorage;
  },
};

export const WithSelectedList: Story = {
  beforeEach() {
    saveTodoLists(sampleTodoLists);
    saveSelectedTodoListId(sampleTodoLists[0].id);
    return clearTodoListsStorage;
  },
};
