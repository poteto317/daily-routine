import * as firebaseLib from "@/lib/firebase";
import * as firestore from "firebase/firestore";

jest.mock("@/lib/firebase", () => ({
  getFirestoreInstance: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
}));

export const mockGetFirestoreInstance =
  firebaseLib.getFirestoreInstance as jest.MockedFunction<
    typeof firebaseLib.getFirestoreInstance
  >;
export const mockCollection = firestore.collection as jest.MockedFunction<
  typeof firestore.collection
>;
export const mockDoc = firestore.doc as jest.MockedFunction<
  typeof firestore.doc
>;
export const mockGetDocs = firestore.getDocs as jest.MockedFunction<
  typeof firestore.getDocs
>;
export const mockGetDoc = firestore.getDoc as jest.MockedFunction<
  typeof firestore.getDoc
>;
export const mockSetDoc = firestore.setDoc as jest.MockedFunction<
  typeof firestore.setDoc
>;
export const mockUpdateDoc = firestore.updateDoc as jest.MockedFunction<
  typeof firestore.updateDoc
>;
export const mockDeleteDoc = firestore.deleteDoc as jest.MockedFunction<
  typeof firestore.deleteDoc
>;
export const mockQuery = firestore.query as jest.MockedFunction<
  typeof firestore.query
>;
export const mockOrderBy = firestore.orderBy as jest.MockedFunction<
  typeof firestore.orderBy
>;

export const setupAccountServiceMocks = () => {
  jest.clearAllMocks();
  mockGetFirestoreInstance.mockReturnValue({} as never);
  mockCollection.mockReturnValue({} as never);
  mockOrderBy.mockReturnValue({} as never);
  mockQuery.mockReturnValue({} as never);
  mockDoc.mockReturnValue({ path: "accounts/u1" } as never);
  mockSetDoc.mockResolvedValue(undefined as never);
  mockUpdateDoc.mockResolvedValue(undefined as never);
  mockDeleteDoc.mockResolvedValue(undefined as never);
};
