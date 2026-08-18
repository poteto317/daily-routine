import { fireEvent, render, screen } from "@testing-library/react";
import { ToggleSwitch } from "../ToggleSwitch";

describe("ToggleSwitch", () => {
  it("スイッチとして読み上げられる", () => {
    render(<ToggleSwitch checked label="ジャーナル" onToggle={jest.fn()} />);

    expect(screen.getByRole("switch", { name: "ジャーナル" })).toBeChecked();
  });

  it("オフの状態を伝える", () => {
    // 名前だけあってもオンオフが読めないと操作できない
    render(
      <ToggleSwitch checked={false} label="ジャーナル" onToggle={jest.fn()} />,
    );

    expect(
      screen.getByRole("switch", { name: "ジャーナル" }),
    ).not.toBeChecked();
  });

  it("押すと切り替えを通知する", () => {
    const onToggle = jest.fn();
    render(<ToggleSwitch checked label="ジャーナル" onToggle={onToggle} />);

    fireEvent.click(screen.getByRole("switch"));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("フォームの送信ボタンとして扱われない", () => {
    // type を省くと form 内で submit として働き、意図しない送信が起きる
    render(<ToggleSwitch checked label="ジャーナル" onToggle={jest.fn()} />);

    expect(screen.getByRole("switch")).toHaveAttribute("type", "button");
  });

  it("見た目のクラスは呼び出し側が決める", () => {
    render(
      <ToggleSwitch
        checked
        label="ジャーナル"
        onToggle={jest.fn()}
        className="bg-teal-500"
        thumbClassName="translate-x-6"
      />,
    );

    expect(screen.getByRole("switch")).toHaveClass("bg-teal-500");
  });
});
