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

import { DETAILED_TEST_CASES } from "../detailedTestCases";
import { createResetTestMatrixState } from "../testMatrixResetState";

describe("testMatrixResetState", () => {
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
