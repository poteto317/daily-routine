import { fireEvent, render, screen } from "@testing-library/react";
import { NumberInputField } from "../components/NumberInputField";

const defaultProps = {
  label: "デフォルトの所要時間",
  description: "新しいルーティンの初期値",
  value: "30",
  onChange: jest.fn(),
  min: 1,
  max: 240,
  errorText: "1〜240の範囲で入力してください",
  hint: "分単位で入力します",
};

describe("NumberInputField", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("ラベルの文字列で入力欄を引ける", () => {
    // label と input が紐付いていないと、読み上げでも項目名が分からない
    render(<NumberInputField {...defaultProps} />);

    expect(screen.getByLabelText("デフォルトの所要時間")).toBeInTheDocument();
  });

  it("ラベルと入力欄が id で結び付いている", () => {
    // 紐付いていればラベルをタップしたときに入力欄へフォーカスが移る
    render(<NumberInputField {...defaultProps} />);

    const input = screen.getByLabelText("デフォルトの所要時間");
    const label = screen.getByText("デフォルトの所要時間");

    expect(input.id).not.toBe("");
    expect(label).toHaveAttribute("for", input.id);
  });

  it("複数並べても id が衝突しない", () => {
    render(
      <>
        <NumberInputField {...defaultProps} label="1つ目" />
        <NumberInputField {...defaultProps} label="2つ目" />
      </>,
    );

    const first = screen.getByLabelText("1つ目");
    const second = screen.getByLabelText("2つ目");

    expect(first.id).not.toBe(second.id);
  });

  it("入力するとonChangeに値を渡す", () => {
    const onChange = jest.fn();
    render(<NumberInputField {...defaultProps} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("デフォルトの所要時間"), {
      target: { value: "45" },
    });

    expect(onChange).toHaveBeenCalledWith("45");
  });

  it("範囲外の値ならエラー文言を表示する", () => {
    render(<NumberInputField {...defaultProps} value="999" />);

    expect(
      screen.getByText("1〜240の範囲で入力してください"),
    ).toBeInTheDocument();
  });

  it("範囲内ならエラー文言を表示しない", () => {
    render(<NumberInputField {...defaultProps} value="30" />);

    expect(
      screen.queryByText("1〜240の範囲で入力してください"),
    ).not.toBeInTheDocument();
  });

  it("明るいカード上の入力欄の背景・文字色（dark:bg-white・dark:text-gray-900）だけが付く", () => {
    // 同じ要素に dark: の背景を 2 つ付けると、CSS の出力順で勝ち負けが決まってしまう
    render(<NumberInputField {...defaultProps} />);
    const input = screen.getByLabelText("デフォルトの所要時間");
    const classes = input.className.split(/\s+/);

    expect(classes.filter((c) => c.startsWith("dark:bg-"))).toEqual([
      "dark:bg-white",
    ]);
    expect(classes.filter((c) => c.startsWith("dark:text-"))).toEqual([
      "dark:text-gray-900",
    ]);
  });

  it("通常時は、ダークモードの枠の色（dark:border-gray-400）が付く", () => {
    render(<NumberInputField {...defaultProps} />);
    const classes = screen
      .getByLabelText("デフォルトの所要時間")
      .className.split(/\s+/);

    expect(classes).toContain("dark:border-gray-400");
    expect(classes).not.toContain("border-red-500");
  });

  it("範囲外の値では、ダークモードでも赤い枠だけが付く", () => {
    // 正常時の dark:border-* が残ると、詳細度で赤い枠が消える
    render(<NumberInputField {...defaultProps} value="999" />);
    const classes = screen
      .getByLabelText("デフォルトの所要時間")
      .className.split(/\s+/);

    expect(classes).toContain("border-red-500");
    expect(classes.filter((c) => c.startsWith("dark:border-"))).toEqual([]);
  });
});
