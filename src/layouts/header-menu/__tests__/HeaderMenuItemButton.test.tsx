import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HeaderMenuItemButton } from "../HeaderMenuItemButton";
import type { HeaderMenuItem } from "@/hooks/useHeaderMenuItems";

const mockSetMenuItemRef = jest.fn();
const mockOnNavigateClick = jest.fn();
const mockOnMenuItemKeyDown = jest.fn();
const mockOnBeforeNavigate = jest.fn();

const baseItem: HeaderMenuItem = {
  id: "journal",
  label: "日記",
  icon: "📓",
  route: "journal",
};

const renderButton = (item: HeaderMenuItem, currentPage: string = "home") => {
  return render(
    <HeaderMenuItemButton
      item={item}
      index={0}
      currentPage={
        currentPage as Parameters<typeof HeaderMenuItemButton>[0]["currentPage"]
      }
      setMenuItemRef={mockSetMenuItemRef}
      onNavigateClick={mockOnNavigateClick}
      onMenuItemKeyDown={mockOnMenuItemKeyDown}
    />,
  );
};

describe("HeaderMenuItemButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("アクティブ状態のスタイル（isActive プロパティなし）", () => {
    it("currentPage と route が一致する場合はアクティブスタイルになる", () => {
      renderButton(baseItem, "journal");
      const button = screen.getByRole("menuitem");
      expect(button.className).toContain("bg-blue-50");
      expect(button.className).toContain("text-blue-600");
    });

    it("currentPage と route が異なる場合は非アクティブスタイルになる", () => {
      renderButton(baseItem, "home");
      const button = screen.getByRole("menuitem");
      expect(button.className).not.toContain("bg-blue-50");
      expect(button.className).toContain("hover:bg-gray-50");
    });
  });

  describe("アクティブ状態のスタイル（isActive プロパティあり）", () => {
    const todoItem: HeaderMenuItem = {
      id: "todo-list-abc",
      label: "買い物リスト",
      icon: "✅",
      route: "todo-lists",
      isActive: true,
    };

    it("isActive=true かつ currentPage が route と一致する場合はアクティブスタイルになる", () => {
      renderButton(todoItem, "todo-lists");
      const button = screen.getByRole("menuitem");
      expect(button.className).toContain("bg-blue-50");
      expect(button.className).toContain("text-blue-600");
    });

    it("【バグ修正】isActive=true でも currentPage が route と異なる場合は非アクティブスタイルになる", () => {
      // Todo リストを選択した状態で別ページ（日記など）に移動した場合
      renderButton(todoItem, "journal");
      const button = screen.getByRole("menuitem");
      expect(button.className).not.toContain("bg-blue-50");
      expect(button.className).toContain("hover:bg-gray-50");
    });

    it("【バグ修正】isActive=true でも currentPage が home の場合は非アクティブスタイルになる", () => {
      renderButton(todoItem, "home");
      const button = screen.getByRole("menuitem");
      expect(button.className).not.toContain("bg-blue-50");
      expect(button.className).toContain("hover:bg-gray-50");
    });

    it("isActive=false の場合は currentPage が route と一致してもアクティブスタイルにならない", () => {
      const inactiveItem: HeaderMenuItem = { ...todoItem, isActive: false };
      renderButton(inactiveItem, "todo-lists");
      const button = screen.getByRole("menuitem");
      expect(button.className).not.toContain("bg-blue-50");
    });
  });

  describe("クリック操作", () => {
    it("クリックすると onNavigateClick が route を引数に呼ばれる", async () => {
      renderButton(baseItem, "home");
      await userEvent.click(screen.getByRole("menuitem"));
      expect(mockOnNavigateClick).toHaveBeenCalledWith("journal");
    });

    it("onBeforeNavigate が定義されている場合、クリック時に先に呼ばれる", async () => {
      const callOrder: string[] = [];
      const itemWithBefore: HeaderMenuItem = {
        ...baseItem,
        onBeforeNavigate: () => {
          mockOnBeforeNavigate();
          callOrder.push("before");
        },
      };
      mockOnNavigateClick.mockImplementationOnce(() =>
        callOrder.push("navigate"),
      );

      renderButton(itemWithBefore, "home");
      await userEvent.click(screen.getByRole("menuitem"));

      expect(mockOnBeforeNavigate).toHaveBeenCalledTimes(1);
      expect(callOrder).toEqual(["before", "navigate"]);
    });

    it("onBeforeNavigate が undefined の場合はエラーにならない", async () => {
      renderButton(baseItem, "home");
      await expect(
        userEvent.click(screen.getByRole("menuitem")),
      ).resolves.not.toThrow();
    });
  });

  describe("表示内容", () => {
    it("アイコンとラベルが表示される", () => {
      renderButton(baseItem);
      expect(screen.getByText("📓")).toBeInTheDocument();
      expect(screen.getByText("日記")).toBeInTheDocument();
    });

    it("badge がある場合はバッジが表示される", () => {
      const itemWithBadge: HeaderMenuItem = {
        ...baseItem,
        badge: { text: "NEW", color: "bg-red-500" },
      };
      renderButton(itemWithBadge);
      expect(screen.getByText("NEW")).toBeInTheDocument();
    });

    it("badge がない場合はバッジが表示されない", () => {
      renderButton(baseItem);
      expect(screen.queryByText("NEW")).not.toBeInTheDocument();
    });
  });
});
