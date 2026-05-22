import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
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
