import { DETAILED_TEST_CASES } from "../detailedTestCases";
import {
  updateDetailCaseNote,
  updateDetailCaseStatus,
  updateTestMatrixItemNote,
  updateTestMatrixItemStatus,
} from "../testMatrixDataMutations";

describe("testMatrixDataMutations", () => {
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
});
