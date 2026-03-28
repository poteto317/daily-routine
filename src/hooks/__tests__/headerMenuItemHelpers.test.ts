import {
  buildDynamicTodoMenuItems,
  filterStaticHeaderMenuItems,
  orderHeaderMenuItems,
  type HeaderMenuItem,
} from "@/hooks/headerMenuItemHelpers";

const baseVisibleFeatures = {
  journal: true,
  calendar: true,
  statistics: true,
  pomodoro: true,
  worktracker: true,
  weightTracker: true,
  meal: true,
  budget: true,
  weather: true,
  preset: true,
  todoLists: true,
  syncManagement: true,
  testMatrix: true,
  accountAdmin: true,
};

describe("headerMenuItemHelpers", () => {
  it("メニュー未展開または Todo 非表示なら動的 Todo 項目を作らない", () => {
    const setSelectedTodoListId = jest.fn();

    expect(
      buildDynamicTodoMenuItems({
        isMenuOpen: false,
        todoListsVisible: true,
        todoLists: [],
        currentSelectedId: null,
        setSelectedTodoListId,
      }),
    ).toEqual([]);

    expect(
      buildDynamicTodoMenuItems({
        isMenuOpen: true,
        todoListsVisible: false,
        todoLists: [],
        currentSelectedId: null,
        setSelectedTodoListId,
      }),
    ).toEqual([]);
  });

  it("動的 Todo 項目は hidden を除外し、選択状態と遷移前処理を持つ", () => {
    const setSelectedTodoListId = jest.fn();
    const items = buildDynamicTodoMenuItems({
      isMenuOpen: true,
      todoListsVisible: true,
      todoLists: [
        {
          id: "list-1",
          title: "買い物",
          items: [],
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
        {
          id: "list-2",
          title: "非表示",
          items: [],
          createdAt: "2026-01-02T00:00:00.000Z",
          updatedAt: "2026-01-02T00:00:00.000Z",
          isHidden: true,
        },
      ],
      currentSelectedId: "list-1",
      setSelectedTodoListId,
    });

    expect(items).toHaveLength(1);
    expect(items[0]).toEqual(
      expect.objectContaining({
        id: "todo-list-list-1",
        label: "買い物",
        isActive: true,
        route: "todo-lists",
      }),
    );

    items[0].onBeforeNavigate?.();
    expect(setSelectedTodoListId).toHaveBeenCalledWith("list-1");
  });

  it("静的メニューは feature 設定と管理者状態で絞り込む", () => {
    const items = filterStaticHeaderMenuItems({
      visibleFeatures: {
        ...baseVisibleFeatures,
        weather: false,
        accountAdmin: false,
      },
      isAdmin: true,
      isPageType: (route): route is HeaderMenuItem["route"] =>
        route !== "invalid",
    });

    expect(items.some((item) => item.id === "weather")).toBe(false);
    expect(items.some((item) => item.id === "account-admin")).toBe(false);
    expect(items.some((item) => item.id === "settings")).toBe(true);
  });

  it("並び替えで home を先頭、settings を末尾、legacy todo-lists 順序を維持する", () => {
    const staticItems: HeaderMenuItem[] = [
      { id: "home", label: "Home", icon: "🏠", route: "home" },
      { id: "journal", label: "Journal", icon: "📔", route: "journal" },
      { id: "weather", label: "Weather", icon: "☀️", route: "weather" },
      { id: "settings", label: "Settings", icon: "⚙️", route: "settings" },
    ];
    const dynamicItems: HeaderMenuItem[] = [
      {
        id: "todo-list-list-1",
        label: "買い物",
        icon: "✅",
        route: "todo-lists",
      },
      {
        id: "todo-list-list-2",
        label: "仕事",
        icon: "✅",
        route: "todo-lists",
      },
    ];

    const ordered = orderHeaderMenuItems({
      staticItems,
      dynamicItems,
      menuOrder: ["journal", "todo-lists", "weather"],
    }).map((item) => item.id);

    expect(ordered[0]).toBe("home");
    expect(ordered.indexOf("journal")).toBeLessThan(
      ordered.indexOf("todo-list-list-1"),
    );
    expect(ordered.indexOf("todo-list-list-2")).toBeLessThan(
      ordered.indexOf("weather"),
    );
    expect(ordered[ordered.length - 1]).toBe("settings");
  });
});
