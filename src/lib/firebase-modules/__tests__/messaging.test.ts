import { getToken, type Messaging } from "firebase/messaging";
import { getFcmServiceWorkerRegistration } from "@/hooks/serviceWorkerRegistration";
import { getFCMToken } from "../messaging";
import { getFirebaseState } from "../state";

jest.mock("firebase/messaging", () => ({
  getToken: jest.fn(),
  onMessage: jest.fn(),
}));

jest.mock("@/hooks/serviceWorkerRegistration", () => ({
  getFcmServiceWorkerRegistration: jest.fn(),
}));

jest.mock("../state", () => ({
  getFirebaseState: jest.fn(),
}));

const mockGetToken = getToken as jest.MockedFunction<typeof getToken>;
const mockGetRegistration =
  getFcmServiceWorkerRegistration as jest.MockedFunction<
    typeof getFcmServiceWorkerRegistration
  >;
const mockGetFirebaseState = getFirebaseState as jest.MockedFunction<
  typeof getFirebaseState
>;

describe("getFCMToken", () => {
  const messaging = {} as Messaging;
  const originalNotification = global.Notification;

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(global, "Notification", {
      configurable: true,
      value: { permission: "granted", requestPermission: jest.fn() },
    });
    mockGetFirebaseState.mockReturnValue({
      app: null,
      auth: null,
      firestore: null,
      messaging,
    });
  });

  afterEach(() => {
    Object.defineProperty(global, "Notification", {
      configurable: true,
      value: originalNotification,
    });
  });

  it("Messaging未初期化ならmessaging-not-availableを投げる", async () => {
    mockGetFirebaseState.mockReturnValue({
      app: null,
      auth: null,
      firestore: null,
      messaging: null,
    });

    await expect(getFCMToken()).rejects.toMatchObject({
      name: "FirebaseError",
      code: "messaging-not-available",
    });
    expect(mockGetToken).not.toHaveBeenCalled();
  });

  it.each(["default", "denied"] as const)(
    "通知権限が%sなら許可を要求せずpermission-deniedを投げる",
    async (permission) => {
      const requestPermission = jest.fn();
      Object.defineProperty(global, "Notification", {
        configurable: true,
        value: { permission, requestPermission },
      });

      await expect(getFCMToken()).rejects.toMatchObject({
        name: "FirebaseError",
        code: "permission-denied",
      });

      expect(requestPermission).not.toHaveBeenCalled();
      expect(mockGetRegistration).not.toHaveBeenCalled();
      expect(mockGetToken).not.toHaveBeenCalled();
    },
  );

  it("FCM用Service Workerでトークンを取得する", async () => {
    const registration = {} as ServiceWorkerRegistration;
    mockGetRegistration.mockResolvedValue(registration);
    mockGetToken.mockResolvedValue("token-123");

    await expect(getFCMToken()).resolves.toBe("token-123");

    expect(mockGetRegistration).toHaveBeenCalledTimes(1);
    expect(mockGetToken).toHaveBeenCalledWith(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
  });

  it("Firebase SDKが空トークンを返したらtoken-not-generatedを投げる", async () => {
    mockGetRegistration.mockResolvedValue(undefined);
    mockGetToken.mockResolvedValue("");

    await expect(getFCMToken()).rejects.toMatchObject({
      name: "FirebaseError",
      code: "token-not-generated",
    });
  });

  it("Firebase SDK例外をtoken-retrieval-failedへ変換する", async () => {
    mockGetRegistration.mockResolvedValue(undefined);
    mockGetToken.mockRejectedValue(new Error("network down"));

    await expect(getFCMToken()).rejects.toMatchObject({
      name: "FirebaseError",
      code: "token-retrieval-failed",
    });
  });
});
