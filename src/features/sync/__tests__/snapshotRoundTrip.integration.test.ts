/**
 * 同期スナップショットの結合テスト
 *
 * ローカル保存 → アップロード → 履歴の取得・復元・削除 → ダウンロード の流れを、
 * Firestore だけメモリ上のフェイクに置き換えて検証する。
 * ルーティン・Todo の storage、ユーザー別キーへの移行、同期状態の保存は本物を使う。
 */
import { getRoutines, saveRoutines } from "@/features/routine/storage";
import { getTodoLists, saveTodoLists } from "@/features/todo-lists/storage";
import {
  getCurrentUserId,
  getLocalDataUpdatedAt,
  setCurrentUserId,
} from "@/lib/storage/core";
import {
  applySyncSnapshot,
  deleteSyncSnapshot,
  downloadFromFirestore,
  getSyncSnapshots,
  getSyncStatus,
  uploadToFirestore,
} from "../sync";
import { setSyncStatus } from "../sync/statusStore";
import { routineFixture, todoListFixture } from "./sync.test.fixtures";

type MockDocData = Record<string, unknown>;

/** Firestore のドキュメントをパス（users/{uid}/syncSnapshots/{id} など）で保持する */
const mockFirestoreDocs = new Map<string, MockDocData>();

jest.mock("firebase/firestore", () => {
  type CollectionRef = { type: "collection"; path: string };
  type DocRef = { type: "doc"; path: string; id: string };
  type OrderedQuery = {
    collectionRef: CollectionRef;
    order: { field: string; direction: "asc" | "desc" };
  };
  let autoId = 0;

  const toSnapshot = (path: string) => {
    const data = mockFirestoreDocs.get(path);
    return {
      id: path.split("/").pop()!,
      exists: () => data !== undefined,
      data: () => data,
    };
  };

  const isDirectChild = (collectionPath: string, path: string) =>
    path.startsWith(`${collectionPath}/`) &&
    !path.slice(collectionPath.length + 1).includes("/");

  return {
    collection: (_db: unknown, ...segments: string[]): CollectionRef => ({
      type: "collection",
      path: segments.join("/"),
    }),
    doc: (parent: CollectionRef | unknown, ...segments: string[]): DocRef => {
      const base =
        (parent as CollectionRef | undefined)?.type === "collection"
          ? [(parent as CollectionRef).path]
          : [];
      const ids = segments.length > 0 ? segments : [`auto-${++autoId}`];
      const path = [...base, ...ids].join("/");
      return { type: "doc", path, id: ids[ids.length - 1]! };
    },
    orderBy: (field: string, direction: "asc" | "desc") => ({
      field,
      direction,
    }),
    query: (
      collectionRef: CollectionRef,
      order: OrderedQuery["order"],
    ): OrderedQuery => ({ collectionRef, order }),
    getDoc: async (ref: DocRef) => toSnapshot(ref.path),
    getDocs: async ({ collectionRef, order }: OrderedQuery) => {
      const sign = order.direction === "desc" ? -1 : 1;
      const docs = [...mockFirestoreDocs.keys()]
        .filter((path) => isDirectChild(collectionRef.path, path))
        .map(toSnapshot)
        .sort(
          (left, right) =>
            sign *
            (Number(left.data()![order.field]) -
              Number(right.data()![order.field])),
        );
      return { docs };
    },
    setDoc: async (ref: DocRef, data: MockDocData) => {
      mockFirestoreDocs.set(ref.path, JSON.parse(JSON.stringify(data)));
    },
    deleteDoc: async (ref: DocRef) => {
      mockFirestoreDocs.delete(ref.path);
    },
    serverTimestamp: () => "server-timestamp",
    onSnapshot: jest.fn(),
  };
});

jest.mock("@/lib/firebase", () => ({
  FirebaseError: jest.requireActual("@/lib/firebase-modules/error")
    .FirebaseError,
  getFirestoreInstance: () => ({}),
  getOrCreateUser: async () => ({ uid: "user-1" }),
}));

const LATEST_PATH = "users/user-1";

const routineA = { ...routineFixture, id: "routine-a", title: "朝活 A" };
const routineB = { ...routineFixture, id: "routine-b", title: "夜活 B" };

