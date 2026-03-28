import { useHeaderMenuItems } from "@/hooks/useHeaderMenuItems";
import { getHeaderMenuItemData } from "@/hooks/headerMenuItemData";
import { createHeaderMenuItems } from "@/hooks/headerMenuItemsBuilder";

jest.mock("@/hooks/headerMenuItemData", () => ({
  getHeaderMenuItemData: jest.fn(),
}));

jest.mock("@/hooks/headerMenuItemsBuilder", () => ({
  createHeaderMenuItems: jest.fn(),
}));

const mockGetHeaderMenuItemData = getHeaderMenuItemData as jest.MockedFunction<
  typeof getHeaderMenuItemData
>;
const mockCreateHeaderMenuItems = createHeaderMenuItems as jest.MockedFunction<
  typeof createHeaderMenuItems
>;

describe("useHeaderMenuItems", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetHeaderMenuItemData.mockReturnValue({
      visibleFeatures: undefined,
      menuOrder: [],
      todoListsVisible: true,
      todoLists: [],
      currentSelectedId: null,
      setSelectedTodoListId: jest.fn(),
    });
    mockCreateHeaderMenuItems.mockReturnValue([{ id: "settings" }] as never);
  });

  it("menu data 取得と pure builder を compose する", () => {
    const items = useHeaderMenuItems(true, false);

    expect(mockGetHeaderMenuItemData).toHaveBeenCalledWith(true);
    expect(mockCreateHeaderMenuItems).toHaveBeenCalledWith({
      isAdmin: false,
      isMenuOpen: true,
      menuData: expect.objectContaining({
        menuOrder: [],
        todoLists: [],
      }),
    });
    expect(items).toEqual([{ id: "settings" }]);
  });
});
