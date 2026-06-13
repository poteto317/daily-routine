import { canClaimProcessing } from "../canClaimProcessing";
import { PROCESSING_LOCK_TIMEOUT_MS } from "../constants";

describe("canClaimProcessing", () => {
  const NOW = 1_700_000_000_000; // 任意の現在時刻 (ms)

  it("status が pending なら true を返す（通常フロー）", () => {
    expect(canClaimProcessing("pending", undefined, NOW)).toBe(true);
  });

  it("status が processing かつ processingAt が stale なら true を返す（stuck 復旧）", () => {
    const stale = NOW - PROCESSING_LOCK_TIMEOUT_MS - 1;
    expect(canClaimProcessing("processing", stale, NOW)).toBe(true);
  });

  it("status が processing かつ processingAt がちょうどタイムアウト境界なら true を返す", () => {
    const boundary = NOW - PROCESSING_LOCK_TIMEOUT_MS;
    expect(canClaimProcessing("processing", boundary, NOW)).toBe(true);
  });

  it("status が processing かつ processingAt が fresh なら false を返す（他の実行が進行中）", () => {
    const fresh = NOW - 1_000; // 1秒前
    expect(canClaimProcessing("processing", fresh, NOW)).toBe(false);
  });

  it("status が processing かつ processingAt 未設定なら true を返す（旧データ互換）", () => {
    expect(canClaimProcessing("processing", undefined, NOW)).toBe(true);
  });

  it("status が issued なら false を返す（終端状態）", () => {
    expect(canClaimProcessing("issued", undefined, NOW)).toBe(false);
  });

  it("status が error なら false を返す（終端状態）", () => {
    expect(canClaimProcessing("error", undefined, NOW)).toBe(false);
  });

  it("status が未設定なら false を返す（ドキュメント不正）", () => {
    expect(canClaimProcessing(undefined, undefined, NOW)).toBe(false);
  });

  it("status が想定外の値なら false を返す", () => {
    expect(canClaimProcessing("unknown", undefined, NOW)).toBe(false);
  });
});
