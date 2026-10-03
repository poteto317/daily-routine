/** @jest-environment node */
import type { Response } from "express";
import * as logger from "firebase-functions/logger";
import { ApiError } from "../errors";
import { respondWithError, sendError } from "../errorResponse";

jest.mock("firebase-functions/logger", () => ({ error: jest.fn() }));

const makeRes = () => {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("sendError", () => {
  it("status と { error: { code, message } } で返す", () => {
    const res = makeRes();
    sendError(
      res as unknown as Response,
      new ApiError(404, "not_found", "なし"),
    );
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: "not_found", message: "なし" },
    });
  });
});

describe("respondWithError", () => {
  it("ApiError はそのまま返し、ログには出さない", () => {
    const res = makeRes();
    respondWithError(
      res as unknown as Response,
      new ApiError(400, "invalid_field", "x"),
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(logger.error).not.toHaveBeenCalled();
  });

  it("想定外のエラーは 500 internal_error にし、詳細はログにだけ残す", () => {
    const res = makeRes();
    const error = new Error("secret detail");
    respondWithError(res as unknown as Response, error);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: "internal_error", message: expect.any(String) },
    });
    expect(JSON.stringify(res.json.mock.calls)).not.toContain("secret detail");
    expect(logger.error).toHaveBeenCalledWith("agentApi error:", error);
  });

  it("Error 以外（文字列など）が投げられても 500 にする", () => {
    const res = makeRes();
    respondWithError(res as unknown as Response, "boom");
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
