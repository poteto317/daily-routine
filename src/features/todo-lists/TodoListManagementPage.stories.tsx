import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { NavigationContextProvider } from "@/features/routine/pages/NavigationContext";
import { DEFAULT_SETTINGS, saveSettings } from "@/features/settings/storage";
import { saveTodoLists } from "./storage";
import { sampleTodoLists } from "./__fixtures__/todoListFixtures";
import { TodoListManagementPage } from "./TodoListManagementPage";
import type { TodoList } from "./types";

// TodoListManagementPage は useNavigationContext() を内部で呼び出すため
// NavigationContextProvider デコレーターで navigate 関数を注入する。
// localStorage が空のとき空一覧（emptyMessage）が表示される。
// WithLists ではサンプルリストを beforeEach で設定してリスト一覧が表示された状態を確認できる。
// リストが表示されるストーリーでは、⠿ のハンドルで手で並べ替えると app-settings の
// menuOrder が変わる。他のストーリー（設定画面のメニュー並び替えなど）に残さないよう、
// 前後で saveSettings(DEFAULT_SETTINGS) を呼んで戻す。

const withNavigationContext: Decorator = (Story) => (
  <NavigationContextProvider value={fn()}>
    <Story />
  </NavigationContextProvider>
);

const hiddenTodoList: TodoList = {
  id: "list-hidden",
  title: "旅行の準備",
  items: [],
  createdAt: "2026-01-03T00:00:00+09:00",
  updatedAt: "2026-01-03T00:00:00+09:00",
  isHidden: true,
};

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
    saveSettings(DEFAULT_SETTINGS);
    return () => {
      saveTodoLists([]);
      saveSettings(DEFAULT_SETTINGS);
    };
  },
};

/** 非表示のリストを含む一覧。各行の ⠿ で並べ替えられる（非表示のリストも並べられる） */
export const WithHiddenList: Story = {
  beforeEach() {
    saveTodoLists([...sampleTodoLists, hiddenTodoList]);
    saveSettings(DEFAULT_SETTINGS);
    return () => {
      saveTodoLists([]);
      saveSettings(DEFAULT_SETTINGS);
    };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 非表示のリストを含むすべての行に並び替えのハンドルがある
    expect(canvas.getAllByRole("button", { name: "並び替え" })).toHaveLength(
      sampleTodoLists.length + 1,
    );
    expect(
      canvas.getByRole("button", { name: "旅行の準備 を開く" }),
    ).toBeTruthy();
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
