import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HomeContent } from "./HomeContent";
import { createBaseViewModel } from "./__fixtures__/homeContentFixtures";

// HomeContent は純粋な ViewModel props を受け取るプレゼンテーションコンポーネント。
// 内部の RoutineForm は showRoutineForm=true のときのみ表示される。

const baseViewModel = createBaseViewModel();

const meta = {
  title: "Features/Routine/HomeContent",
  component: HomeContent,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof HomeContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: baseViewModel,
};

export const EmptyState: Story = {
  args: {
    ...baseViewModel,
    routineListProps: {
      ...baseViewModel.routineListProps,
      sortedRoutines: [],
      allRoutinesCount: 0,
      displayRoutinesCount: 0,
    },
  },
};

export const EditMode: Story = {
  args: {
    ...baseViewModel,
    toolbarProps: {
      ...baseViewModel.toolbarProps,
      view: { ...baseViewModel.toolbarProps.view, isEditMode: true },
    },
    routineListProps: {
      ...baseViewModel.routineListProps,
      isEditMode: true,
    },
  },
};

export const WithForm: Story = {
  args: {
    ...baseViewModel,
    showRoutineForm: true,
  },
};
