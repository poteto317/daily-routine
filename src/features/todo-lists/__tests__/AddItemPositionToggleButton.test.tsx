import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { AddItemPositionToggleButton } from "../AddItemPositionToggleButton";

describe("AddItemPositionToggleButton", () => {
  describe("表示テキスト", () => {
    it("addItemPosition が undefined のとき「末尾に追加」が表示される", () => {
      render(
        <AddItemPositionToggleButton
          addItemPosition={undefined}
          onToggle={jest.fn()}
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
          onToggle={jest.fn()}
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
          onToggle={jest.fn()}
        />,
      );
      expect(
        screen.getByRole("button", { name: "先頭に追加" }),
      ).toBeInTheDocument();
    });
  });

  describe("トグル動作", () => {
    it("addItemPosition が undefined のときクリックすると onToggle('first') が呼ばれる", () => {
      const onToggle = jest.fn();
      render(
        <AddItemPositionToggleButton
          addItemPosition={undefined}
          onToggle={onToggle}
        />,
      );
      fireEvent.click(screen.getByRole("button"));
      expect(onToggle).toHaveBeenCalledWith("first");
    });

    it("addItemPosition が 'last' のときクリックすると onToggle('first') が呼ばれる", () => {
      const onToggle = jest.fn();
      render(
        <AddItemPositionToggleButton
          addItemPosition="last"
          onToggle={onToggle}
        />,
      );
      fireEvent.click(screen.getByRole("button"));
      expect(onToggle).toHaveBeenCalledWith("first");
    });

    it("addItemPosition が 'first' のときクリックすると onToggle('last') が呼ばれる", () => {
      const onToggle = jest.fn();
      render(
        <AddItemPositionToggleButton
          addItemPosition="first"
          onToggle={onToggle}
        />,
      );
      fireEvent.click(screen.getByRole("button"));
      expect(onToggle).toHaveBeenCalledWith("last");
    });

    it("複数回クリックするたびに onToggle が呼ばれる", () => {
      const onToggle = jest.fn();
      render(
        <AddItemPositionToggleButton
          addItemPosition="last"
          onToggle={onToggle}
        />,
      );
      fireEvent.click(screen.getByRole("button"));
      fireEvent.click(screen.getByRole("button"));
      expect(onToggle).toHaveBeenCalledTimes(2);
    });
  });

  describe("スタイル", () => {
    it("addItemPosition が 'first' のときアクティブスタイルが適用される", () => {
      render(
        <AddItemPositionToggleButton
          addItemPosition="first"
          onToggle={jest.fn()}
        />,
      );
      const button = screen.getByRole("button");
      expect(button.className).toContain("text-teal-600");
    });

    it("addItemPosition が 'last' のときデフォルトスタイルが適用される", () => {
      render(
        <AddItemPositionToggleButton
          addItemPosition="last"
          onToggle={jest.fn()}
        />,
      );
      const button = screen.getByRole("button");
      expect(button.className).toContain("text-gray-500");
    });

    it("addItemPosition が undefined のときデフォルトスタイルが適用される", () => {
      render(
        <AddItemPositionToggleButton
          addItemPosition={undefined}
          onToggle={jest.fn()}
        />,
      );
      const button = screen.getByRole("button");
      expect(button.className).toContain("text-gray-500");
    });
  });
});
