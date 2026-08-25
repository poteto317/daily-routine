import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { saveTodoLists } from "./storage";
import { setSelectedTodoListId } from "./selectedTodoList";
import { sampleTodoLists } from "./__fixtures__/todoListFixtures";
import { TodoListsPage } from "./TodoListsPage";

// TodoListsPage は useTodoListsPageState() を呼び出し、選択 ID とクリップボードを管理する。
// リスト詳細の状態（undo/redo を含む）は TodoListDetail コンポーネント内で管理される。
// localStorage が空のとき「リストを選択してください」の初期状態で描画される。
// WithSelectedList では sampleTodoLists を保存しリスト選択状態を設定して
// リスト詳細（アイテム一覧）が表示された状態を確認できる。
//
// selectedId のセットアップ・クリーンアップには saveSelectedTodoListId（storage のみ）ではなく
// setSelectedTodoListId（モジュール内キャッシュ＋リスナー通知も含む）を使用する。
// Storybook はモジュールを保持したままストーリーを切り替えるため、キャッシュが古い値を
// 返し続けると useTodoListSelectionState() が選択 ID を認識できなくなる。

const clearTodoListsStorage = (): void => {
  saveTodoLists([]);
  setSelectedTodoListId(null);
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
    setSelectedTodoListId(sampleTodoLists[0].id);
    return clearTodoListsStorage;
  },
};

/** 選択中リストのアイテム「牛乳」の完了ボタンをクリック → チェック状態になる */
export const ClickCompleteItem: Story = {
  beforeEach() {
    saveTodoLists(sampleTodoLists);
    setSelectedTodoListId(sampleTodoLists[0].id);
    return clearTodoListsStorage;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const completeButton = canvas.getByRole("button", {
      name: /「牛乳」を完了にする/,
    });
    await userEvent.click(completeButton);
    expect(
      canvas.queryByRole("button", { name: /「牛乳」を完了にする/ }),
    ).toBeNull();
  },
};
