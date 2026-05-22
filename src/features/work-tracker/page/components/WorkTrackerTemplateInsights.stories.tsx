import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { WorkTemplate } from "@/types/routine";
import { saveWorkSessionHistory } from "@/features/work-tracker/storageData";
import { WorkTrackerTemplateInsights } from "./WorkTrackerTemplateInsights";

// WorkTrackerTemplateInsights は localStorage["work-sessions"] から統計を算出する。
// stats.count === 0 のとき null を返すため、表示させるには beforeEach でデータを設定する。

const template: WorkTemplate = {
  id: "tmpl-1",
  name: "コーディング",
  createdAt: "2026-01-01T00:00:00+09:00",
  updatedAt: "2026-01-01T00:00:00+09:00",
  lastUsedAt: "2026-05-22T09:00:00+09:00",
};

const makeSession = (id: string, date: string, duration: number, notes?: string) => ({
  id,
  workTemplateId: "tmpl-1",
  workName: "コーディング",
  mood: "good" as const,
  startTime: `${date}T09:00:00+09:00`,
  endTime: `${date}T10:30:00+09:00`,
  duration,
  notes,
  createdAt: `${date}T09:00:00+09:00`,
});

const sessionHistory = {
  "2026-05-20": [makeSession("s-1", "2026-05-20", 5400, "集中できた")],
  "2026-05-21": [makeSession("s-2", "2026-05-21", 4800)],
  "2026-05-22": [makeSession("s-3", "2026-05-22", 6000, "新記録！")],
};

const meta = {
  title: "Features/WorkTracker/WorkTrackerTemplateInsights",
  component: WorkTrackerTemplateInsights,
  parameters: { layout: "padded" },
} satisfies Meta<typeof WorkTrackerTemplateInsights>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithStats: Story = {
  args: {
    selectedTemplate: template,
    workName: "コーディング",
    elapsedTime: 3600,
  },
  beforeEach() {
    saveWorkSessionHistory(sessionHistory);
    return () => saveWorkSessionHistory({});
  },
};

export const LongSession: Story = {
  args: {
    selectedTemplate: template,
    workName: "コーディング",
    elapsedTime: 7200,
  },
  beforeEach() {
    saveWorkSessionHistory(sessionHistory);
    return () => saveWorkSessionHistory({});
  },
};

export const NoTemplate: Story = {
  args: {
    selectedTemplate: null,
    workName: "",
    elapsedTime: 0,
  },
};
