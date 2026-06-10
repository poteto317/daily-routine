import { fireEvent, render, screen } from "@testing-library/react";
import { BugReportForm } from "../components/BugReportForm";
import texts from "../locales/ja.json";

const defaultProps = {
  title: "",
  setTitle: jest.fn(),
  description: "",
  setDescription: jest.fn(),
  stepsToReproduce: "",
  setStepsToReproduce: jest.fn(),
  status: "idle" as const,
  errorMessage: "",
  handleSubmit: jest.fn().mockResolvedValue(undefined),
};

describe("BugReportForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("全フィールドとラベルを表示する", () => {
    render(<BugReportForm {...defaultProps} />);
    expect(screen.getByLabelText(texts.form.titleLabel)).toBeInTheDocument();
    expect(screen.getByLabelText(texts.form.descriptionLabel)).toBeInTheDocument();
    expect(screen.getByLabelText(texts.form.stepsLabel)).toBeInTheDocument();
  });

  it("props の値を各フィールドに反映する", () => {
    render(
      <BugReportForm
        {...defaultProps}
        title="タイトル"
        description="説明文"
        stepsToReproduce="手順1"
      />,
    );
    expect(screen.getByLabelText(texts.form.titleLabel)).toHaveValue("タイトル");
    expect(screen.getByLabelText(texts.form.descriptionLabel)).toHaveValue("説明文");
    expect(screen.getByLabelText(texts.form.stepsLabel)).toHaveValue("手順1");
  });

  it("タイトル入力時に setTitle を呼ぶ", () => {
    const setTitle = jest.fn();
    render(<BugReportForm {...defaultProps} setTitle={setTitle} />);
    fireEvent.change(screen.getByLabelText(texts.form.titleLabel), {
      target: { value: "新タイトル" },
    });
    expect(setTitle).toHaveBeenCalledWith("新タイトル");
  });

  it("説明入力時に setDescription を呼ぶ", () => {
    const setDescription = jest.fn();
    render(<BugReportForm {...defaultProps} setDescription={setDescription} />);
    fireEvent.change(screen.getByLabelText(texts.form.descriptionLabel), {
      target: { value: "不具合の詳細" },
    });
    expect(setDescription).toHaveBeenCalledWith("不具合の詳細");
  });

  it("再現手順入力時に setStepsToReproduce を呼ぶ", () => {
    const setStepsToReproduce = jest.fn();
    render(<BugReportForm {...defaultProps} setStepsToReproduce={setStepsToReproduce} />);
    fireEvent.change(screen.getByLabelText(texts.form.stepsLabel), {
      target: { value: "1. 画面を開く" },
    });
    expect(setStepsToReproduce).toHaveBeenCalledWith("1. 画面を開く");
  });

  it("ボタンクリックで handleSubmit を呼ぶ", () => {
    const handleSubmit = jest.fn().mockResolvedValue(undefined);
    render(<BugReportForm {...defaultProps} handleSubmit={handleSubmit} />);
    fireEvent.click(screen.getByRole("button", { name: texts.form.submitLabel }));
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it("status が idle のときボタンは enabled で送信ラベルを表示する", () => {
    render(<BugReportForm {...defaultProps} status="idle" />);
    const button = screen.getByRole("button", { name: texts.form.submitLabel });
    expect(button).not.toBeDisabled();
  });

  it("status が submitting のときボタンは disabled で送信中ラベルを表示する", () => {
    render(<BugReportForm {...defaultProps} status="submitting" />);
    const button = screen.getByRole("button", { name: texts.form.submittingLabel });
    expect(button).toBeDisabled();
  });

  it("privacyNote を表示する", () => {
    render(<BugReportForm {...defaultProps} />);
    expect(screen.getByText(texts.form.privacyNote)).toBeInTheDocument();
  });

  it("各入力フィールドにプレースホルダーを表示する", () => {
    render(<BugReportForm {...defaultProps} />);
    expect(screen.getByPlaceholderText(texts.form.titlePlaceholder)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(texts.form.descriptionPlaceholder)).toBeInTheDocument();
    // stepsPlaceholder は \n を含むため getByPlaceholderText が使えない — 属性で検証する
    expect(screen.getByLabelText(texts.form.stepsLabel)).toHaveAttribute(
      "placeholder",
      texts.form.stepsPlaceholder,
    );
  });

  it("各入力要素は htmlFor/id で対応するラベルと関連付けられている", () => {
    render(<BugReportForm {...defaultProps} />);
    expect(screen.getByRole("textbox", { name: texts.form.titleLabel })).toHaveAttribute("id", "bug-title");
    expect(screen.getByRole("textbox", { name: texts.form.descriptionLabel })).toHaveAttribute("id", "bug-description");
    expect(screen.getByRole("textbox", { name: texts.form.stepsLabel })).toHaveAttribute("id", "bug-steps");
  });
});
