/**
 * @jest-environment node
 */
import { getAuthInstance } from "../auth";
import { getFirebaseState } from "../state";

jest.mock("firebase/auth", () => ({
  signInAnonymously: jest.fn(),
}));

jest.mock("../state", () => ({
  getFirebaseState: jest.fn(),
}));

// window が無い環境（サーバー側レンダリング）での振る舞いを確かめる
describe("getAuthInstance（サーバー側）", () => {
  it("window が無ければ Firebase の状態を見ずに auth-not-available を投げる", () => {
    expect(() => getAuthInstance()).toThrow(
      expect.objectContaining({
        name: "FirebaseError",
        code: "auth-not-available",
        message: "認証機能はサーバー側では使用できません",
      }),
    );
    expect(getFirebaseState).not.toHaveBeenCalled();
  });
});
