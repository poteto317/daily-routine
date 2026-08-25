import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { NavigationContextProvider } from "@/features/routine/pages/NavigationContext";
import { saveTodoLists } from "./storage";
import { sampleTodoLists } from "./__fixtures__/todoListFixtures";
import { TodoListManagementPage } from "./TodoListManagementPage";

// TodoListManagementPage は useNavigationContext() を内部で呼び出すため
// NavigationContextProvider デコレーターで navigate 関数を注入する。
// localStorage が空のとき空一覧（emptyMessage）が表示される。
// WithLists ではサンプルリストを beforeEach で設定してリスト一覧が表示された状態を確認できる。

const withNavigationContext: Decorator = (Story) => (
  <NavigationContextProvider value={fn()}>
    <Story />
  </NavigationContextProvider>
);

const meta = {
  title: "Features/TodoLists/TodoListManagementPage",
  component: TodoListManagementPage,
  parameters: { layout: "fullscreen" },
  decorators: [withNavigationContext],
} satisfies Meta<typeof TodoListManagementPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  beforeEach() {
    saveTodoLists([]);
    return () => saveTodoLists([]);
  },
};

export const WithLists: Story = {
  beforeEach() {
    saveTodoLists(sampleTodoLists);
    return () => saveTodoLists([]);
  },
};

/** 「＋ 新しいリストを追加」ボタンをクリック → フォームが開く */
export const ClickAddList: Story = {
  beforeEach() {
    saveTodoLists([]);
    return () => saveTodoLists([]);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const addButton = canvas.getByRole("button", {
      name: /新しいリストを追加/,
    });
    await userEvent.click(addButton);
    // フォームが開き、タイトル入力欄が表示される
    expect(canvas.getByPlaceholderText("リストのタイトル")).toBeTruthy();
  },
};
