export type CheckStatus = "unchecked" | "ok" | "ng" | "na";

export type TestField = "pc" | "sp";

export interface TestItem {
  id: string;
  label: string;
  pc: CheckStatus;
  sp: CheckStatus;
  note: string;
}

export interface TestCategory {
  id: string;
  title: string;
  badge?: { text: string; color: string };
  items: TestItem[];
}
