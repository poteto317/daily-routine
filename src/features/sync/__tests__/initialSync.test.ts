import { doc, getDoc } from "firebase/firestore";
import { getFirestoreInstance, getOrCreateUser } from "@/lib/firebase";
import { getRoutines } from "@/features/routine/storage";
import { initialSync } from "../sync/initialSync";
import { downloadFromFirestore } from "../sync/download";
import { uploadToFirestore } from "../sync/upload";

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
}));
jest.mock("@/lib/firebase", () => ({
  getFirestoreInstance: jest.fn(),
  getOrCreateUser: jest.fn(),
}));
jest.mock("@/features/routine/storage", () => ({
  getRoutines: jest.fn(),
}));
jest.mock("../sync/download", () => ({
  downloadFromFirestore: jest.fn(),
}));
jest.mock("../sync/upload", () => ({
  uploadToFirestore: jest.fn(),
}));

const mockGetDoc = getDoc as jest.Mock;
const mockGetRoutines = getRoutines as jest.Mock;

const setup = (remoteExists: boolean, localCount: number) => {
  mockGetDoc.mockResolvedValue({ exists: () => remoteExists });
  mockGetRoutines.mockReturnValue(new Array(localCount).fill({}));
};

describe("initialSync", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (getOrCreateUser as jest.Mock).mockResolvedValue({ uid: "u1" });
    (getFirestoreInstance as jest.Mock).mockReturnValue("fs");
    (doc as jest.Mock).mockReturnValue("ref");
  });

  it("uid のドキュメントを参照する", async () => {
    setup(true, 1);

    await initialSync();

    expect(doc).toHaveBeenCalledWith("fs", "users", "u1");
    expect(mockGetDoc).toHaveBeenCalledWith("ref");
  });

  it("ドキュメントあり・ローカル空ならダウンロードする", async () => {
    setup(true, 0);

    await initialSync();

    expect(downloadFromFirestore).toHaveBeenCalledTimes(1);
    expect(uploadToFirestore).not.toHaveBeenCalled();
  });

  it("ドキュメントあり・ローカルありなら何もしない", async () => {
    setup(true, 2);

    await initialSync();

    expect(downloadFromFirestore).not.toHaveBeenCalled();
    expect(uploadToFirestore).not.toHaveBeenCalled();
  });

  it("ドキュメントなし・ローカルありならアップロードする", async () => {
    setup(false, 2);

    await initialSync();

    expect(uploadToFirestore).toHaveBeenCalledTimes(1);
    expect(downloadFromFirestore).not.toHaveBeenCalled();
  });

  it("ドキュメントなし・ローカル空なら何もしない", async () => {
    setup(false, 0);

    await initialSync();

    expect(uploadToFirestore).not.toHaveBeenCalled();
    expect(downloadFromFirestore).not.toHaveBeenCalled();
  });

  it("ユーザー取得の例外を握りつぶして resolve する", async () => {
    (getOrCreateUser as jest.Mock).mockRejectedValue(new Error("auth"));

    await expect(initialSync()).resolves.toBeUndefined();
    expect(mockGetDoc).not.toHaveBeenCalled();
  });

  it("ドキュメント取得の例外を握りつぶして resolve する", async () => {
    mockGetDoc.mockRejectedValue(new Error("network"));

    await expect(initialSync()).resolves.toBeUndefined();
    expect(uploadToFirestore).not.toHaveBeenCalled();
  });

  it("ダウンロードの例外を握りつぶして resolve する", async () => {
    setup(true, 0);
    (downloadFromFirestore as jest.Mock).mockRejectedValue(new Error("dl"));

    await expect(initialSync()).resolves.toBeUndefined();
    expect(downloadFromFirestore).toHaveBeenCalledTimes(1);
  });
});
