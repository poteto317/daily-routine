import { useRef } from "react";
import type { RefObject } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { DataManagementSection } from "./DataManagementSection";
import { ALL_TRANSFER_OPTIONS, EMPTY_TRANSFER_OPTIONS } from "../state/constants";

type Props = React.ComponentProps<typeof DataManagementSection>;

const DataManagementSectionWithRef = (args: Props) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  return <DataManagementSection {...args} fileInputRef={fileInputRef} />;
};

const meta = {
  title: "Features/Settings/DataManagementSection",
  component: DataManagementSection,
  parameters: {
    layout: "padded",
  },
  args: {
    setExportOptions: fn(),
    setImportOptions: fn(),
    handleExport: fn(),
    handleImportClick: fn(),
    handleImport: fn(),
    fileInputRef: { current: null } as RefObject<HTMLInputElement | null>,
  },
  render: DataManagementSectionWithRef,
} satisfies Meta<typeof DataManagementSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  args: {
    exportOptions: ALL_TRANSFER_OPTIONS,
    importOptions: ALL_TRANSFER_OPTIONS,
    exportStatus: "idle",
    importStatus: "idle",
  },
};

export const NoOptionsSelected: Story = {
  args: {
    exportOptions: EMPTY_TRANSFER_OPTIONS,
    importOptions: EMPTY_TRANSFER_OPTIONS,
    exportStatus: "idle",
    importStatus: "idle",
  },
};

export const ExportSuccess: Story = {
  args: {
    exportOptions: ALL_TRANSFER_OPTIONS,
    importOptions: ALL_TRANSFER_OPTIONS,
    exportStatus: "success",
    importStatus: "idle",
  },
};

export const ImportSuccess: Story = {
  args: {
    exportOptions: ALL_TRANSFER_OPTIONS,
    importOptions: ALL_TRANSFER_OPTIONS,
    exportStatus: "idle",
    importStatus: "success",
  },
};

export const ExportError: Story = {
  args: {
    exportOptions: ALL_TRANSFER_OPTIONS,
    importOptions: ALL_TRANSFER_OPTIONS,
    exportStatus: "error",
    importStatus: "idle",
  },
};
