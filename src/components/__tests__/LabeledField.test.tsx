import { render, screen } from "@testing-library/react";
import { LabeledField } from "../LabeledField";

describe("LabeledField", () => {
  it("ラベルの文字列で中の入力欄を引ける", () => {
    render(
      <LabeledField label="開始時間">
        {(id) => <input id={id} type="time" />}
      </LabeledField>,
    );

    expect(screen.getByLabelText("開始時間")).toBeInTheDocument();
  });

  it("ラベルと入力欄が id で結び付いている", () => {
    render(
      <LabeledField label="開始時間">
        {(id) => <input id={id} type="time" />}
      </LabeledField>,
    );

    const input = screen.getByLabelText("開始時間");
    expect(screen.getByText("開始時間")).toHaveAttribute("for", input.id);
  });

  it("複数並べても id が衝突しない", () => {
    render(
      <>
        <LabeledField label="1つ目">
          {(id) => <input id={id} type="text" />}
        </LabeledField>
        <LabeledField label="2つ目">
          {(id) => <input id={id} type="text" />}
        </LabeledField>
      </>,
    );

    expect(screen.getByLabelText("1つ目").id).not.toBe(
      screen.getByLabelText("2つ目").id,
    );
  });

  it("ラベルに追加のクラスを渡せる", () => {
    render(
      <LabeledField label="ラベル" labelClassName="mb-2">
        {(id) => <input id={id} type="text" />}
      </LabeledField>,
    );

    expect(screen.getByText("ラベル")).toHaveClass("mb-2");
  });

  it("入力欄の下に補足を置ける", () => {
    render(
      <LabeledField label="所要時間">
        {(id) => (
          <>
            <input id={id} type="number" />
            <p>分単位で入力します</p>
          </>
        )}
      </LabeledField>,
    );

    expect(screen.getByText("分単位で入力します")).toBeInTheDocument();
  });

  it("ラベルの横に飾りを置ける", () => {
    render(
      <LabeledField label="通知" labelAdornment={<span>BETA</span>}>
        {(id) => <input id={id} type="number" />}
      </LabeledField>,
    );

    expect(screen.getByText("BETA")).toBeInTheDocument();
  });

  it("飾りを置いてもラベルと入力欄の紐付けは保たれる", () => {
    render(
      <LabeledField label="通知" labelAdornment={<span>BETA</span>}>
        {(id) => <input id={id} type="number" />}
      </LabeledField>,
    );

    const input = screen.getByLabelText("通知");
    expect(screen.getByText("通知")).toHaveAttribute("for", input.id);
  });

  it("飾りはアクセシブル名に混ざらない", () => {
    // バッジの文字までラベルとして読み上げると、項目名が濁る
    render(
      <LabeledField label="通知" labelAdornment={<span>BETA</span>}>
        {(id) => <input id={id} type="number" />}
      </LabeledField>,
    );

    expect(screen.getByLabelText("通知")).toBeInTheDocument();
    expect(screen.queryByLabelText("通知 BETA")).not.toBeInTheDocument();
  });
});
