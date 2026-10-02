import { render, screen } from "@testing-library/react";
import { SectionCard } from "../SectionCard";

describe("SectionCard", () => {
  it("タイトルと子要素をレンダリングする", () => {
    render(
      <SectionCard title="基本設定">
        <div>カードのコンテンツ</div>
      </SectionCard>,
    );

    expect(screen.getByText("基本設定")).toBeInTheDocument();
    expect(screen.getByText("カードのコンテンツ")).toBeInTheDocument();
    expect(screen.queryByText("Beta")).not.toBeInTheDocument();
  });

  it("beta=true の場合は Beta バッジを表示する", () => {
    render(
      <SectionCard title="実験的機能" beta>
        <div>コンテンツ</div>
      </SectionCard>,
    );

    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("description が渡された場合は説明テキストを表示する", () => {
    render(
      <SectionCard
        title="通知設定"
        description="リマインダー通知をカスタマイズします"
        className="custom-class"
      >
        <div>コンテンツ</div>
      </SectionCard>,
    );

    expect(
      screen.getByText("リマインダー通知をカスタマイズします"),
    ).toBeInTheDocument();
  });
});
