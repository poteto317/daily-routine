import { fireEvent, render, screen } from "@testing-library/react";
import { BugReportImagePicker } from "../components/BugReportImagePicker";
import { BUG_REPORT_IMAGE_ACCEPT } from "../constants";
import texts from "../locales/ja.json";

const createFile = (name: string, type = "image/png"): File =>
  new File([new Uint8Array(8)], name, { type });

const defaultProps = {
  images: [] as File[],
  previews: [] as string[],
  errors: [] as ("unsupportedType" | "tooLarge" | "tooMany")[],
  disabled: false,
  onAdd: jest.fn(),
  onRemove: jest.fn(),
};

describe("BugReportImagePicker", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("ファイル入力に accept / multiple / type='file' が付与され、ラベルとヒントが表示・関連付けされる", () => {
    render(<BugReportImagePicker {...defaultProps} />);

    const input = screen.getByLabelText(texts.form.imagesLabel);
    expect(input).toHaveAttribute("type", "file");
    expect(input).toHaveAttribute("accept", BUG_REPORT_IMAGE_ACCEPT);
    expect(input).toHaveAttribute("multiple");
    expect(input).toHaveAttribute("aria-describedby", "bug-images-hint");

    const hint = screen.getByText(texts.form.imagesHint);
    expect(hint).toBeInTheDocument();
    expect(hint).toHaveAttribute("id", "bug-images-hint");
  });

  it("ファイルを選択すると onAdd に File[] が渡り、入力の value が空に戻る", () => {
    const onAdd = jest.fn();
    render(<BugReportImagePicker {...defaultProps} onAdd={onAdd} />);

    const input = screen.getByLabelText(
      texts.form.imagesLabel,
    ) as HTMLInputElement;
    const f1 = createFile("1.png");
    const f2 = createFile("2.jpg", "image/jpeg");

    fireEvent.change(input, {
      target: { files: [f1, f2] },
    });

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith([f1, f2]);
    expect(input.value).toBe("");
  });

  it("files が空の change イベントでは onAdd を呼ばない", () => {
    const onAdd = jest.fn();
    render(<BugReportImagePicker {...defaultProps} onAdd={onAdd} />);

    const input = screen.getByLabelText(texts.form.imagesLabel);
    fireEvent.change(input, { target: { files: [] } });

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("画像があるときサムネイルと外すボタンが表示され、押すと onRemove(index) を呼ぶ", () => {
    const onRemove = jest.fn();
    const f1 = createFile("1.png");
    const f2 = createFile("2.png");

    render(
      <BugReportImagePicker
        {...defaultProps}
        images={[f1, f2]}
        previews={["blob:1", "blob:2"]}
        onRemove={onRemove}
      />,
    );

    const img1 = screen.getByAltText("添付画像 1");
    const img2 = screen.getByAltText("添付画像 2");
    expect(img1).toHaveAttribute("src", "blob:1");
    expect(img2).toHaveAttribute("src", "blob:2");

    fireEvent.click(screen.getByRole("button", { name: "添付画像 2 を外す" }));
    expect(onRemove).toHaveBeenCalledWith(1);
  });

  it("画像が MAX_BUG_REPORT_IMAGES (3枚) に達するとファイル入力が disabled になる（外すボタンは押せる）", () => {
    const f1 = createFile("1.png");
    const f2 = createFile("2.png");
    const f3 = createFile("3.png");

    render(
      <BugReportImagePicker
        {...defaultProps}
        images={[f1, f2, f3]}
        previews={["blob:1", "blob:2", "blob:3"]}
      />,
    );

    expect(screen.getByLabelText(texts.form.imagesLabel)).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "添付画像 1 を外す" }),
    ).not.toBeDisabled();
  });

  it("disabled=true のときはファイル入力と外すボタンがどちらも disabled になる", () => {
    const f1 = createFile("1.png");

    render(
      <BugReportImagePicker
        {...defaultProps}
        images={[f1]}
        previews={["blob:1"]}
        disabled={true}
      />,
    );

    expect(screen.getByLabelText(texts.form.imagesLabel)).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "添付画像 1 を外す" }),
    ).toBeDisabled();
  });

  it("errors ごとの文言が role='alert' に表示され、空のときは表示されない", () => {
    const { rerender } = render(<BugReportImagePicker {...defaultProps} />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    rerender(
      <BugReportImagePicker
        {...defaultProps}
        errors={["unsupportedType", "tooLarge", "tooMany"]}
      />,
    );

    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(
      screen.getByText(texts.validation.imageUnsupportedType),
    ).toBeInTheDocument();
    expect(
      screen.getByText(texts.validation.imageTooLarge),
    ).toBeInTheDocument();
    expect(screen.getByText(texts.validation.imageTooMany)).toBeInTheDocument();
  });
});
