import type { SyncPayload, SyncSnapshot } from "../sync/types";
import {
  createSyncPayloadFixture,
  createSyncSnapshotFixture,
  todoCategoryFixture,
  todoListFixture,
} from "./sync.test.fixtures";

type SyncSnapshotDocFixture = {
  id: string;
  data: () => Omit<SyncSnapshot, "id">;
};

export const createTodoSyncSnapshotFixture = (
  overrides: Partial<SyncSnapshot> = {},
  todoOverrides: Partial<Pick<SyncPayload, "todoLists" | "todoCategories">> = {},
): SyncSnapshot =>
  createSyncSnapshotFixture({
    data: createSyncPayloadFixture({
      todoLists: [todoListFixture],
      todoCategories: [todoCategoryFixture],
      ...todoOverrides,
    }),
    ...overrides,
  });

export const createSyncSnapshotDocFixture = (
  overrides: Partial<SyncSnapshot> = {},
): SyncSnapshotDocFixture => {
  const { id, ...snapshotData } = createSyncSnapshotFixture(overrides);

  return {
    id,
    data: () => snapshotData,
  };
};

export const createExistingSyncSnapshotDocFixture = (
  overrides: Partial<SyncSnapshot> = {},
) => ({
  exists: () => true,
  ...createSyncSnapshotDocFixture(overrides),
});

export const createSyncSnapshotDocsResultFixture = (
  snapshots: SyncSnapshot[] = [createSyncSnapshotFixture()],
) => ({
  docs: snapshots.map((snapshot) => createSyncSnapshotDocFixture(snapshot)),
});
