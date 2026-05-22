import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import type { Routine } from "@/types/routine";
import { RoutineForm } from "./RoutineForm";

// useRoutineFormState は内部で getSettings() と getRoutines() を呼ぶ。
// localStorage が空のとき DEFAULT_SETTINGS / [] が返るためモックなしで描画可能。
// 競合検出のテストは beforeEach で "daily-routines" を設定する。

const meta = {
  title: "Features/Routine/RoutineForm",
  component: RoutineForm,
  parameters: { layout: "fullscreen" },
  args: {
    onSubmit: fn(),
    onCancel: fn(),
    currentDayOfWeek: 5,
  },
} satisfies Meta<typeof RoutineForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const existingRoutine: Routine = {
  id: "r-1",
  title: "朝のストレッチ",
  startTime: "07:00",
  duration: 15,
  category: "health",
  daysOfWeek: [1, 2, 3, 4, 5],
  isCompleted: false,
  sortOrder: 0,
  createdAt: "2026-01-01T00:00:00+09:00",
  updatedAt: "2026-01-01T00:00:00+09:00",
};

const conflictingRoutine: Routine = {
  id: "r-2",
  title: "英語学習",
  startTime: "07:00",
  duration: 30,
  category: "study",
  daysOfWeek: [1, 2, 3, 4, 5],
  isCompleted: false,
  sortOrder: 1,
  createdAt: "2026-01-01T00:00:00+09:00",
  updatedAt: "2026-01-01T00:00:00+09:00",
};

export const CreateNew: Story = {
  args: { routine: undefined },
};

export const EditExisting: Story = {
  args: { routine: existingRoutine },
};

export const WithConflict: Story = {
  args: { routine: undefined },
  beforeEach() {
    localStorage.setItem("daily-routines", JSON.stringify([conflictingRoutine]));
    return () => localStorage.removeItem("daily-routines");
  },
};

export const ClickCancel: Story = {
  args: { routine: undefined },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const cancelButton = canvas.getByRole("button", { name: /キャンセル/ });
    await userEvent.click(cancelButton);
    expect(args.onCancel).toHaveBeenCalledOnce();
  },
};

export const TypeAndSubmit: Story = {
  args: { routine: undefined },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const titleInput = canvas.getByRole("textbox", { name: /タイトル/ });
    await userEvent.type(titleInput, "新しいルーティン");
    const submitButton = canvas.getByRole("button", { name: /登録|保存/ });
    await userEvent.click(submitButton);
    expect(args.onSubmit).toHaveBeenCalledOnce();
  },
};
