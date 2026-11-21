import * as firebaseLib from "@/lib/firebase";
import * as firestore from "firebase/firestore";

jest.mock("@/lib/firebase", () => ({
  getFirestoreInstance: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDocsFromServer: jest.fn(),
  getDocFromServer: jest.fn(),
  writeBatch: jest.fn(),
  runTransaction: jest.fn(),
}));

export const mockGetFirestoreInstance = jest.mocked(
  firebaseLib.getFirestoreInstance,
);
export const mockDoc = jest.mocked(firestore.doc);
export const mockGetDocs = jest.mocked(firestore.getDocsFromServer);
export const mockGetDoc = jest.mocked(firestore.getDocFromServer);
export const mockWriteBatch = jest.mocked(firestore.writeBatch);
export const mockRunTransaction = jest.mocked(firestore.runTransaction);

export const mockBatch = {
  set: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  commit: jest.fn(),
};

export const mockTransaction = {
  get: jest.fn(),
  set: jest.fn(),
};

export const setupAccountServiceMocks = () => {
  jest.resetAllMocks();
  mockGetFirestoreInstance.mockReturnValue({} as never);
  mockDoc.mockImplementation(
    (_db, path, ...segments) =>
      ({
        path: [path, ...segments].join("/"),
      }) as never,
  );
  mockWriteBatch.mockReturnValue(mockBatch as never);
  mockBatch.commit.mockResolvedValue(undefined);
  mockRunTransaction.mockImplementation(async (_db, run) =>
    run(mockTransaction as never),
  );
};
