import { fireEvent, render, screen } from "@testing-library/react";
import { PresetCardDuplicateButton } from "../components/PresetCardDuplicateButton";

describe("PresetCardDuplicateButton", () => {
  it("コピーボタンを絵文字+テキストの可視ラベルで表示する", () => {
    render(<PresetCardDuplicateButton onClick={jest.fn()} />);
    expect(
      screen.getByRole("button", { name: "プリセットをコピー" }),
    ).toHaveTextContent("📄 コピー");
  });

  it("クリックで onClick が呼ばれる", () => {
    const onClick = jest.fn();
    render(<PresetCardDuplicateButton onClick={onClick} />);
    fireEvent.click(screen.getByRole("button", { name: "プリセットをコピー" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("クリックイベントの伝播を止める（カード選択の誤発火防止）", () => {
    const onClick = jest.fn();
    const onParentClick = jest.fn();
    render(
      <div onClick={onParentClick}>
        <PresetCardDuplicateButton onClick={onClick} />
      </div>,
    );
    fireEvent.click(screen.getByRole("button", { name: "プリセットをコピー" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onParentClick).not.toHaveBeenCalled();
  });
});
