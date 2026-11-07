import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { WeeklyLogCard } from "./WeeklyLogCard";
import type { WeeklyLogState } from "../useWeeklyLogState";
import type { WeeklyLogEntry } from "@/types/routine";

const entries: WeeklyLogEntry[] = [
  {
    id: "w-1",
    weekStart: "2026-11-02",
    content: "・A 案件の設計レビューを完了\n・来週は実装に着手",
    createdAt: "2026-11-06T09:00:00.000Z",
    updatedAt: "2026-11-06T09:30:00.000Z",
  },
  {
    id: "w-2",
    weekStart: "2026-10-26",
    content: "・B 案件のリリース対応\n・障害の振り返り会を実施",
    createdAt: "2026-10-31T09:00:00.000Z",
    updatedAt: "2026-10-31T09:00:00.000Z",
  },
];

const baseState = {
  currentWeekStart: "2026-11-02",
  selectedWeekStart: "2026-11-02",
  selectedEntry: null,
  entries: [],
  isEditing: false,
  contentInput: "",
  canNavigate: true,
  canGoNext: false,
  goToPreviousWeek: fn(),
  goToNextWeek: fn(),
  openWeek: fn(),
  startEditing: fn(),
  cancelEditing: fn(),
  changeContent: fn(),
  save: fn(),
  remove: fn(),
} satisfies WeeklyLogState;

const meta = {
  title: "Features/Journal/WeeklyLogCard",
  component: WeeklyLogCard,
  parameters: { layout: "padded" },
  args: { state: baseState },
} satisfies Meta<typeof WeeklyLogCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /書く/ }));
    expect(args.state.startEditing).toHaveBeenCalled();
  },
};

export const WithEntry: Story = {
  args: {
    state: { ...baseState, selectedEntry: entries[0], entries },
  },
};

export const Editing: Story = {
  args: {
    state: {
      ...baseState,
      selectedEntry: entries[0],
      isEditing: true,
      canNavigate: false,
      contentInput: entries[0].content,
      entries,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("button", { name: "前の週" })).toBeDisabled();
    expect(canvas.getByRole("button", { name: "次の週" })).toBeDisabled();
    for (const button of canvas.getAllByRole("button", {
      name: /開始の週を開く/,
    })) {
      expect(button).toBeDisabled();
    }
  },
};

export const PastWeek: Story = {
  args: {
    state: {
      ...baseState,
      selectedWeekStart: "2026-10-26",
      selectedEntry: entries[1],
      canGoNext: true,
      entries,
    },
  },
};

/** 狭い幅（Storybook の mobile1 = 320px）でも週ナビと一覧が崩れないこと */
export const Mobile: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
  args: {
    state: { ...baseState, selectedEntry: entries[0], entries },
  },
};
