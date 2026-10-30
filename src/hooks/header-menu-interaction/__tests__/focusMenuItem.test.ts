import { focusMenuItem } from "../focusMenuItem";

/** document に追加したボタンを作る（focus() が効くように DOM に置く） */
const createButtons = (count: number) =>
  Array.from({ length: count }, (_, index) => {
    const button = document.createElement("button");
    button.textContent = `item-${index}`;
    document.body.appendChild(button);
    return button;
  });

describe("focusMenuItem", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("指定したインデックスの項目にフォーカスする", () => {
    const buttons = createButtons(3);

    focusMenuItem(buttons, 1);

    expect(document.activeElement).toBe(buttons[1]);
  });

  it("末尾の次は先頭に折り返す", () => {
    const buttons = createButtons(3);

    focusMenuItem(buttons, 3);

    expect(document.activeElement).toBe(buttons[0]);
  });

  it("先頭の前（-1）は末尾に折り返す", () => {
    const buttons = createButtons(3);

    focusMenuItem(buttons, -1);

    expect(document.activeElement).toBe(buttons[2]);
  });

  it("null の要素（未マウントの項目）は飛ばして数える", () => {
    const [first, second] = createButtons(2);

    focusMenuItem([first, null, second], 1);

    expect(document.activeElement).toBe(second);
  });

  it("フォーカスできる項目が無ければ何もしない", () => {
    const outside = createButtons(1)[0];
    outside.focus();

    expect(() => focusMenuItem([], 0)).not.toThrow();
    expect(() => focusMenuItem([null, null], 0)).not.toThrow();
    expect(document.activeElement).toBe(outside);
  });
});
