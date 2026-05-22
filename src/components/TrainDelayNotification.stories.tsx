import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TrainDelayNotification } from "./TrainDelayNotification";
import type { TrainDelayInfo } from "@/types/routine";

const meta = {
  title: "Components/TrainDelayNotification",
  component: TrainDelayNotification,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof TrainDelayNotification>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseDelay: TrainDelayInfo = {
  lineId: "chuo",
  lineName: "中央線",
  company: "JR東日本",
  delayMinutes: 5,
  lastUpdated: "2026-05-21T08:30:00+09:00",
};

export const MinorDelay: Story = {
  args: {
    delays: [
      {
        ...baseDelay,
        delayMinutes: 5,
        reason: "車両点検",
        section: "東京〜立川",
      },
    ],
  },
};

export const ModerateDelay: Story = {
  args: {
    delays: [
      {
        ...baseDelay,
        lineId: "sobu",
        lineName: "総武線",
        delayMinutes: 20,
        reason: "人身事故",
        section: "新宿〜千葉",
      },
    ],
  },
};

export const SevereDelay: Story = {
  args: {
    delays: [
      {
        ...baseDelay,
        lineId: "yamanote",
        lineName: "山手線",
        delayMinutes: 45,
        reason: "強風による運転見合わせ",
      },
    ],
  },
};

export const WithoutOptionalFields: Story = {
  args: {
    delays: [
      {
        lineId: "keio",
        lineName: "京王線",
        company: "京王電鉄",
        delayMinutes: 10,
        lastUpdated: "2026-05-21T08:15:00+09:00",
      },
    ],
  },
};

export const MultipleDelays: Story = {
  args: {
    delays: [
      {
        lineId: "yamanote",
        lineName: "山手線",
        company: "JR東日本",
        delayMinutes: 35,
        reason: "強風による運転見合わせ",
        lastUpdated: "2026-05-21T08:30:00+09:00",
      },
      {
        lineId: "chuo",
        lineName: "中央線",
        company: "JR東日本",
        delayMinutes: 18,
        reason: "人身事故",
        section: "東京〜新宿",
        lastUpdated: "2026-05-21T08:25:00+09:00",
      },
      {
        lineId: "keio",
        lineName: "京王線",
        company: "京王電鉄",
        delayMinutes: 7,
        lastUpdated: "2026-05-21T08:20:00+09:00",
      },
    ],
  },
};
