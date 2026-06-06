import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BugReportSection } from "../components/BugReportSection";
import { submitBugReport } from "../api";
import texts from "../locales/ja.json";

jest.mock("../api", () => ({
  submitBugReport: jest.fn(),
}));

const mockedSubmit = submitBugReport as jest.Mock;

describe("BugReportSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("セクションのタイトルとフォームを表示する", () => {
    render(<BugReportSection />);
    expect(screen.getByText(texts.section.title)).toBeInTheDocument();
    expect(screen.getByText(texts.section.description)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: texts.form.submitLabel }),
    ).toBeInTheDocument();
  });

  it("内容未入力で送信するとバリデーションエラーを表示する", async () => {
    render(<BugReportSection />);

    fireEvent.click(
      screen.getByRole("button", { name: texts.form.submitLabel }),
    );

    expect(
      await screen.findByText(texts.validation.descriptionRequired),
    ).toBeInTheDocument();
    expect(mockedSubmit).not.toHaveBeenCalled();
  });

  it("内容を入力して送信すると submitBugReport を呼び成功表示する", async () => {
    mockedSubmit.mockResolvedValue("report-1");
    render(<BugReportSection />);

    fireEvent.change(
      screen.getByLabelText(texts.form.descriptionLabel),
      { target: { value: "通知が表示されない" } },
    );
    fireEvent.click(
      screen.getByRole("button", { name: texts.form.submitLabel }),
    );

    await waitFor(() => {
      expect(mockedSubmit).toHaveBeenCalledWith({
        title: "",
        description: "通知が表示されない",
        stepsToReproduce: "",
      });
    });
    expect(
      await screen.findByText(texts.status.success),
    ).toBeInTheDocument();
  });

  it("送信中はボタンが disabled になり送信中ラベルを表示する", async () => {
    let resolveSubmit!: (id: string) => void;
    mockedSubmit.mockImplementation(
      () => new Promise<string>((resolve) => { resolveSubmit = resolve; }),
    );
    render(<BugReportSection />);

    fireEvent.change(
      screen.getByLabelText(texts.form.descriptionLabel),
      { target: { value: "不具合内容" } },
    );
    fireEvent.click(
      screen.getByRole("button", { name: texts.form.submitLabel }),
    );

    expect(
      screen.getByRole("button", { name: texts.form.submittingLabel }),
    ).toBeDisabled();

    await act(async () => { resolveSubmit("id"); });
  });

  it("submitBugReport が失敗した場合、エラーメッセージを表示する", async () => {
    mockedSubmit.mockRejectedValue(new Error("network error"));
    render(<BugReportSection />);

    fireEvent.change(
      screen.getByLabelText(texts.form.descriptionLabel),
      { target: { value: "不具合の内容" } },
    );
    fireEvent.click(
      screen.getByRole("button", { name: texts.form.submitLabel }),
    );

    expect(
      await screen.findByText(texts.status.submitError),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("送信成功後、フォームの全フィールドがクリアされる", async () => {
    mockedSubmit.mockResolvedValue("report-clear");
    render(<BugReportSection />);

    fireEvent.change(
      screen.getByLabelText(texts.form.titleLabel),
      { target: { value: "件名" } },
    );
    fireEvent.change(
      screen.getByLabelText(texts.form.descriptionLabel),
      { target: { value: "不具合の内容" } },
    );
    fireEvent.change(
      screen.getByLabelText(texts.form.stepsLabel),
      { target: { value: "1. 操作する" } },
    );
    fireEvent.click(
      screen.getByRole("button", { name: texts.form.submitLabel }),
    );

    await waitFor(() => {
      expect(screen.getByLabelText(texts.form.titleLabel)).toHaveValue("");
      expect(screen.getByLabelText(texts.form.descriptionLabel)).toHaveValue("");
      expect(screen.getByLabelText(texts.form.stepsLabel)).toHaveValue("");
    });
  });

  it("タイトルと再現手順を入力して送信すると submitBugReport に正しく渡る", async () => {
    mockedSubmit.mockResolvedValue("report-2");
    render(<BugReportSection />);

    fireEvent.change(
      screen.getByLabelText(texts.form.titleLabel),
      { target: { value: "件名テスト" } },
    );
    fireEvent.change(
      screen.getByLabelText(texts.form.descriptionLabel),
      { target: { value: "不具合の内容" } },
    );
    fireEvent.change(
      screen.getByLabelText(texts.form.stepsLabel),
      { target: { value: "1. 操作する" } },
    );
    fireEvent.click(
      screen.getByRole("button", { name: texts.form.submitLabel }),
    );

    await waitFor(() => {
      expect(mockedSubmit).toHaveBeenCalledWith({
        title: "件名テスト",
        description: "不具合の内容",
        stepsToReproduce: "1. 操作する",
      });
    });
  });
});
