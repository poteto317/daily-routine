import { fireEvent, render, screen } from "@testing-library/react";
import { PresetCardEditButton } from "../components/PresetCardEditButton";

describe("PresetCardEditButton", () => {
  it("編集ボタンを絵文字+テキストの可視ラベルで表示する", () => {
    render(<PresetCardEditButton onClick={jest.fn()} />);
    expect(
      screen.getByRole("button", { name: "プリセットを編集" }),
    ).toHaveTextContent("✏️ 編集");
  });

  it("クリックで onClick が呼ばれる", () => {
    const onClick = jest.fn();
    render(<PresetCardEditButton onClick={onClick} />);
    fireEvent.click(screen.getByRole("button", { name: "プリセットを編集" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("クリックイベントの伝播を止める（カード選択の誤発火防止）", () => {
    const onClick = jest.fn();
    const onParentClick = jest.fn();
    render(
      <div onClick={onParentClick}>
        <PresetCardEditButton onClick={onClick} />
      </div>,
    );
    fireEvent.click(screen.getByRole("button", { name: "プリセットを編集" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onParentClick).not.toHaveBeenCalled();
  });
});
