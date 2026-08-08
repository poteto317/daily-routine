import { fireEvent, render, screen } from "@testing-library/react";
import { PresetCardDeleteButton } from "../components/PresetCardDeleteButton";

describe("PresetCardDeleteButton", () => {
  it("削除ボタンを絵文字+テキストの可視ラベルで表示する", () => {
    render(<PresetCardDeleteButton onClick={jest.fn()} />);
    expect(
      screen.getByRole("button", { name: "プリセットを削除" }),
    ).toHaveTextContent("🗑️ 削除");
  });

  it("クリックで onClick が呼ばれる", () => {
    const onClick = jest.fn();
    render(<PresetCardDeleteButton onClick={onClick} />);
    fireEvent.click(screen.getByRole("button", { name: "プリセットを削除" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("クリックイベントの伝播を止める（カード選択の誤発火防止）", () => {
    const onClick = jest.fn();
    const onParentClick = jest.fn();
    render(
      <div onClick={onParentClick}>
        <PresetCardDeleteButton onClick={onClick} />
      </div>,
    );
    fireEvent.click(screen.getByRole("button", { name: "プリセットを削除" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onParentClick).not.toHaveBeenCalled();
  });
});
