import { createRef, type ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { BudgetAllowanceTransferSection } from "../components/BudgetAllowanceTransferSection";
import texts from "../locales/ja.json";

const transferTexts = texts.allowanceSettings.transfer;

const buildProps = (
  overrides: Partial<
    ComponentProps<typeof BudgetAllowanceTransferSection>
  > = {},
) => ({
  fileInputRef: createRef<HTMLInputElement>(),
  status: null,
  isImporting: false,
  onExport: jest.fn(),
  onImportClick: jest.fn(),
  onFileChange: jest.fn(),
  ...overrides,
});

describe("BudgetAllowanceTransferSection", () => {
  it("見出しを h2 で表示する", () => {
    render(<BudgetAllowanceTransferSection {...buildProps()} />);

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      transferTexts.title,
    );
  });

  it("ボタンの押下でハンドラーが呼ばれる", () => {
    const props = buildProps();
    render(<BudgetAllowanceTransferSection {...props} />);

    fireEvent.click(screen.getByText(transferTexts.exportButton));
    expect(props.onExport).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText(transferTexts.importButton));
    expect(props.onImportClick).toHaveBeenCalledTimes(1);
  });

  it("読み込みの最中はインポートのボタンが無効で、文言が変わる", () => {
    render(
      <BudgetAllowanceTransferSection {...buildProps({ isImporting: true })} />,
    );

    expect(screen.queryByText(transferTexts.importButton)).toBeNull();
    expect(
      screen.getByRole("button", { name: transferTexts.importingLabel }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: transferTexts.exportButton }),
    ).toBeEnabled();
  });

  it("ファイル入力は JSON に絞り、ref と onChange を渡す", () => {
    const props = buildProps();
    render(<BudgetAllowanceTransferSection {...props} />);

    const input = screen.getByLabelText(transferTexts.fileInputLabel);
    expect(input).toHaveAttribute("type", "file");
    expect(input).toHaveAttribute("accept", "application/json,.json");
    expect(props.fileInputRef.current).toBe(input);

    fireEvent.change(input);
    expect(props.onFileChange).toHaveBeenCalledTimes(1);
  });

  it("成功のメッセージは status で表示する", () => {
    render(
      <BudgetAllowanceTransferSection
        {...buildProps({ status: { kind: "success", message: "できました" } })}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("できました");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("失敗のメッセージは alert で表示する", () => {
    render(
      <BudgetAllowanceTransferSection
        {...buildProps({ status: { kind: "error", message: "失敗しました" } })}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("失敗しました");
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("メッセージが無いときは何も表示しない", () => {
    render(<BudgetAllowanceTransferSection {...buildProps()} />);

    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
