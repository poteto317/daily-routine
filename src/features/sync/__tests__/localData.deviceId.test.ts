import { getDeviceId } from "../sync/deviceId";
import { LOCAL_DATA_UPDATED_AT_EVENT } from "@/lib/storage/core";
import * as localDataHelpers from "../sync/localDataHelpers";

jest.mock("../sync/localDataHelpers", () => ({
  ...jest.requireActual("../sync/localDataHelpers"),
  createDeviceId: jest.fn(() => "generated-device-id"),
}));

const DEVICE_ID_KEY = "device-id";

describe("getDeviceId", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe("JSON 形式で保存済みの場合", () => {
    it("JSON 文字列をそのまま返す", () => {
      localStorage.setItem(DEVICE_ID_KEY, JSON.stringify("json-device-abc"));
      expect(getDeviceId()).toBe("json-device-abc");
    });

    it("createDeviceId を呼ばない", () => {
      localStorage.setItem(DEVICE_ID_KEY, JSON.stringify("json-device-abc"));
      getDeviceId();
      expect(localDataHelpers.createDeviceId).not.toHaveBeenCalled();
    });
  });

  describe("旧形式（生文字列）が入っている場合", () => {
    it("device-id をそのまま返す", () => {
      localStorage.setItem(DEVICE_ID_KEY, "raw-device-legacy-xyz");
      expect(getDeviceId()).toBe("raw-device-legacy-xyz");
    });

    it("JSON 形式に移行して上書きする", () => {
      localStorage.setItem(DEVICE_ID_KEY, "raw-device-legacy-xyz");
      getDeviceId();
      expect(localStorage.getItem(DEVICE_ID_KEY)).toBe(
        JSON.stringify("raw-device-legacy-xyz"),
      );
    });

    it("createDeviceId を呼ばない", () => {
      localStorage.setItem(DEVICE_ID_KEY, "raw-device-legacy-xyz");
      getDeviceId();
      expect(localDataHelpers.createDeviceId).not.toHaveBeenCalled();
    });
  });

  describe("壊れた値が入っている場合は再生成される", () => {
    it("JSON null が入っている場合", () => {
      localStorage.setItem(DEVICE_ID_KEY, JSON.stringify(null)); // "null"
      const id = getDeviceId();
      expect(id).toBe("generated-device-id");
      expect(localDataHelpers.createDeviceId).toHaveBeenCalledTimes(1);
    });

    it("JSON number が入っている場合", () => {
      localStorage.setItem(DEVICE_ID_KEY, JSON.stringify(42)); // "42"
      const id = getDeviceId();
      expect(id).toBe("generated-device-id");
      expect(localDataHelpers.createDeviceId).toHaveBeenCalledTimes(1);
    });

    it("再生成した ID を JSON 形式で保存する", () => {
      localStorage.setItem(DEVICE_ID_KEY, JSON.stringify(null));
      getDeviceId();
      expect(localStorage.getItem(DEVICE_ID_KEY)).toBe(
        JSON.stringify("generated-device-id"),
      );
    });
  });

  describe("device-id が未保存の場合", () => {
    it("新規生成した ID を返す", () => {
      expect(getDeviceId()).toBe("generated-device-id");
      expect(localDataHelpers.createDeviceId).toHaveBeenCalledTimes(1);
    });
  });

  describe("skipLocalDataUpdatedAt: true で local-data-updated-at を更新しない", () => {
    it("新規生成時にイベントが発火しない", () => {
      const dispatchSpy = jest.spyOn(window, "dispatchEvent");

      getDeviceId();

      expect(dispatchSpy).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: LOCAL_DATA_UPDATED_AT_EVENT }),
      );

      dispatchSpy.mockRestore();
    });

    it("旧形式マイグレーション時にイベントが発火しない", () => {
      const dispatchSpy = jest.spyOn(window, "dispatchEvent");
      localStorage.setItem(DEVICE_ID_KEY, "raw-device-legacy-xyz");

      getDeviceId();

      expect(dispatchSpy).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: LOCAL_DATA_UPDATED_AT_EVENT }),
      );

      dispatchSpy.mockRestore();
    });
  });
});
