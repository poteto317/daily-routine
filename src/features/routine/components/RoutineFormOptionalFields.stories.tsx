import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { RoutineFormOptionalFields } from "./RoutineFormOptionalFields";

const meta = {
  title: "Features/Routine/RoutineFormOptionalFields",
  component: RoutineFormOptionalFields,
  parameters: {
    layout: "padded",
  },
  args: {
    setDescription: fn(),
    setNotificationMinutes: fn(),
    defaultNotificationMinutes: 5,
  },
} satisfies Meta<typeof RoutineFormOptionalFields>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { description: "", notificationMinutes: "" },
};

export const WithDescription: Story = {
  args: {
    description: "毎朝起きたらすぐに行う。ヨガマットを準備しておく。",
    notificationMinutes: "",
  },
};

export const WithNotification: Story = {
  args: {
    description: "",
    notificationMinutes: "10",
  },
};

export const WithAll: Story = {
  args: {
    description: "毎朝起きたらすぐに行う。ヨガマットを準備しておく。",
    notificationMinutes: "5",
  },
};

/** 説明欄に入力 → setDescription が呼ばれる */
export const TypeDescription: Story = {
  args: { description: "", notificationMinutes: "" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByPlaceholderText("ルーティンの詳細を入力");
    await userEvent.type(textarea, "毎朝起きたらすぐに行う");
    expect(args.setDescription).toHaveBeenCalled();
  },
};
