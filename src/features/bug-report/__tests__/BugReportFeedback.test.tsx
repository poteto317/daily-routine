import { render, screen } from "@testing-library/react";
import { BugReportFeedback } from "../components/BugReportFeedback";
import texts from "../locales/ja.json";

describe("BugReportFeedback", () => {
  it("status が idle の場合は何も表示しない", () => {
    const { container } = render(
      <BugReportFeedback status="idle" errorMessage="" />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("status が submitting の場合は何も表示しない", () => {
    const { container } = render(
      <BugReportFeedback status="submitting" errorMessage="" />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("status が error かつ errorMessage がある場合はエラーを表示する", () => {
    render(
      <BugReportFeedback status="error" errorMessage="送信に失敗しました" />,
    );
    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent("送信に失敗しました");
  });

  it("status が error でも errorMessage が空の場合は何も表示しない", () => {
    const { container } = render(
      <BugReportFeedback status="error" errorMessage="" />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("status が success の場合は成功メッセージを表示する", () => {
    render(<BugReportFeedback status="success" errorMessage="" />);
    const status = screen.getByRole("status");
    expect(status).toBeInTheDocument();
    expect(status).toHaveTextContent(texts.status.success);
  });

  it("エラーメッセージは role=alert を持つ", () => {
    render(
      <BugReportFeedback status="error" errorMessage="エラーが発生" />,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("成功メッセージは role=status を持つ", () => {
    render(<BugReportFeedback status="success" errorMessage="" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
