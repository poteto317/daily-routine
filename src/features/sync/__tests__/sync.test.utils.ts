import * as firestore from "firebase/firestore";
import * as firebaseLib from "@/lib/firebase";
import { setCurrentUserId } from "@/lib/storage/core";
import * as todoListsStorage from "@/features/todo-lists/storage";

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  orderBy: jest.fn(),
  setDoc: jest.fn(),
  query: jest.fn(),
  onSnapshot: jest.fn(),
  serverTimestamp: jest.fn(() => "server-timestamp"),
}));

jest.mock("@/lib/firebase", () => {
  class MockFirebaseError extends Error {
    code: string;

    constructor(message: string, code: string) {
      super(message);
      this.name = "FirebaseError";
      this.code = code;
    }
  }

  return {
    getFirestoreInstance: jest.fn(),
    getOrCreateUser: jest.fn(),
    getAuthInstance: jest.fn(() => ({ currentUser: null })),
    FirebaseError: MockFirebaseError,
  };
});

jest.mock("@/features/routine/storage");
jest.mock("@/features/settings/storage");
jest.mock("@/features/pomodoro/storage");
jest.mock("@/features/work-tracker/storage");
jest.mock("@/features/weight-tracker/storage");
jest.mock("@/features/workout-tracker/storage");
jest.mock("@/features/journal/storage");
jest.mock("@/features/budget/storage");
jest.mock("@/features/meal/storage");
jest.mock("@/features/preset/storage");
jest.mock("@/features/todo-lists/storage");

export const mockDoc = firestore.doc as jest.MockedFunction<
  typeof firestore.doc
>;
export const mockCollection = firestore.collection as jest.MockedFunction<
  typeof firestore.collection
>;
export const mockGetDoc = firestore.getDoc as jest.MockedFunction<
  typeof firestore.getDoc
>;
export const mockGetDocs = firestore.getDocs as jest.MockedFunction<
  typeof firestore.getDocs
>;
export const mockDeleteDoc = firestore.deleteDoc as jest.MockedFunction<
  typeof firestore.deleteDoc
>;
export const mockSetDoc = firestore.setDoc as jest.MockedFunction<
  typeof firestore.setDoc
>;
export const mockOrderBy = firestore.orderBy as jest.MockedFunction<
  typeof firestore.orderBy
>;
export const mockQuery = firestore.query as jest.MockedFunction<
  typeof firestore.query
>;
export const mockServerTimestamp =
  firestore.serverTimestamp as jest.MockedFunction<
    typeof firestore.serverTimestamp
  >;
export const mockGetFirestoreInstance =
  firebaseLib.getFirestoreInstance as jest.MockedFunction<
    typeof firebaseLib.getFirestoreInstance
  >;
export const mockGetOrCreateUser =
  firebaseLib.getOrCreateUser as jest.MockedFunction<
    typeof firebaseLib.getOrCreateUser
  >;

export const mockExistingSyncDocument = (data: unknown): void => {
  mockGetDoc.mockResolvedValue({
    exists: () => true,
    data: () => data,
  } as never);
};

export const mockMissingSyncDocument = (): void => {
  mockGetDoc.mockResolvedValue({
    exists: () => false,
  } as never);
};

export const setupSyncTestEnvironment = (): void => {
  setCurrentUserId(null);
  jest.clearAllMocks();
  localStorage.clear();
  mockGetOrCreateUser.mockResolvedValue({ uid: "user-1" } as never);
  mockGetFirestoreInstance.mockReturnValue({} as never);
  mockCollection.mockImplementation((...args) => {
    const path = args.slice(1).join("/");
    return { path } as never;
  });
  mockDoc.mockImplementation(
    (refOrFirestore: unknown, ...segments: string[]) => {
      if (
        typeof refOrFirestore === "object" &&
        refOrFirestore !== null &&
        "path" in refOrFirestore
      ) {
        const basePath = String((refOrFirestore as { path: string }).path);
        if (segments.length === 0) {
          return {
            id: "generated-snapshot-id",
            path: `${basePath}/generated-snapshot-id`,
          } as never;
        }

        return {
          id: segments[segments.length - 1],
          path: `${basePath}/${segments.join("/")}`,
        } as never;
      }

      return {
        id: segments[segments.length - 1] ?? "user-1",
        path: segments.join("/"),
      } as never;
    },
  );
  mockOrderBy.mockImplementation(
    (fieldPath, directionStr) =>
      ({
        fieldPath,
        directionStr,
      }) as never,
  );
  mockQuery.mockImplementation((queryRef, ...constraints) => {
    const path =
      typeof queryRef === "object" && queryRef !== null && "path" in queryRef
        ? String((queryRef as { path: string }).path)
        : "";

    return {
      path,
      constraints,
    } as never;
  });
  mockSetDoc.mockResolvedValue(undefined as never);
  mockGetDocs.mockResolvedValue({ docs: [] } as never);
  mockDeleteDoc.mockResolvedValue(undefined as never);
  mockServerTimestamp.mockReturnValue("server-timestamp" as never);
  (todoListsStorage.getTodoLists as jest.Mock).mockReturnValue([]);
  (todoListsStorage.getTodoCategories as jest.Mock).mockReturnValue([]);
};
