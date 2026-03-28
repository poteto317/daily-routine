import { createTestMatrixDataStateResult } from "../testMatrixDataStateResult";

describe("createTestMatrixDataStateResult", () => {
  it("categories/detailData/actions の公開 shape を返す", () => {
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
    const detailData = {
      "1-1": [
        {
          id: "case-1",
          scenario: "正常系",
          expected: "成功する",
          pc: "unchecked" as const,
          sp: "unchecked" as const,
          note: "",
        },
      ],
    };
    const actions = {
      toggleStatus: jest.fn(),
      updateNote: jest.fn(),
      toggleDetailStatus: jest.fn(),
      updateDetailNote: jest.fn(),
      resetAll: jest.fn(),
    };

    const result = createTestMatrixDataStateResult({
      categoriesState: [categories, jest.fn()],
      detailDataState: [detailData, jest.fn()],
      actions,
    });

    expect(result).toEqual({
      categories,
      detailData,
      ...actions,
    });
  });
});
