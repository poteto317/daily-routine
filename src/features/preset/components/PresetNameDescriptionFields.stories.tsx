import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { PresetNameDescriptionFields } from "./PresetNameDescriptionFields";

const meta = {
  title: "Features/Preset/PresetNameDescriptionFields",
  component: PresetNameDescriptionFields,
  parameters: { layout: "padded" },
  args: {
    namePlaceholder: "例: 平日モーニングルーティン",
    descriptionPlaceholder: "プリセットの説明を入力",
    onChangeName: fn(),
    onChangeDescription: fn(),
  },
} satisfies Meta<typeof PresetNameDescriptionFields>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 未入力。プレースホルダだけが見えている状態 */
export const Empty: Story = {
  args: {
    name: "",
    description: "",
  },
};

/** 入力済み。プレースホルダが消えても aria-label で名前が引ける */
export const WithValues: Story = {
  args: {
    name: "朝のルーティン",
    description: "平日の朝に使うセット",
  },
};

/** 名前を入力 → onChangeName に入力値が渡る */
export const TypeName: Story = {
  args: {
    name: "",
    description: "",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const nameInput = canvas.getByRole("textbox", { name: "プリセット名" });
    await userEvent.type(nameInput, "夜");
    expect(args.onChangeName).toHaveBeenCalledWith("夜");
  },
};
