import { createRef } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { BudgetAllowanceTransferSection } from "./BudgetAllowanceTransferSection";
import texts from "../locales/ja.json";

const transferTexts = texts.allowanceSettings.transfer;

const meta = {
  title: "Features/Budget/BudgetAllowanceTransferSection",
  component: BudgetAllowanceTransferSection,
  parameters: {
    layout: "padded",
  },
  args: {
    fileInputRef: createRef<HTMLInputElement>(),
    status: null,
    isImporting: false,
    onExport: fn(),
    onImportClick: fn(),
    onFileChange: fn(),
  },
} satisfies Meta<typeof BudgetAllowanceTransferSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: transferTexts.exportButton }),
    );
    await userEvent.click(
      canvas.getByRole("button", { name: transferTexts.importButton }),
    );
    await expect(args.onExport).toHaveBeenCalledTimes(1);
    await expect(args.onImportClick).toHaveBeenCalledTimes(1);
  },
};

export const Importing: Story = {
  args: { isImporting: true },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("button", {
        name: transferTexts.importingLabel,
      }),
    ).toBeDisabled();
  },
};

export const Success: Story = {
  args: {
    status: { kind: "success", message: transferTexts.exportSuccess },
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("status")).toHaveTextContent(
      transferTexts.exportSuccess,
    );
  },
};

export const Failure: Story = {
  args: {
    status: { kind: "error", message: transferTexts.errors.invalidFormat },
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("alert")).toHaveTextContent(
      transferTexts.errors.invalidFormat,
    );
  },
};
