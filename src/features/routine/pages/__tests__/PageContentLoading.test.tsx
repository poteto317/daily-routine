import { render, screen } from "@testing-library/react";
import { PageContentLoading } from "../PageContentLoading";

describe("PageContentLoading", () => {
  it("読み込み中であることを支援技術へ通知する", () => {
    render(<PageContentLoading />);

    const loadingStatus = screen.getByRole("status");
    expect(loadingStatus).toHaveTextContent("画面を読み込んでいます...");
    expect(loadingStatus).toHaveAttribute("aria-live", "polite");
    expect(loadingStatus).toHaveAttribute("aria-busy", "true");
  });
});
