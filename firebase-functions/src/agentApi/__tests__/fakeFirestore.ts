
import type { Firestore } from "../../adminSdk";
type Data = Record<string, unknown>;
type Direction = "asc" | "desc";

type FakeRef = {
  path: string;
  id: string;
  collection: (name: string) => FakeCollection;
  get: () => Promise<{ exists: boolean; data: () => Data | undefined }>;
};
type FakeCollection = {
  path: string;
  doc: (id?: string) => FakeRef;
  orderBy: (field: string, direction: Direction) => FakeQuery;
};
type FakeQuery = {
  path: string;
  field: string;
  direction: Direction;
  /** select() で指定したフィールド。未指定なら全フィールド */
  fields?: string[];
  select: (...fields: string[]) => FakeQuery;
};
type PendingWrite =
  | { type: "set" | "update"; path: string; data: Data }
  | { type: "delete"; path: string };

const READ_AFTER_WRITE_MESSAGE =
  "Firestore transactions require all reads to be executed before all writes.";

/**
 * 実 SDK の主な制約を再現するフェイク Firestore。
 * - トランザクションの書き込みはコミット時にまとめて反映する（失敗時は何も反映しない）
 * - 書き込み後の読み取りは失敗する
 * - 存在しないドキュメントへの update はコミット時に失敗する（NOT_FOUND）
 * - select() で指定したフィールドだけを返す
 */
export const createFakeFirestore = (initial: Record<string, Data>) => {
  const store = new Map<string, Data>(Object.entries(initial));
  let autoId = 0;

  const makeRef = (path: string): FakeRef => ({
    path,
    id: path.split("/").pop() as string,
    collection: (name) => makeCollection(`${path}/${name}`),
    get: async () => {
      const data = store.get(path);
      return { exists: data !== undefined, data: () => data };
    },
  });

  const makeQuery = (
    path: string,
    field: string,
    direction: Direction,
    fields?: string[],
  ): FakeQuery => ({
    path,
    field,
    direction,
    fields,
    select: (...selected) => makeQuery(path, field, direction, selected),
  });

  const makeCollection = (path: string): FakeCollection => ({
    path,
    doc: (id) => makeRef(`${path}/${id ?? `auto-${++autoId}`}`),
    orderBy: (field, direction) => makeQuery(path, field, direction),
  });

  const project = (data: Data, fields?: string[]): Data =>
    fields
      ? Object.fromEntries(
          Object.entries(data).filter(([key]) => fields.includes(key)),
        )
      : data;

  const queryDocs = (query: FakeQuery) =>
    [...store.entries()]
      .filter(
        ([path]) =>
          path.startsWith(`${query.path}/`) &&
          !path.slice(query.path.length + 1).includes("/"),
      )
      .sort(([, a], [, b]) => {
        const left = a[query.field] as number;
        const right = b[query.field] as number;
        return query.direction === "desc" ? right - left : left - right;
      })
      .map(([path, data]) => ({
        ref: makeRef(path),
        id: path.split("/").pop(),
        data: () => project(data, query.fields),
      }));

  const applyWrites = (writes: PendingWrite[]): void => {
    const next = new Map(store);
    for (const write of writes) {
      if (write.type === "delete") {
        next.delete(write.path);
      } else if (write.type === "set") {
        next.set(write.path, write.data);
      } else {
        const existing = next.get(write.path);
        if (!existing) {
          throw new Error(`NOT_FOUND: No document to update: ${write.path}`);
        }
        next.set(write.path, { ...existing, ...write.data });
      }
    }
    store.clear();
    next.forEach((data, path) => store.set(path, data));
  };

  const createTransaction = () => {
    const writes: PendingWrite[] = [];
    const transaction = {
      get: async (target: FakeRef | FakeQuery) => {
        if (writes.length > 0) throw new Error(READ_AFTER_WRITE_MESSAGE);
        if ("field" in target) return { docs: queryDocs(target) };
        const data = store.get(target.path);
        return { exists: data !== undefined, data: () => data };
      },
      update: (ref: FakeRef, data: Data) => {
        writes.push({ type: "update", path: ref.path, data });
      },
      set: (ref: FakeRef, data: Data) => {
        writes.push({ type: "set", path: ref.path, data });
      },
      delete: (ref: FakeRef) => {
        writes.push({ type: "delete", path: ref.path });
      },
    };
    return { transaction, commit: () => applyWrites(writes) };
  };

  const db = {
    collection: (name: string) => makeCollection(name),
    runTransaction: async <T>(
      fn: (
        transaction: ReturnType<typeof createTransaction>["transaction"],
      ) => Promise<T>,
    ): Promise<T> => {
      const { transaction, commit } = createTransaction();
      const result = await fn(transaction);
      commit();
      return result;
    },
  };

  return {
    db: db as unknown as Firestore,
    get: (path: string) => store.get(path),
    snapshotsOf: (uid: string) =>
      queryDocs(
        makeQuery(`users/${uid}/syncSnapshots`, "uploadedAt", "desc"),
      ).map((doc) => doc.data()),
  };
};
