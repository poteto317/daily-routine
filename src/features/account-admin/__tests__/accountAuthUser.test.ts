import { deleteApp, initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  inMemoryPersistence,
  initializeAuth,
} from "firebase/auth";
import { getAuthInstance } from "@/lib/firebase";
import { createAuthUser } from "../accountService";

jest.mock("firebase/app", () => ({
  deleteApp: jest.fn(),
  initializeApp: jest.fn(),
}));
jest.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: jest.fn(),
  inMemoryPersistence: Symbol("memory persistence"),
  initializeAuth: jest.fn(),
}));
jest.mock("@/lib/firebase", () => ({ getAuthInstance: jest.fn() }));

const options = { projectId: "demo-daily-routine" };
const primaryAuth = { app: { options }, currentUser: { uid: "admin" } };
const temporaryApp = { name: "temporary" };
const temporaryAuth = { app: temporaryApp };

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(getAuthInstance).mockReturnValue(primaryAuth as never);
  jest.mocked(initializeApp).mockReturnValue(temporaryApp as never);
  jest.mocked(initializeAuth).mockReturnValue(temporaryAuth as never);
  jest.mocked(deleteApp).mockResolvedValue(undefined);
});

it("管理者の Auth とは別のアプリでユーザーを作成する", async () => {
  jest.mocked(createUserWithEmailAndPassword).mockResolvedValue({
    user: { uid: "created" },
  } as never);

  await expect(
    createAuthUser("u@example.com", "test-password"),
  ).resolves.toEqual({
    uid: "created",
  });
  expect(initializeApp).toHaveBeenCalledWith(options, expect.any(String));
  expect(initializeAuth).toHaveBeenCalledWith(temporaryApp, {
    persistence: inMemoryPersistence,
  });
  expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
    temporaryAuth,
    "u@example.com",
    "test-password",
  );
  expect(primaryAuth.currentUser.uid).toBe("admin");
  expect(deleteApp).toHaveBeenCalledWith(temporaryApp);
});

it("Auth の作成に失敗しても一時アプリを破棄する", async () => {
  const failure = new Error("auth failure");
  jest.mocked(createUserWithEmailAndPassword).mockRejectedValue(failure);

  await expect(createAuthUser("u@example.com", "test-password")).rejects.toBe(
    failure,
  );
  expect(deleteApp).toHaveBeenCalledWith(temporaryApp);
});
