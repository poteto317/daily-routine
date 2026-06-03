import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { WorkTrackerTemplateInput } from "./WorkTrackerTemplateInput";
import type { WorkTemplate } from "@/types/routine";

const meta = {
  title: "Features/WorkTracker/WorkTrackerTemplateInput",
  component: WorkTrackerTemplateInput,
  parameters: {
    layout: "padded",
  },
  args: {
    setWorkName: fn(),
    setSelectedTemplate: fn(),
    setShowTemplateDropdown: fn(),
  },
} satisfies Meta<typeof WorkTrackerTemplateInput>;

export default meta;
type Story = StoryObj<typeof meta>;

const templates: WorkTemplate[] = [
  {
    id: "tmpl-1",
    name: "機能開発",
    createdAt: "2026-01-01T00:00:00+09:00",
    updatedAt: "2026-05-20T10:00:00+09:00",
    lastUsedAt: "2026-05-20T10:00:00+09:00",
  },
  {
    id: "tmpl-2",
    name: "コードレビュー",
    createdAt: "2026-01-01T00:00:00+09:00",
    updatedAt: "2026-05-19T14:00:00+09:00",
    lastUsedAt: "2026-05-19T14:00:00+09:00",
  },
  {
    id: "tmpl-3",
    name: "バグ修正",
    createdAt: "2026-01-01T00:00:00+09:00",
    updatedAt: "2026-05-18T09:00:00+09:00",
  },
];

export const Empty: Story = {
  args: { workName: "", templates, showTemplateDropdown: false },
};

export const WithInput: Story = {
  args: { workName: "機能開発", templates, showTemplateDropdown: false },
};

export const ShowingDropdown: Story = {
  args: { workName: "開発", templates, showTemplateDropdown: true },
};

export const NoMatchingTemplates: Story = {
  args: { workName: "新規プロジェクト", templates, showTemplateDropdown: true },
};

/** 作業名を入力 → setWorkName が呼ばれる */
export const TypeWorkName: Story = {
  args: { workName: "", templates, showTemplateDropdown: false },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");
    await userEvent.type(input, "機能開発");
    expect(args.setWorkName).toHaveBeenCalled();
  },
};

/** テンプレートドロップダウンからアイテムをクリック → setSelectedTemplate が呼ばれる */
export const ClickTemplateItem: Story = {
  args: { workName: "機", templates, showTemplateDropdown: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const item = canvas.getByRole("button", { name: /機能開発/ });
    await userEvent.click(item);
    expect(args.setSelectedTemplate).toHaveBeenCalledWith(templates[0]);
  },
};
