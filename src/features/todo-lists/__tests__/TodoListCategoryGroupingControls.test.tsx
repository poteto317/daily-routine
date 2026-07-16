import { render, screen, fireEvent } from "@testing-library/react";
import { TodoListCategoryGroupingControls } from "../TodoListCategoryGroupingControls";
import texts from "../locales/ja.json";

const defaultProps = {
  hasCategories: true,
  groupByCategory: false,
  onToggleGroupByCategory: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("TodoListCategoryGroupingControls", () => {
  describe("hasCategories=false のとき", () => {
    it("groupByCategory=false のときは何も表示しない", () => {
      const { container } = render(
        <TodoListCategoryGroupingControls
          {...defaultProps}
          hasCategories={false}
          groupByCategory={false}
        />,
      );
      expect(container).toBeEmptyDOMElement();
    });

    it("groupByCategory=true のときはトグルボタンを表示する（カテゴリ全削除後もOFFに戻せるようにするため）", () => {
      render(
        <TodoListCategoryGroupingControls
          {...defaultProps}
          hasCategories={false}
          groupByCategory={true}
        />,
      );
      expect(
        screen.getByRole("button", { name: "カテゴリでグループ化中" }),
      ).toBeInTheDocument();
    });

    it("groupByCategory=true のときトグルクリックで onToggleGroupByCategory が呼ばれる（OFFに戻せる）", () => {
      const onToggleGroupByCategory = jest.fn();
      render(
        <TodoListCategoryGroupingControls
          {...defaultProps}
          hasCategories={false}
          groupByCategory={true}
          onToggleGroupByCategory={onToggleGroupByCategory}
        />,
      );
      fireEvent.click(
        screen.getByRole("button", { name: "カテゴリでグループ化中" }),
      );
      expect(onToggleGroupByCategory).toHaveBeenCalledTimes(1);
    });
  });

  describe("カテゴリでグルーピング トグル", () => {
    it("groupByCategory=false のとき現在の状態を表す「カテゴリでグループ化」ボタンを表示する", () => {
      render(<TodoListCategoryGroupingControls {...defaultProps} />);
      expect(
        screen.getByRole("button", { name: "カテゴリでグループ化" }),
      ).toBeInTheDocument();
    });

    it("groupByCategory=true のとき現在の状態を表す「カテゴリでグループ化中」ボタンを表示する", () => {
      render(
        <TodoListCategoryGroupingControls {...defaultProps} groupByCategory />,
      );
      expect(
        screen.getByRole("button", { name: "カテゴリでグループ化中" }),
      ).toBeInTheDocument();
    });

    it("トグルクリックで onToggleGroupByCategory が呼ばれる", () => {
      render(<TodoListCategoryGroupingControls {...defaultProps} />);
      fireEvent.click(
        screen.getByRole("button", { name: "カテゴリでグループ化" }),
      );
      expect(defaultProps.onToggleGroupByCategory).toHaveBeenCalledTimes(1);
    });

    it("groupByCategory=false のとき aria-pressed が false", () => {
      render(
        <TodoListCategoryGroupingControls
          {...defaultProps}
          groupByCategory={false}
        />,
      );
      expect(
        screen.getByRole("button", { name: "カテゴリでグループ化" }),
      ).toHaveAttribute("aria-pressed", "false");
    });

    it("groupByCategory=true のとき aria-pressed が true", () => {
      render(
        <TodoListCategoryGroupingControls {...defaultProps} groupByCategory />,
      );
      expect(
        screen.getByRole("button", { name: "カテゴリでグループ化中" }),
      ).toHaveAttribute("aria-pressed", "true");
    });
  });

  describe("ロケールキーと表示ラベルの対応関係（キー名と真偽値の対応がズレる回帰の防止）", () => {
    it.each([
      {
        groupByCategory: false,
        expectedKey: "categoryUngroupedLabel" as const,
      },
      {
        groupByCategory: true,
        expectedKey: "categoryGroupedLabel" as const,
      },
    ])(
      "groupByCategory=$groupByCategory のとき texts.list.$expectedKey がそのまま表示される",
      ({ groupByCategory, expectedKey }) => {
        render(
          <TodoListCategoryGroupingControls
            {...defaultProps}
            groupByCategory={groupByCategory}
          />,
        );
        expect(
          screen.getByRole("button", { name: texts.list[expectedKey] }),
        ).toBeInTheDocument();
      },
    );
  });
});
