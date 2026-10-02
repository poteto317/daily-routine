import { render, screen } from "@testing-library/react";
import { FullScreenLoading } from "../FullScreenLoading";

describe("FullScreenLoading", () => {
  it("指定されたメッセージをレンダリングする", () => {
    render(<FullScreenLoading message="読み込み中..." />);

    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });
});
