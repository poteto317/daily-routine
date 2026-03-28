import { getHeaderMenuItemData } from "@/hooks/headerMenuItemData";
import { getSettings } from "@/features/settings/storage";
import { getTodoLists } from "@/features/todo-lists/storage";
import { getSelectedTodoListId } from "@/features/todo-lists/selectedTodoList";

jest.mock("@/features/settings/storage", () => ({
  getSettings: jest.fn(),
}));

jest.mock("@/features/todo-lists/storage", () => ({
  getTodoLists: jest.fn(() => []),
}));

jest.mock("@/features/todo-lists/selectedTodoList", () => ({
  getSelectedTodoListId: jest.fn(() => null),
  setSelectedTodoListId: jest.fn(),
}));

const mockGetSettings = getSettings as jest.MockedFunction<typeof getSettings>;
const mockGetTodoLists = getTodoLists as jest.MockedFunction<
  typeof getTodoLists
>;
const mockGetSelectedTodoListId = getSelectedTodoListId as jest.MockedFunction<
  typeof getSelectedTodoListId
>;

const baseSettings = {
  defaultDurationMinutes: 30,
  defaultNotificationMinutes: 10,
  theme: "auto" as const,
  swipeAction: "delete" as const,
  pomodoroFocusMinutes: 25,
  pomodoroBreakMinutes: 5,
  visibleFeatures: {
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
  },
};

describe("headerMenuItemData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSettings.mockReturnValue(baseSettings);
  });

  it("メニュー未展開時は settings と todo storage を読まない", () => {
    const result = getHeaderMenuItemData(false);

    expect(mockGetSettings).not.toHaveBeenCalled();
    expect(mockGetTodoLists).not.toHaveBeenCalled();
    expect(mockGetSelectedTodoListId).not.toHaveBeenCalled();
    expect(result.menuOrder).toEqual([]);
    expect(result.todoLists).toEqual([]);
    expect(result.currentSelectedId).toBeNull();
  });

  it("Todo 非表示時は settings だけ読み、Todo storage は読まない", () => {
    mockGetSettings.mockReturnValue({
      ...baseSettings,
      visibleFeatures: {
        ...baseSettings.visibleFeatures,
        todoLists: false,
      },
      menuOrder: ["weather"],
    });

    const result = getHeaderMenuItemData(true);

    expect(mockGetSettings).toHaveBeenCalled();
    expect(mockGetTodoLists).not.toHaveBeenCalled();
    expect(mockGetSelectedTodoListId).not.toHaveBeenCalled();
    expect(result.todoListsVisible).toBe(false);
    expect(result.menuOrder).toEqual(["weather"]);
    expect(result.todoLists).toEqual([]);
  });

  it("メニュー展開時は settings と Todo 関連データをまとめて返す", () => {
    mockGetSettings.mockReturnValue({
      ...baseSettings,
      menuOrder: ["journal", "weather"],
    });
    mockGetTodoLists.mockReturnValue([
      {
        id: "list-1",
        title: "買い物",
        items: [],
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ]);
    mockGetSelectedTodoListId.mockReturnValue("list-1");

    const result = getHeaderMenuItemData(true);

    expect(mockGetSettings).toHaveBeenCalled();
    expect(mockGetTodoLists).toHaveBeenCalled();
    expect(mockGetSelectedTodoListId).toHaveBeenCalled();
    expect(result.visibleFeatures).toEqual(baseSettings.visibleFeatures);
    expect(result.menuOrder).toEqual(["journal", "weather"]);
    expect(result.todoLists).toEqual([
      expect.objectContaining({ id: "list-1", title: "買い物" }),
    ]);
    expect(result.currentSelectedId).toBe("list-1");
  });
});
