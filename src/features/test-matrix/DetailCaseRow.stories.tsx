import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { DetailCaseRow } from "./DetailCaseRow";

const meta = {
  title: "Features/TestMatrix/DetailCaseRow",
  component: DetailCaseRow,
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
    caseItem: {
      id: "c-1",
      scenario: "正常なメールアドレスとパスワードでログイン",
      expected: "ホーム画面に遷移する",
      pc: "ok",
      sp: "ng",
      note: "",
    },
    index: 0,
    onToggleStatus: fn(),
    onUpdateNote: fn(),
  },
} satisfies Meta<typeof DetailCaseRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
