import type { CheckStatus } from "../types";

export interface DetailTestCase {
  id: string;
  scenario: string;
  expected: string;
  pc: CheckStatus;
  sp: CheckStatus;
  note: string;
}

export type DetailTestCaseMap = Record<string, DetailTestCase[]>;
