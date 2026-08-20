import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { RoutineSelectionList } from "./RoutineSelectionList";
import { groupRoutinesForSelection } from "../presetRoutineGrouping";
import type { Routine } from "@/types/routine";

const meta = {
  title: "Features/Preset/RoutineSelectionList",
  component: RoutineSelectionList,
  parameters: { layout: "padded" },
  args: {
    onToggleRoutine: fn(),
    emptyLabel: "ルーティンがありません",
  },
  argTypes: {
    groups: { control: false },
    selectedRoutineIds: { control: false },
  },
} satisfies Meta<typeof RoutineSelectionList>;

export default meta;
type Story = StoryObj<typeof meta>;

const createRoutine = (overrides: Partial<Routine> = {}): Routine => ({
  id: "r-1",
  title: "朝のストレッチ",
  startTime: "07:00",
  duration: 15,
  category: "health",
  daysOfWeek: [1],
  isCompleted: false,
  sortOrder: 0,
  createdAt: "2026-01-01T00:00:00+09:00",
  updatedAt: "2026-01-01T00:00:00+09:00",
  ...overrides,
});

const routines: Routine[] = [
  createRoutine({ id: "r-1", title: "朝のストレッチ", startTime: "07:00" }),
  createRoutine({
    id: "r-2",
    title: "英語学習",
    startTime: "06:30",
    category: "study",
  }),
  createRoutine({
    id: "r-3",
    title: "夕食の片付け",
    startTime: "20:00",
    category: "life",
  }),
];

/** 未選択の状態。並び順は呼び出し側が決めるため、渡した順のまま表示される */
export const Default: Story = {
  args: {
    groups: groupRoutinesForSelection(routines),
    selectedRoutineIds: new Set<string>(),
  },
};

/** 一部が選択済みの状態 */
export const WithSelection: Story = {
  args: {
    groups: groupRoutinesForSelection(routines),
    selectedRoutineIds: new Set(["r-1", "r-3"]),
  },
};

/** 曜日違いで登録された同じ内容は1行にまとまる */
export const GroupedByDays: Story = {
  args: {
    groups: groupRoutinesForSelection([
      createRoutine({ id: "r-mon", daysOfWeek: [1] }),
      createRoutine({ id: "r-wed", daysOfWeek: [3] }),
      createRoutine({ id: "r-fri", daysOfWeek: [5] }),
    ]),
    selectedRoutineIds: new Set<string>(),
  },
};

/** ルーティンが1件も無い状態 */
export const Empty: Story = {
  args: {
    groups: [],
    selectedRoutineIds: new Set<string>(),
  },
};

/** 行をクリック → 代表ルーティンのidで onToggleRoutine が呼ばれる */
export const ClickRow: Story = {
  args: {
    groups: groupRoutinesForSelection([
      createRoutine({ id: "r-mon", daysOfWeek: [1] }),
      createRoutine({ id: "r-wed", daysOfWeek: [3] }),
    ]),
    selectedRoutineIds: new Set<string>(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("checkbox"));
    expect(args.onToggleRoutine).toHaveBeenCalledWith("r-mon");
  },
};
