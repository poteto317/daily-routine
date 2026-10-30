import type { Firestore } from "firebase/firestore";
import { getFirestoreInstance } from "../firestore";
import { getFirebaseState } from "../state";

jest.mock("../state", () => ({
  getFirebaseState: jest.fn(),
}));

const mockGetFirebaseState = getFirebaseState as jest.MockedFunction<
  typeof getFirebaseState
>;

const useFirestoreState = (firestore: Firestore | null) => {
  mockGetFirebaseState.mockReturnValue({
    app: null,
    messaging: null,
    auth: null,
    storage: null,
    firestore,
  });
};

describe("getFirestoreInstance", () => {
  it("初期化済みの Firestore を返す", () => {
    const firestore = {} as Firestore;
    useFirestoreState(firestore);

    expect(getFirestoreInstance()).toBe(firestore);
  });

  it("未初期化なら firestore-not-available を投げる", () => {
    useFirestoreState(null);

    expect(() => getFirestoreInstance()).toThrow(
      expect.objectContaining({
        name: "FirebaseError",
        code: "firestore-not-available",
        message: "データベースが初期化されていません",
      }),
    );
  });
});
