import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { MatrixItemRow } from "./MatrixItemRow";

const meta = {
  title: "Features/TestMatrix/MatrixItemRow",
  component: MatrixItemRow,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <table>
        <tbody>
          <Story />
        </tbody>
      </table>
    ),
  ],
  args: {
    categoryId: "cat-1",
    item: { id: "item-1", label: "ログイン", pc: "ok", sp: "ng", note: "" },
    detailData: {},
    onToggleStatus: fn(),
    onUpdateNote: fn(),
    onOpenDetail: fn(),
  },
} satisfies Meta<typeof MatrixItemRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
