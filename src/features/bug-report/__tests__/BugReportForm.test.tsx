import { fireEvent, render, screen } from "@testing-library/react";
import { BugReportForm } from "../components/BugReportForm";
import texts from "../locales/ja.json";

const defaultImageAttachments = {
  images: [] as File[],
  previews: [] as string[],
  errors: [] as ("unsupportedType" | "tooLarge" | "tooMany")[],
  addImages: jest.fn(),
  removeImage: jest.fn(),
  clearImages: jest.fn(),
};

const defaultProps = {
  description: "",
  setDescription: jest.fn(),
  stepsToReproduce: "",
  setStepsToReproduce: jest.fn(),
  imageAttachments: defaultImageAttachments,
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
    expect(
      screen.getByLabelText(texts.form.descriptionLabel),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(texts.form.stepsLabel)).toBeInTheDocument();
    expect(screen.getByLabelText(texts.form.imagesLabel)).toBeInTheDocument();
  });

  it("props の値を各フィールドに反映する", () => {
    render(
      <BugReportForm
        {...defaultProps}
        description="説明文"
        stepsToReproduce="手順1"
      />,
    );
    expect(screen.getByLabelText(texts.form.descriptionLabel)).toHaveValue(
      "説明文",
    );
    expect(screen.getByLabelText(texts.form.stepsLabel)).toHaveValue("手順1");
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
    render(
      <BugReportForm
        {...defaultProps}
        setStepsToReproduce={setStepsToReproduce}
      />,
    );
    fireEvent.change(screen.getByLabelText(texts.form.stepsLabel), {
      target: { value: "1. 画面を開く" },
    });
    expect(setStepsToReproduce).toHaveBeenCalledWith("1. 画面を開く");
  });

  it("ボタンクリックで handleSubmit を呼ぶ", () => {
    const handleSubmit = jest.fn().mockResolvedValue(undefined);
    render(<BugReportForm {...defaultProps} handleSubmit={handleSubmit} />);
    fireEvent.click(
      screen.getByRole("button", { name: texts.form.submitLabel }),
    );
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it("form 要素として描画され aria-label が付与されている（アクセシビリティ・セマンティクス）", () => {
    render(<BugReportForm {...defaultProps} />);
    expect(
      screen.getByRole("form", { name: texts.form.formAriaLabel }),
    ).toBeInTheDocument();
  });

  it("送信ボタンは type='submit' 属性を持つ", () => {
    render(<BugReportForm {...defaultProps} />);
    const button = screen.getByRole("button", { name: texts.form.submitLabel });
    expect(button).toHaveAttribute("type", "submit");
  });

  it("form の submit イベントで handleSubmit を呼ぶ（Enter キー送信相当）", () => {
    const handleSubmit = jest.fn().mockResolvedValue(undefined);
    render(<BugReportForm {...defaultProps} handleSubmit={handleSubmit} />);
    fireEvent.submit(
      screen.getByRole("form", { name: texts.form.formAriaLabel }),
    );
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it("status が idle のときボタンとファイル入力は enabled になる", () => {
    render(<BugReportForm {...defaultProps} status="idle" />);
    const button = screen.getByRole("button", { name: texts.form.submitLabel });
    expect(button).not.toBeDisabled();
    expect(screen.getByLabelText(texts.form.imagesLabel)).not.toBeDisabled();
  });

  it("status が submitting のとき説明・再現手順・画像ピッカー・ボタンがすべて disabled になる", () => {
    const file = new File([new Uint8Array(8)], "1.png", { type: "image/png" });
    render(
      <BugReportForm
        {...defaultProps}
        status="submitting"
        imageAttachments={{
          ...defaultImageAttachments,
          images: [file],
          previews: ["blob:1"],
        }}
      />,
    );
    expect(screen.getByLabelText(texts.form.descriptionLabel)).toBeDisabled();
    expect(screen.getByLabelText(texts.form.stepsLabel)).toBeDisabled();
    const button = screen.getByRole("button", {
      name: texts.form.submittingLabel,
    });
    expect(button).toBeDisabled();
    expect(screen.getByLabelText(texts.form.imagesLabel)).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "添付画像 1 を外す" }),
    ).toBeDisabled();
  });

  it("privacyNote を表示する", () => {
    render(<BugReportForm {...defaultProps} />);
    expect(screen.getByText(texts.form.privacyNote)).toBeInTheDocument();
  });

  it("各入力フィールドにプレースホルダーを表示する", () => {
    render(<BugReportForm {...defaultProps} />);
    expect(
      screen.getByPlaceholderText(texts.form.descriptionPlaceholder),
    ).toBeInTheDocument();
    // stepsPlaceholder は \n を含むため getByPlaceholderText が使えない — 属性で検証する
    expect(screen.getByLabelText(texts.form.stepsLabel)).toHaveAttribute(
      "placeholder",
      texts.form.stepsPlaceholder,
    );
  });

  it("各入力要素は htmlFor/id で対応するラベルと関連付けられている", () => {
    render(<BugReportForm {...defaultProps} />);
    expect(
      screen.getByRole("textbox", { name: texts.form.descriptionLabel }),
    ).toHaveAttribute("id", "bug-description");
    expect(
      screen.getByRole("textbox", { name: texts.form.stepsLabel }),
    ).toHaveAttribute("id", "bug-steps");
    expect(screen.getByLabelText(texts.form.imagesLabel)).toHaveAttribute(
      "id",
      "bug-images",
    );
  });
});
