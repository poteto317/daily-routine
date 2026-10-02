import React from "react";
import { render, screen } from "@testing-library/react";
import { RootErrorBoundary } from "../RootErrorBoundary";
import texts from "../locales/ja.json";

const ProblemChild = () => {
  throw new Error("Test error in component");
};

describe("RootErrorBoundary", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("エラーが発生しない場合は通常通り子コンポーネントを表示する", () => {
    render(
      <RootErrorBoundary>
        <div>正常なコンテンツ</div>
      </RootErrorBoundary>,
    );

    expect(screen.getByText("正常なコンテンツ")).toBeInTheDocument();
  });

  it("子コンポーネントでエラーが発生した場合はエラーフォールバックメッセージを表示する", () => {
    render(
      <RootErrorBoundary>
        <ProblemChild />
      </RootErrorBoundary>,
    );

    const alertElement = screen.getByRole("alert");
    expect(alertElement).toBeInTheDocument();
    expect(alertElement).toHaveTextContent(texts.rootErrorBoundary.message);
  });
});
