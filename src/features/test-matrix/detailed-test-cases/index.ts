import { DETAILED_TEST_CASES_GROUP_01_04 } from "./group-01-04";
import { DETAILED_TEST_CASES_GROUP_05_09 } from "./group-05-09";
import { DETAILED_TEST_CASES_GROUP_10_13 } from "./group-10-13";
import { DETAILED_TEST_CASES_GROUP_14_18 } from "./group-14-18";
import type { DetailTestCaseMap } from "./types";

export { type DetailTestCase } from "./types";

export const DETAILED_TEST_CASES: DetailTestCaseMap = {
  ...DETAILED_TEST_CASES_GROUP_01_04,
  ...DETAILED_TEST_CASES_GROUP_05_09,
  ...DETAILED_TEST_CASES_GROUP_10_13,
  ...DETAILED_TEST_CASES_GROUP_14_18,
};
