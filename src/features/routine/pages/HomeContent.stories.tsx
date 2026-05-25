import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HomeContent } from "./HomeContent";
import { createBaseViewModel } from "./__fixtures__/homeContentFixtures";

// HomeContent は純粋な ViewModel props を受け取るプレゼンテーションコンポーネント。
// 内部の RoutineForm は showRoutineForm=true のときのみ表示される。

const meta = {
  title: "Features/Routine/HomeContent",
  component: HomeContent,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof HomeContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: createBaseViewModel(),
};

export const EmptyState: Story = {
  args: (() => {
    const vm = createBaseViewModel();
    return {
      ...vm,
      routineListProps: {
        ...vm.routineListProps,
        sortedRoutines: [],
        allRoutinesCount: 0,
        displayRoutinesCount: 0,
      },
    };
  })(),
};

export const EditMode: Story = {
  args: (() => {
    const vm = createBaseViewModel();
    return {
      ...vm,
      toolbarProps: {
        ...vm.toolbarProps,
        view: { ...vm.toolbarProps.view, isEditMode: true },
      },
      routineListProps: {
        ...vm.routineListProps,
        isEditMode: true,
      },
    };
  })(),
};

export const WithForm: Story = {
  args: { ...createBaseViewModel(), showRoutineForm: true },
};
