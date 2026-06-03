import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { WorkTrackerSessionForm } from "./WorkTrackerSessionForm";
import type { WorkTemplate } from "@/types/routine";

const meta = {
  title: "Features/WorkTracker/WorkTrackerSessionForm",
  component: WorkTrackerSessionForm,
  parameters: {
    layout: "padded",
  },
  args: {
    setWorkName: fn(),
    setNotes: fn(),
    setSelectedMood: fn(),
    setSelectedTemplate: fn(),
    setShowTemplateDropdown: fn(),
    onSave: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof WorkTrackerSessionForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const templates: WorkTemplate[] = [
  {
    id: "tmpl-1",
    name: "機能開発",
    createdAt: "2026-01-01T00:00:00+09:00",
    updatedAt: "2026-05-22T10:00:00+09:00",
    lastUsedAt: "2026-05-22T10:00:00+09:00",
  },
];

export const Empty: Story = {
  args: {
    elapsedTime: 3600,
    workName: "",
    notes: "",
    selectedMood: "good",
    selectedTemplate: null,
    templates,
    showTemplateDropdown: false,
  },
};

export const WithWorkName: Story = {
  args: {
    elapsedTime: 7200,
    workName: "機能開発",
    notes: "",
    selectedMood: "great",
    selectedTemplate: templates[0],
    templates,
    showTemplateDropdown: false,
  },
};

export const WithNotes: Story = {
  args: {
    elapsedTime: 5400,
    workName: "バグ修正",
    notes: "ネットワーク周りの不具合を修正。再現手順を確認してから対応した。",
    selectedMood: "normal",
    selectedTemplate: null,
    templates,
    showTemplateDropdown: false,
  },
};

/** 「記録を保存」ボタンをクリック → onSave が呼ばれる */
export const ClickSave: Story = {
  args: {
    elapsedTime: 3600,
    workName: "機能開発",
    notes: "",
    selectedMood: "good",
    selectedTemplate: null,
    templates,
    showTemplateDropdown: false,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const saveButton = canvas.getByRole("button", { name: /記録を保存/ });
    await userEvent.click(saveButton);
    expect(args.onSave).toHaveBeenCalledOnce();
  },
};

/** 「キャンセル」ボタンをクリック → onCancel が呼ばれる */
export const ClickCancel: Story = {
  args: {
    elapsedTime: 3600,
    workName: "",
    notes: "",
    selectedMood: "good",
    selectedTemplate: null,
    templates,
    showTemplateDropdown: false,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const cancelButton = canvas.getByRole("button", { name: "キャンセル" });
    await userEvent.click(cancelButton);
    expect(args.onCancel).toHaveBeenCalledOnce();
  },
};
