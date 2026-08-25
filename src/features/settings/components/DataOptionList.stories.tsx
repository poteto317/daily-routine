import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { DataOptionList } from "./DataOptionList";
import {
  ALL_TRANSFER_OPTIONS,
  EMPTY_TRANSFER_OPTIONS,
} from "../state/constants";

const meta = {
  title: "Features/Settings/DataOptionList",
  component: DataOptionList,
  parameters: {
    layout: "padded",
  },
  args: {
    setOptions: fn(),
  },
} satisfies Meta<typeof DataOptionList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllSelected: Story = {
  args: { options: ALL_TRANSFER_OPTIONS },
};

export const NoneSelected: Story = {
  args: { options: EMPTY_TRANSFER_OPTIONS },
};

export const RoutinesOnly: Story = {
  args: {
    options: { ...EMPTY_TRANSFER_OPTIONS, routines: true },
  },
};

export const ClickSelectAll: Story = {
  args: { options: EMPTY_TRANSFER_OPTIONS },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const selectAllButton = canvas.getByRole("button", {
      name: /すべて選択|全選択/,
    });
    await userEvent.click(selectAllButton);
    expect(args.setOptions).toHaveBeenCalledWith(ALL_TRANSFER_OPTIONS);
  },
};

export const ClickDeselectAll: Story = {
  args: { options: ALL_TRANSFER_OPTIONS },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const deselectButton = canvas.getByRole("button", {
      name: /すべて解除|全解除/,
    });
    await userEvent.click(deselectButton);
    expect(args.setOptions).toHaveBeenCalledWith(EMPTY_TRANSFER_OPTIONS);
  },
};
