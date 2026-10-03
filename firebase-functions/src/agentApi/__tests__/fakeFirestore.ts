import type * as admin from "firebase-admin";

type Data = Record<string, unknown>;

type FakeRef = {
  path: string;
  id: string;
  collection: (name: string) => FakeCollection;
};
type FakeCollection = {
  path: string;
  doc: (id?: string) => FakeRef;
  orderBy: (field: string, direction: "asc" | "desc") => FakeQuery;
};
type FakeQuery = { path: string; field: string; direction: "asc" | "desc" };

export const createFakeFirestore = (initial: Record<string, Data>) => {
  const store = new Map<string, Data>(Object.entries(initial));
  let autoId = 0;

  const makeRef = (path: string): FakeRef => ({
    path,
    id: path.split("/").pop() as string,
    collection: (name) => makeCollection(`${path}/${name}`),
  });

  const makeCollection = (path: string): FakeCollection => ({
    path,
    doc: (id) => makeRef(`${path}/${id ?? `auto-${++autoId}`}`),
    orderBy: (field, direction) => ({ path, field, direction }),
  });

  const queryDocs = (query: FakeQuery) =>
    [...store.entries()]
      .filter(
        ([path]) =>
          path.startsWith(`${query.path}/`) &&
          !path.slice(query.path.length + 1).includes("/"),
      )
      .map(([path, data]) => ({ ref: makeRef(path), id: path.split("/").pop(), data: () => data }))
      .sort((a, b) => {
        const left = a.data()[query.field] as number;
        const right = b.data()[query.field] as number;
        return query.direction === "desc" ? right - left : left - right;
      });

  const transaction = {
    get: async (target: FakeRef | FakeQuery) => {
      if ("field" in target) return { docs: queryDocs(target) };
      const data = store.get(target.path);
      return { exists: data !== undefined, data: () => data };
    },
    update: (ref: FakeRef, data: Data) => {
      store.set(ref.path, { ...(store.get(ref.path) ?? {}), ...data });
    },
    set: (ref: FakeRef, data: Data) => {
      store.set(ref.path, data);
    },
    delete: (ref: FakeRef) => {
      store.delete(ref.path);
    },
  };

  const db = {
    collection: (name: string) => makeCollection(name),
    runTransaction: async <T>(fn: (tx: typeof transaction) => Promise<T>) => fn(transaction),
  };

  return {
    db: db as unknown as admin.firestore.Firestore,
    get: (path: string) => store.get(path),
    snapshotsOf: (uid: string) =>
      queryDocs({ path: `users/${uid}/syncSnapshots`, field: "uploadedAt", direction: "desc" }).map(
        (doc) => doc.data(),
      ),
  };
};