describe("同期スナップショットの保存→復元の流れ", () => {
  let now: number;
  let dateNowSpy: jest.SpyInstance;

  beforeEach(() => {
    localStorage.clear();
    mockFirestoreDocs.clear();
    setCurrentUserId(null);
    // アップロードごとに uploadedAt が異なるよう、呼ばれるたびに進める
    now = 1_700_000_000_000;
    dateNowSpy = jest.spyOn(Date, "now").mockImplementation(() => (now += 10));
  });

  afterEach(() => {
    dateNowSpy.mockRestore();
    setCurrentUserId(null);
  });

  it("ログイン前に保存したルーティンをアップロードすると、ユーザー別のキーに移したうえで最新データと履歴の両方に書く", async () => {
    // ログイン前（ユーザー ID 未設定）の保存。daily-routines は移行対象のキー
    saveRoutines([routineA]);

    await uploadToFirestore();

    expect(getCurrentUserId()).toBe("user-1");
    expect(localStorage.getItem("user:user-1:daily-routines")).not.toBeNull();
    expect(getRoutines()).toEqual([routineA]);
    const latest = mockFirestoreDocs.get(LATEST_PATH);
    expect(latest).toMatchObject({ routines: [routineA] });

    const snapshots = await getSyncSnapshots();
    expect(snapshots).toHaveLength(1);
    expect(snapshots[0]).toMatchObject({
      uploadedAt: latest!.lastModified,
      deviceId: latest!.deviceId,
      data: { routines: [routineA] },
    });
    expect(getSyncStatus()).toMatchObject({ isSyncing: false, error: null });
  });

  it("ローカルを書き換えた後に履歴を復元すると、アップロード時の内容に戻り変更ありの表示が消える", async () => {
    setCurrentUserId("user-1");
    saveRoutines([routineA]);
    saveTodoLists([todoListFixture]);
    await uploadToFirestore();
    expect(mockFirestoreDocs.get(LATEST_PATH)).toMatchObject({
      routines: [routineA],
      todoLists: [todoListFixture],
    });

    saveRoutines([routineB]);
    saveTodoLists([]);
    setSyncStatus({ hasLocalChanges: true, hasRemoteChanges: true });

    const [snapshot] = await getSyncSnapshots();
    await applySyncSnapshot(snapshot!.id);

    expect(getRoutines()).toEqual([routineA]);
    expect(getTodoLists()).toEqual([todoListFixture]);
    expect(getSyncStatus()).toMatchObject({
      isSyncing: false,
      hasLocalChanges: false,
      hasRemoteChanges: false,
      error: null,
    });
    // 復元は履歴を読むだけで、リモートの最新データや履歴は変えない
    expect((await getSyncSnapshots()).map(({ id }) => id)).toEqual([
      snapshot!.id,
    ]);
  });

  it("最新の履歴を削除すると、次のダウンロードでは 1 つ前のアップロード内容が復元される", async () => {
    saveRoutines([routineA]);
    await uploadToFirestore();
    const firstUploadedAt = mockFirestoreDocs.get(LATEST_PATH)!.lastModified;

    saveRoutines([routineB]);
    await uploadToFirestore();

    const snapshots = await getSyncSnapshots();
    expect(snapshots.map((snapshot) => snapshot.data.routines)).toEqual([
      [routineB],
      [routineA],
    ]);

    await deleteSyncSnapshot(snapshots[0]!.id);
    expect(mockFirestoreDocs.get(LATEST_PATH)).toMatchObject({
      routines: [routineA],
      lastModified: firstUploadedAt,
    });

    saveRoutines([]);
    await downloadFromFirestore({ reload: false });

    expect(getRoutines()).toEqual([routineA]);
    expect(getLocalDataUpdatedAt()).toBe(firstUploadedAt);
  });

  it("唯一の履歴を削除すると最新データも消え、ダウンロードは失敗してローカルは変わらない", async () => {
    saveRoutines([routineA]);
    await uploadToFirestore();
    const [snapshot] = await getSyncSnapshots();

    await deleteSyncSnapshot(snapshot!.id);

    expect(mockFirestoreDocs.size).toBe(0);
    await expect(
      downloadFromFirestore({ reload: false }),
    ).rejects.toMatchObject({ code: "download-failed" });
    expect(getRoutines()).toEqual([routineA]);
    expect(getSyncStatus().isSyncing).toBe(false);
  });

  it("6 回アップロードすると、履歴は新しい 5 件だけが新しい順に残る", async () => {
    for (let index = 1; index <= 6; index++) {
      saveRoutines([{ ...routineA, title: `朝活 ${index}` }]);
      await uploadToFirestore();
    }

    const snapshots = await getSyncSnapshots();

    expect(
      snapshots.map((snapshot) => snapshot.data.routines[0]?.title),
    ).toEqual(["朝活 6", "朝活 5", "朝活 4", "朝活 3", "朝活 2"]);
  });

  it("存在しない履歴の復元は snapshot-apply-failed になり、ローカルは変わらない", async () => {
    saveRoutines([routineA]);
    await uploadToFirestore();
    saveRoutines([routineB]);

    await expect(applySyncSnapshot("missing")).rejects.toMatchObject({
      code: "snapshot-apply-failed",
    });
    expect(getRoutines()).toEqual([routineB]);
    expect(getSyncStatus()).toMatchObject({
      isSyncing: false,
      error: expect.any(String),
    });
  });
});
