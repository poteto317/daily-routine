import { DETAILED_TEST_CASES } from "../detailedTestCases";
import {
  createCollapseAllState,
  createResetTestMatrixState,
  findSelectedTestMatrixItem,
  toggleCollapsedCategoryId,
  updateDetailCaseNote,
  updateDetailCaseStatus,
  updateTestMatrixItemNote,
  updateTestMatrixItemStatus,
} from "../testMatrixPageStateActions";

jest.mock("../initialData", () => ({
  buildInitialData: jest.fn(() => [
    {
      id: "auth",
      title: "認証",
      items: [
        {
          id: "1-1",
          label: "ログイン",
          pc: "unchecked",
          sp: "unchecked",
          note: "",
        },
      ],
    },
  ]),
}));

describe("testMatrixPageStateActions", () => {
  const detailItemId = "1-2";
  const detailCaseId = DETAILED_TEST_CASES[detailItemId][0].id;
  const categories = [
    {
      id: "auth",
      title: "認証",
      items: [
        {
          id: "1-1",
          label: "ログイン",
          pc: "unchecked" as const,
          sp: "unchecked" as const,
          note: "",
        },
      ],
    },
  ];

  it("一覧アイテムの status と note を更新する", () => {
    expect(
      updateTestMatrixItemStatus(categories, "auth", "1-1", "pc")[0].items[0]
        .pc,
    ).toBe("ok");
    expect(
      updateTestMatrixItemNote(categories, "auth", "1-1", "memo")[0].items[0]
        .note,
    ).toBe("memo");
  });

  it("詳細ケースの status と note を更新する", () => {
    const detailData = { [detailItemId]: DETAILED_TEST_CASES[detailItemId] };

    expect(
      updateDetailCaseStatus(detailData, detailItemId, detailCaseId, "pc")[
        detailItemId
      ][0].pc,
    ).toBe("ok");
    expect(
      updateDetailCaseNote(detailData, detailItemId, detailCaseId, "detail")[
        detailItemId
      ][0].note,
    ).toBe("detail");
    expect(updateDetailCaseStatus(detailData, null, detailCaseId, "pc")).toBe(
      detailData,
    );
  });

  it("選択アイテム検索と折りたたみ state を返す", () => {
    expect(findSelectedTestMatrixItem(categories, "1-1")).toEqual(
      categories[0].items[0],
    );
    expect(findSelectedTestMatrixItem(categories, null)).toBeNull();

    const collapsed = toggleCollapsedCategoryId(new Set<string>(), "auth");
    expect(collapsed.has("auth")).toBe(true);
    expect(toggleCollapsedCategoryId(collapsed, "auth").size).toBe(0);

    expect(createCollapseAllState(false, categories)).toEqual({
      collapseAll: true,
      collapsedIds: new Set(["auth"]),
    });
    expect(createCollapseAllState(true, categories)).toEqual({
      collapseAll: false,
      collapsedIds: new Set(),
    });
  });

  it("reset state を返す", () => {
    expect(createResetTestMatrixState()).toEqual({
      categories: [
        {
          id: "auth",
          title: "認証",
          items: [
            {
              id: "1-1",
              label: "ログイン",
              pc: "unchecked",
              sp: "unchecked",
              note: "",
            },
          ],
        },
      ],
      detailData: { ...DETAILED_TEST_CASES },
    });
  });
});
