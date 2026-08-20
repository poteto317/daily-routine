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
});
