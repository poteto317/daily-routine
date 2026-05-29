import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
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
