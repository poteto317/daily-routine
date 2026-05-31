import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { DefaultAndPomodoroSection } from "./DefaultAndPomodoroSection";

const meta = {
  title: "Features/Settings/DefaultAndPomodoroSection",
  component: DefaultAndPomodoroSection,
  parameters: {
    layout: "padded",
  },
  args: {
    setDurationInput: fn(),
    setNotificationInput: fn(),
    setPomodoroFocusInput: fn(),
    setPomodoroBreakInput: fn(),
    setBackgroundRefreshIntervalInput: fn(),
  },
} satisfies Meta<typeof DefaultAndPomodoroSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    durationInput: "30",
    notificationInput: "5",
    pomodoroFocusInput: "25",
    pomodoroBreakInput: "5",
    backgroundRefreshIntervalInput: "30",
  },
};

export const WithValidationErrors: Story = {
  args: {
    durationInput: "0",
    notificationInput: "200",
    pomodoroFocusInput: "0",
    pomodoroBreakInput: "99",
    backgroundRefreshIntervalInput: "-1",
  },
};

export const MinimalValues: Story = {
  args: {
    durationInput: "1",
    notificationInput: "0",
    pomodoroFocusInput: "1",
    pomodoroBreakInput: "1",
    backgroundRefreshIntervalInput: "0",
  },
};

/** デフォルト所要時間フィールドに値を入力 → setDurationInput が呼ばれる */
export const TypeDuration: Story = {
  args: {
    durationInput: "",
    notificationInput: "5",
    pomodoroFocusInput: "25",
    pomodoroBreakInput: "5",
    backgroundRefreshIntervalInput: "30",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const durationInput = canvas.getByLabelText(/デフォルト所要時間/);
    await userEvent.clear(durationInput);
    await userEvent.type(durationInput, "45");
    expect(args.setDurationInput).toHaveBeenCalled();
  },
};
