import { render, screen } from "@testing-library/react";
import { FieldGroup } from "../FieldGroup";

describe("FieldGroup", () => {
  it("見出しの文字列でグループを引ける", () => {
    render(
      <FieldGroup label="カテゴリ">
        <button type="button">仕事</button>
      </FieldGroup>,
    );

    expect(screen.getByRole("group", { name: "カテゴリ" })).toBeInTheDocument();
  });

  it("見出しを label 要素にしない", () => {
    // 何も指していない <label> は、紐付いていない label を増やすだけになる
    const { container } = render(
      <FieldGroup label="カテゴリ">
        <button type="button">仕事</button>
      </FieldGroup>,
    );

    expect(container.querySelector("label")).toBeNull();
  });

  it("見出しの文言はひとつだけ置く", () => {
    // aria-label と見出しの両方に同じ文言を置くと、読み上げで同じ語が続く
    render(
      <FieldGroup label="カテゴリ">
        <button type="button">仕事</button>
      </FieldGroup>,
    );

    expect(screen.getAllByText("カテゴリ")).toHaveLength(1);
  });

  it("複数並べても見出しの id が衝突しない", () => {
    render(
      <>
        <FieldGroup label="1つ目">
          <button type="button">A</button>
        </FieldGroup>
        <FieldGroup label="2つ目">
          <button type="button">B</button>
        </FieldGroup>
      </>,
    );

    expect(screen.getByRole("group", { name: "1つ目" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "2つ目" })).toBeInTheDocument();
  });

  it("中のボタンをそのまま描く", () => {
    render(
      <FieldGroup label="カテゴリ">
        <button type="button">仕事</button>
        <button type="button">健康</button>
      </FieldGroup>,
    );

    expect(screen.getAllByRole("button")).toHaveLength(2);
  });

  it("グループの並びにクラスを渡せる", () => {
    render(
      <FieldGroup label="カテゴリ" groupClassName="grid grid-cols-3 gap-2">
        <button type="button">仕事</button>
      </FieldGroup>,
    );

    expect(screen.getByRole("group", { name: "カテゴリ" })).toHaveClass(
      "grid-cols-3",
    );
  });

  it("見出しには既定のクラスを付ける", () => {
    render(
      <FieldGroup label="カテゴリ">
        <button type="button">仕事</button>
      </FieldGroup>,
    );

    expect(screen.getByText("カテゴリ")).toHaveClass(
      "block",
      "text-sm",
      "mb-2",
    );
  });

  it("見出しのクラスを差し替えられる", () => {
    render(
      <FieldGroup label="カテゴリ" labelClassName="sr-only">
        <button type="button">仕事</button>
      </FieldGroup>,
    );

    const heading = screen.getByText("カテゴリ");
    expect(heading).toHaveClass("sr-only");
    expect(heading).not.toHaveClass("mb-2");
    // 見た目を変えてもグループの名前は見出しから引ける
    expect(screen.getByRole("group", { name: "カテゴリ" })).toBeInTheDocument();
  });
});
