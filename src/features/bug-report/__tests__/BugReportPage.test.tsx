import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { BugReportPage } from "../components/BugReportPage";
import { submitBugReport } from "../api";
import texts from "../locales/ja.json";

jest.mock("../api", () => ({
  submitBugReport: jest.fn(),
}));

const mockedSubmit = submitBugReport as jest.Mock;

const createFile = (name: string, type = "image/png"): File =>
  new File([new Uint8Array(8)], name, { type });

describe("BugReportPage", () => {
  let urlCounter = 0;

  beforeEach(() => {
    jest.clearAllMocks();
    urlCounter = 0;
    URL.createObjectURL = jest.fn(() => `blob:page-${++urlCounter}`);
    URL.revokeObjectURL = jest.fn();
  });

  it("ページのタイトルとフォームを表示する", () => {
    render(<BugReportPage />);
    expect(screen.getByText(texts.page.title)).toBeInTheDocument();
    expect(
      screen.queryByRole("textbox", { name: /タイトル/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(texts.page.description)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: texts.form.submitLabel }),
    ).toBeInTheDocument();
  });

  it("内容未入力で送信するとバリデーションエラーを表示する", async () => {
    render(<BugReportPage />);

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
    render(<BugReportPage />);

    fireEvent.change(screen.getByLabelText(texts.form.descriptionLabel), {
      target: { value: "通知が表示されない" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: texts.form.submitLabel }),
    );

    await waitFor(() => {
      expect(mockedSubmit).toHaveBeenCalledWith(
        {
          description: "通知が表示されない",
          stepsToReproduce: "",
        },
        [],
      );
    });
    expect(await screen.findByText(texts.status.success)).toBeInTheDocument();
  });

  it("送信中はボタンが disabled になり送信中ラベルを表示する", async () => {
    let resolveSubmit!: (id: string) => void;
    mockedSubmit.mockImplementation(
      () =>
        new Promise<string>((resolve) => {
          resolveSubmit = resolve;
        }),
    );
    render(<BugReportPage />);

    fireEvent.change(screen.getByLabelText(texts.form.descriptionLabel), {
      target: { value: "不具合内容" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: texts.form.submitLabel }),
    );

    expect(
      screen.getByRole("button", { name: texts.form.submittingLabel }),
    ).toBeDisabled();

    await act(async () => {
      resolveSubmit("id");
    });
  });

  it("submitBugReport が失敗した場合、エラーメッセージを表示する", async () => {
    mockedSubmit.mockRejectedValue(new Error("network error"));
    render(<BugReportPage />);

    fireEvent.change(screen.getByLabelText(texts.form.descriptionLabel), {
      target: { value: "不具合の内容" },
    });
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
    render(<BugReportPage />);

    fireEvent.change(screen.getByLabelText(texts.form.descriptionLabel), {
      target: { value: "不具合の内容" },
    });
    fireEvent.change(screen.getByLabelText(texts.form.stepsLabel), {
      target: { value: "1. 操作する" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: texts.form.submitLabel }),
    );

    await waitFor(() => {
      expect(screen.getByLabelText(texts.form.descriptionLabel)).toHaveValue(
        "",
      );
      expect(screen.getByLabelText(texts.form.stepsLabel)).toHaveValue("");
    });
  });

  it("内容と再現手順を入力して送信すると submitBugReport に正しく渡る", async () => {
    mockedSubmit.mockResolvedValue("report-2");
    render(<BugReportPage />);

    fireEvent.change(screen.getByLabelText(texts.form.descriptionLabel), {
      target: { value: "不具合の内容" },
    });
    fireEvent.change(screen.getByLabelText(texts.form.stepsLabel), {
      target: { value: "1. 操作する" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: texts.form.submitLabel }),
    );

    await waitFor(() => {
      expect(mockedSubmit).toHaveBeenCalledWith(
        {
          description: "不具合の内容",
          stepsToReproduce: "1. 操作する",
        },
        [],
      );
    });
  });

  it("画像を選択して外し、残った画像とともに送信すると submitBugReport の第2引数に渡り、成功後にサムネイルが消える", async () => {
    mockedSubmit.mockResolvedValue("report-with-images");
    render(<BugReportPage />);

    const f1 = createFile("first.png");
    const f2 = createFile("second.jpg", "image/jpeg");

    fireEvent.change(screen.getByLabelText(texts.form.imagesLabel), {
      target: { files: [f1, f2] },
    });

    expect(screen.getByAltText("添付画像 1")).toBeInTheDocument();
    expect(screen.getByAltText("添付画像 2")).toBeInTheDocument();

    // 1枚目を外す
    fireEvent.click(screen.getByRole("button", { name: "添付画像 1 を外す" }));
    expect(screen.queryByAltText("添付画像 2")).not.toBeInTheDocument();
    expect(screen.getByAltText("添付画像 1")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(texts.form.descriptionLabel), {
      target: { value: "画面が崩れる" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: texts.form.submitLabel }),
    );

    await waitFor(() => {
      expect(mockedSubmit).toHaveBeenCalledWith(
        {
          description: "画面が崩れる",
          stepsToReproduce: "",
        },
        [f2],
      );
    });

    await waitFor(() => {
      expect(screen.queryByAltText("添付画像 1")).not.toBeInTheDocument();
    });
  });
});
