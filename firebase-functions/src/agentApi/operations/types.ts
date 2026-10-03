import type { SyncDocData } from "../syncDoc";

export type OperationContext = {
  data: SyncDocData;
  id?: string;
  query: Record<string, string | undefined>;
  body: unknown;
  now: Date;
};

export type OperationOutcome = {
  status: number;
  body: unknown;
  changes?: SyncDocData;
};

export type Operation = (context: OperationContext) => OperationOutcome;

export type ResourceOperations = {
  list: Operation;
  create: Operation;
  update: Operation;
  remove: Operation;
};
