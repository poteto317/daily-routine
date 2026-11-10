import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import type { TodoList } from "@/features/todo-lists/types";
import { saveTodoLists } from "@/features/todo-lists/storage";
import { MenuOrderSection } from "./MenuOrderSection";

// getTodoLists() は localStorage["todo-lists"] が空のとき [] を返す。
// beforeEach で TodoList データを設定することでメニュー項目を追加できる。

const sampleTodoLists: TodoList[] = [
  {
    id: "tl-1",
    title: "買い物リスト",
    items: [],
    createdAt: "2026-01-01T00:00:00+09:00",
    updatedAt: "2026-01-01T00:00:00+09:00",
  },
  {
    id: "tl-2",
    title: "仕事タスク",
    items: [],
    createdAt: "2026-01-01T00:00:00+09:00",
    updatedAt: "2026-01-01T00:00:00+09:00",
  },
];

const defaultOrder = [
  "journal",
  "weekly-log",
  "calendar",
  "statistics",
  "pomodoro",
  "worktracker",
  "weight-tracker",
  "workout-tracker",
  "meal",
  "budget",
  "weather",
  "preset",
  "todo-lists",
  "todo-list-management",
];

const meta = {
  title: "Features/Settings/MenuOrderSection",
  component: MenuOrderSection,
  parameters: { layout: "padded" },
  args: {
    setMenuOrderAction: fn(),
  },
} satisfies Meta<typeof MenuOrderSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { menuOrder: defaultOrder },
};

export const CustomOrder: Story = {
  args: {
    menuOrder: [
      "pomodoro",
      "worktracker",
      "journal",
      "weekly-log",
      "statistics",
      "calendar",
      "weight-tracker",
      "workout-tracker",
      "meal",
      "budget",
      "weather",
      "preset",
      "todo-lists",
      "todo-list-management",
    ],
  },
};

export const WithTodoLists: Story = {
  args: { menuOrder: defaultOrder },
  beforeEach() {
    saveTodoLists(sampleTodoLists);
    return () => saveTodoLists([]);
  },
};

export const EmptyOrder: Story = {
  args: { menuOrder: [] },
};

/** 「デフォルトに戻す」クリック → setMenuOrderAction が呼ばれる */
export const ClickReset: Story = {
  args: { menuOrder: defaultOrder },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const resetButton = canvas.getByRole("button", {
      name: "デフォルトに戻す",
    });
    await userEvent.click(resetButton);
    expect(args.setMenuOrderAction).toHaveBeenCalled();
  },
};
