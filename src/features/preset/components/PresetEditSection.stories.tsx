import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { PresetEditSection } from "./PresetEditSection";
import type { Routine } from "@/types/routine";

const meta = {
  title: "Features/Preset/PresetEditSection",
  component: PresetEditSection,
  parameters: { layout: "padded" },
  args: {
    onChangeEditName: fn(),
    onChangeEditDescription: fn(),
    onToggleEditRoutine: fn(),
    onSaveEdit: fn(),
    onCancelEdit: fn(),
  },
  argTypes: {
    editSelectedRoutines: { control: false },
  },
} satisfies Meta<typeof PresetEditSection>;

export default meta;
type Story = StoryObj<typeof meta>;

const routines: Routine[] = [
  {
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
  },
  {
    id: "r-2",
    title: "英語学習",
    startTime: "06:30",
    duration: 20,
    category: "study",
    daysOfWeek: [1, 2, 3, 4, 5],
    isCompleted: false,
    sortOrder: 1,
    createdAt: "2026-01-01T00:00:00+09:00",
    updatedAt: "2026-01-01T00:00:00+09:00",
  },
];

export const Empty: Story = {
  args: {
    routines,
    editPresetName: "",
    editPresetDescription: "",
    editSelectedRoutines: new Set<string>(),
  },
};

export const WithValues: Story = {
  args: {
    routines,
    editPresetName: "朝のルーティン改",
    editPresetDescription: "更新版の説明",
    editSelectedRoutines: new Set(["r-1"]),
  },
};

export const NoRoutines: Story = {
  args: {
    routines: [],
    editPresetName: "新しいプリセット",
    editPresetDescription: "",
    editSelectedRoutines: new Set<string>(),
  },
};

/** 「保存」ボタンをクリック → onSaveEdit が呼ばれる */
export const ClickSave: Story = {
  args: {
    routines,
    editPresetName: "朝のルーティン",
    editPresetDescription: "",
    editSelectedRoutines: new Set(["r-1"]),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const saveButton = canvas.getByRole("button", { name: "保存" });
    await userEvent.click(saveButton);
    expect(args.onSaveEdit).toHaveBeenCalledOnce();
  },
};

/** 「キャンセル」ボタンをクリック → onCancelEdit が呼ばれる */
export const ClickCancel: Story = {
  args: {
    routines,
    editPresetName: "朝のルーティン",
    editPresetDescription: "",
    editSelectedRoutines: new Set<string>(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const cancelButton = canvas.getByRole("button", { name: "キャンセル" });
    await userEvent.click(cancelButton);
    expect(args.onCancelEdit).toHaveBeenCalledOnce();
  },
};
