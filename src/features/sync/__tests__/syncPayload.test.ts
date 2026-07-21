import { createSyncPayload } from "../sync/syncPayload";
import {
  createSyncDataFixture,
  createSyncPayloadFixture,
  todoCategoryFixture,
  todoListFixture,
} from "./sync.test.fixtures";

describe("syncPayload", () => {
  it("同期メタデータを除外し、Todoカテゴリを含む永続payloadを作る", () => {
    const expectedPayload = createSyncPayloadFixture({
      todoLists: [todoListFixture],
      todoCategories: [todoCategoryFixture],
    });
    const syncData = createSyncDataFixture({
      todoLists: [todoListFixture],
      todoCategories: [todoCategoryFixture],
      lastModified: 987,
      deviceId: "device-2",
    });

    const payload = createSyncPayload(syncData);

    expect(payload).toEqual(expectedPayload);
    expect(payload).not.toHaveProperty("lastModified");
    expect(payload).not.toHaveProperty("deviceId");
  });

  it("同期メタデータの値が変わってもpayloadは変わらない", () => {
    const payloadSource = createSyncPayloadFixture({
      todoLists: [todoListFixture],
      todoCategories: [todoCategoryFixture],
    });
    const firstPayload = createSyncPayload(
      createSyncDataFixture({
        ...payloadSource,
        lastModified: 100,
        deviceId: "device-a",
      }),
    );
    const secondPayload = createSyncPayload(
      createSyncDataFixture({
        ...payloadSource,
        lastModified: 200,
        deviceId: "device-b",
      }),
    );

    expect(firstPayload).toEqual(payloadSource);
    expect(secondPayload).toEqual(payloadSource);
  });
});
