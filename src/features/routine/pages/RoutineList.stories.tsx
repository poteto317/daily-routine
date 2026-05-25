import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { RoutineList } from "./RoutineList";
import { sampleCompletedRoutines, sampleRoutines } from "./__fixtures__/routineFixtures";

// RoutineList は props のみ。DnD コンテキストは DraggableRoutineList が内包するため decorator 不要。

// ストーリーごとに独立した fn() インスタンスを持つため、meta.args は使わずに
// 各ストーリーでこのファクトリを呼び出す。
const createBaseArgs = () => ({
  sortedRoutines: sampleRoutines,
  allRoutinesCount: sampleRoutines.length,
  displayRoutinesCount: sampleRoutines.length,
  isEditMode: false,
  viewMode: 1,
  onToggleAction: fn(),
  onEditAction: fn(),
  onDeleteAction: fn(),
  onAddRoutineAction: fn(),
  onReorderAction: fn(),
});

const meta = {
  title: "Features/Routine/RoutineList",
  component: RoutineList,
  parameters: { layout: "padded" },
} satisfies Meta<typeof RoutineList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ViewMode: Story = {
  args: createBaseArgs(),
};

export const EditMode: Story = {
  args: { ...createBaseArgs(), isEditMode: true },
};

export const Empty: Story = {
  args: {
    ...createBaseArgs(),
    sortedRoutines: [],
    allRoutinesCount: 0,
    displayRoutinesCount: 0,
  },
};

export const NoRoutinesForDay: Story = {
  args: {
    ...createBaseArgs(),
    sortedRoutines: [],
    allRoutinesCount: sampleRoutines.length,
    displayRoutinesCount: 0,
    viewMode: 6,
  },
};

export const FilteredEmpty: Story = {
  args: {
    ...createBaseArgs(),
    sortedRoutines: [],
    allRoutinesCount: sampleRoutines.length,
    displayRoutinesCount: sampleRoutines.length,
  },
};

export const AllCompleted: Story = {
  args: { ...createBaseArgs(), sortedRoutines: sampleCompletedRoutines },
};
