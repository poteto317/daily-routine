import type { FirebaseStorage } from "firebase/storage";
import { getStorageInstance } from "../storage";
import { getFirebaseState } from "../state";

jest.mock("../state", () => ({
  getFirebaseState: jest.fn(),
}));

const mockGetFirebaseState = getFirebaseState as jest.MockedFunction<
  typeof getFirebaseState
>;

const useStorageState = (storage: FirebaseStorage | null) => {
  mockGetFirebaseState.mockReturnValue({
    app: null,
    messaging: null,
    auth: null,
    firestore: null,
    storage,
  });
};

describe("getStorageInstance", () => {
  it("初期化済みの FirebaseStorage を返す", () => {
    const storage = {} as FirebaseStorage;
    useStorageState(storage);

    expect(getStorageInstance()).toBe(storage);
  });

  it("未初期化なら storage-not-available を投げる", () => {
    useStorageState(null);

    expect(() => getStorageInstance()).toThrow(
      expect.objectContaining({
        name: "FirebaseError",
        code: "storage-not-available",
        message: "ストレージが初期化されていません",
      }),
    );
  });
});
