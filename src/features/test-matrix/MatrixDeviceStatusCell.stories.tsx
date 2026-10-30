import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { MatrixDeviceStatusCell } from "./MatrixDeviceStatusCell";

const meta = {
  title: "Features/TestMatrix/MatrixDeviceStatusCell",
  component: MatrixDeviceStatusCell,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <table>
        <tbody>
          <tr>
            <Story />
          </tr>
        </tbody>
      </table>
    ),
  ],
  args: {
    status: "ok",
    statusTitleLabel: "PC",
    hasDetail: false,
    okCount: 0,
    totalCount: 0,
    onToggle: fn(),
  },
} satisfies Meta<typeof MatrixDeviceStatusCell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
