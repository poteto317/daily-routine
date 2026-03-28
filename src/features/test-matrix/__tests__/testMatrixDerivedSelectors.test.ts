import { findSelectedTestMatrixItem } from "../testMatrixDerivedSelectors";

describe("testMatrixDerivedSelectors", () => {
  it("選択アイテム検索を行う", () => {
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

    expect(findSelectedTestMatrixItem(categories, "1-1")).toEqual(
      categories[0].items[0],
    );
    expect(findSelectedTestMatrixItem(categories, null)).toBeNull();
  });
});
