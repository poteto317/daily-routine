import { render, screen, fireEvent } from "@testing-library/react";
import { AddItemPositionToggleButton } from "../AddItemPositionToggleButton";

describe("AddItemPositionToggleButton", () => {
  describe("表示テキスト", () => {
    it("addItemPosition が undefined のとき「末尾に追加」が表示される", () => {
      render(
        <AddItemPositionToggleButton
          addItemPosition={undefined}
          onToggleAction={jest.fn()}
        />,
      );
      expect(
        screen.getByRole("button", { name: "末尾に追加" }),
      ).toBeInTheDocument();
    });

    it("addItemPosition が 'last' のとき「末尾に追加」が表示される", () => {
      render(
        <AddItemPositionToggleButton
          addItemPosition="last"
          onToggleAction={jest.fn()}
        />,
      );
      expect(
        screen.getByRole("button", { name: "末尾に追加" }),
      ).toBeInTheDocument();
    });

    it("addItemPosition が 'first' のとき「先頭に追加」が表示される", () => {
      render(
        <AddItemPositionToggleButton
          addItemPosition="first"
          onToggleAction={jest.fn()}
        />,
      );
      expect(
        screen.getByRole("button", { name: "先頭に追加" }),
      ).toBeInTheDocument();
    });
  });

  describe("トグル動作", () => {
    it("addItemPosition が undefined のときクリックすると onToggleAction('first') が呼ばれる", () => {
      const onToggleAction = jest.fn();
      render(
        <AddItemPositionToggleButton
          addItemPosition={undefined}
          onToggleAction={onToggleAction}
        />,
      );
      fireEvent.click(screen.getByRole("button"));
      expect(onToggleAction).toHaveBeenCalledWith("first");
    });

    it("addItemPosition が 'last' のときクリックすると onToggleAction('first') が呼ばれる", () => {
      const onToggleAction = jest.fn();
      render(
        <AddItemPositionToggleButton
          addItemPosition="last"
          onToggleAction={onToggleAction}
        />,
      );
      fireEvent.click(screen.getByRole("button"));
      expect(onToggleAction).toHaveBeenCalledWith("first");
    });

    it("addItemPosition が 'first' のときクリックすると onToggleAction('last') が呼ばれる", () => {
      const onToggleAction = jest.fn();
      render(
        <AddItemPositionToggleButton
          addItemPosition="first"
          onToggleAction={onToggleAction}
        />,
      );
      fireEvent.click(screen.getByRole("button"));
      expect(onToggleAction).toHaveBeenCalledWith("last");
    });

    it("複数回クリックするたびに onToggleAction が呼ばれる", () => {
      const onToggleAction = jest.fn();
      render(
        <AddItemPositionToggleButton
          addItemPosition="last"
          onToggleAction={onToggleAction}
        />,
      );
      fireEvent.click(screen.getByRole("button"));
      fireEvent.click(screen.getByRole("button"));
      expect(onToggleAction).toHaveBeenCalledTimes(2);
    });
  });

  describe("aria-pressed", () => {
    it("addItemPosition が undefined のとき aria-pressed が false である", () => {
      render(
        <AddItemPositionToggleButton
          addItemPosition={undefined}
          onToggleAction={jest.fn()}
        />,
      );
      expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
    });

    it("addItemPosition が 'last' のとき aria-pressed が false である", () => {
      render(
        <AddItemPositionToggleButton
          addItemPosition="last"
          onToggleAction={jest.fn()}
        />,
      );
      expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
    });

    it("addItemPosition が 'first' のとき aria-pressed が true である", () => {
      render(
        <AddItemPositionToggleButton
          addItemPosition="first"
          onToggleAction={jest.fn()}
        />,
      );
      expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
    });
  });

  describe("スタイル", () => {
    it("addItemPosition が 'first' のときアクティブスタイルが適用される", () => {
      render(
        <AddItemPositionToggleButton
          addItemPosition="first"
          onToggleAction={jest.fn()}
        />,
      );
      const button = screen.getByRole("button");
      expect(button.className).toContain("text-teal-600");
    });

    it("addItemPosition が 'last' のときデフォルトスタイルが適用される", () => {
      render(
        <AddItemPositionToggleButton
          addItemPosition="last"
          onToggleAction={jest.fn()}
        />,
      );
      const button = screen.getByRole("button");
      expect(button.className).toContain("text-gray-500");
    });

    it("addItemPosition が undefined のときデフォルトスタイルが適用される", () => {
      render(
        <AddItemPositionToggleButton
          addItemPosition={undefined}
          onToggleAction={jest.fn()}
        />,
      );
      const button = screen.getByRole("button");
      expect(button.className).toContain("text-gray-500");
    });
  });
});
