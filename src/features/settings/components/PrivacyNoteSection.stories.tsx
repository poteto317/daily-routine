import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PrivacyNoteSection } from "./PrivacyNoteSection";

const meta = {
  title: "Features/Settings/PrivacyNoteSection",
  component: PrivacyNoteSection,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof PrivacyNoteSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
