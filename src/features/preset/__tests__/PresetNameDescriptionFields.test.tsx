import { fireEvent, render, screen } from "@testing-library/react";
import { PresetNameDescriptionFields } from "../components/PresetNameDescriptionFields";

const defaultProps = {
  name: "",
  description: "",
  namePlaceholder: "プリセット名を入力",
  descriptionPlaceholder: "説明を入力",
  onChangeName: jest.fn(),
  onChangeDescription: jest.fn(),
};

describe("PresetNameDescriptionFields", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("渡された値を表示する", () => {
    render(
      <PresetNameDescriptionFields
        {...defaultProps}
        name="朝のセット"
        description="平日に使う"
      />,
    );

    expect(screen.getByDisplayValue("朝のセット")).toBeInTheDocument();
    expect(screen.getByDisplayValue("平日に使う")).toBeInTheDocument();
  });

  it("渡されたプレースホルダを表示する", () => {
    render(<PresetNameDescriptionFields {...defaultProps} />);

    expect(
      screen.getByPlaceholderText("プリセット名を入力"),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("説明を入力")).toBeInTheDocument();
  });

  it("名前を編集すると onChangeName に入力値を渡す", () => {
    const onChangeName = jest.fn();
    render(
      <PresetNameDescriptionFields
        {...defaultProps}
        onChangeName={onChangeName}
      />,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "プリセット名" }), {
      target: { value: "夜のセット" },
    });

    expect(onChangeName).toHaveBeenCalledWith("夜のセット");
  });

  it("説明を編集すると onChangeDescription に入力値を渡す", () => {
    const onChangeDescription = jest.fn();
    render(
      <PresetNameDescriptionFields
        {...defaultProps}
        onChangeDescription={onChangeDescription}
      />,
    );

    fireEvent.change(
      screen.getByRole("textbox", { name: "プリセットの説明" }),
      {
        target: { value: "週末用" },
      },
    );

    expect(onChangeDescription).toHaveBeenCalledWith("週末用");
  });

  it("プレースホルダが消えても支援技術から名前で引ける", () => {
    // placeholder は入力が始まると消えるため、名前の代わりにはならない
    render(<PresetNameDescriptionFields {...defaultProps} name="入力済み" />);

    expect(screen.getByRole("textbox", { name: "プリセット名" })).toHaveValue(
      "入力済み",
    );
  });
});
