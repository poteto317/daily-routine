import { createHeaderMenuItems } from "@/hooks/headerMenuItemsBuilder";

const baseMenuData = {
  visibleFeatures: {
    journal: true,
    weeklyLog: true,
    calendar: true,
    statistics: true,
    pomodoro: true,
    worktracker: true,
    weightTracker: true,
    workoutTracker: true,
    meal: true,
    budget: true,
    weather: true,
    preset: true,
    todoLists: true,
    syncManagement: true,
    testMatrix: true,
    accountAdmin: true,
  },
  menuOrder: [] as string[],
  todoListsVisible: true,
  todoLists: [] as Array<{
    id: string;
    title: string;
    items: [];
    isHidden?: boolean;
    createdAt: string;
    updatedAt: string;
  }>,
  currentSelectedId: null as string | null,
  setSelectedTodoListId: jest.fn(),
};

describe("headerMenuItemsBuilder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("メニュー未展開時は feature 設定に関係なく静的項目を返す", () => {
    const items = createHeaderMenuItems({
      isAdmin: false,
      isMenuOpen: false,
      menuData: {
        ...baseMenuData,
        visibleFeatures: undefined,
      },
    });

    expect(items.some((item) => item.id === "weather")).toBe(true);
  });

  it("feature を false にした項目はメニュー展開時に除外される", () => {
    const items = createHeaderMenuItems({
      isAdmin: false,
      isMenuOpen: true,
      menuData: {
        ...baseMenuData,
        visibleFeatures: {
          ...baseMenuData.visibleFeatures,
          weather: false,
        },
      },
    });

    expect(items.some((item) => item.id === "weather")).toBe(false);
  });

  it("account-admin 項目は管理者のみ表示される", () => {
    const nonAdminItems = createHeaderMenuItems({
      isAdmin: false,
      isMenuOpen: true,
      menuData: baseMenuData,
    });
    const adminItems = createHeaderMenuItems({
      isAdmin: true,
      isMenuOpen: true,
      menuData: baseMenuData,
    });

    expect(nonAdminItems.some((item) => item.id === "account-admin")).toBe(
      false,
    );
    expect(adminItems.some((item) => item.id === "account-admin")).toBe(true);
  });

  it("menuOrder に従って Todo リスト動的アイテムを個別に並び替える", () => {
    const items = createHeaderMenuItems({
      isAdmin: false,
      isMenuOpen: true,
      menuData: {
        ...baseMenuData,
        menuOrder: [
          "journal",
          "todo-list-list-2",
          "weather",
          "todo-list-list-1",
        ],
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
            title: "仕事",
            items: [],
            createdAt: "2026-01-02T00:00:00.000Z",
            updatedAt: "2026-01-02T00:00:00.000Z",
          },
        ],
      },
    });
    const ids = items.map((item) => item.id);

    expect(ids.indexOf("journal")).toBeLessThan(
      ids.indexOf("todo-list-list-2"),
    );
    expect(ids.indexOf("todo-list-list-2")).toBeLessThan(
      ids.indexOf("weather"),
    );
    expect(ids.indexOf("weather")).toBeLessThan(
      ids.indexOf("todo-list-list-1"),
    );
  });
});
