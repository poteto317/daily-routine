import { type TransferOptions } from "./constants";
import { getTodayString } from "@/lib/storage/core";

/**
 * 組み立てたデータを JSON ファイルとしてブラウザに配る。
 *
 * 「何を書き出すか」とは変わる理由が別なので分けてある。ここが持つのは
 * Blob の生成・anchor 経由のダウンロード・後始末だけ。
 */
export const downloadExportData = (options: TransferOptions, data: object) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  const date = getTodayString();
  const types = Object.entries(options)
    .filter(([, value]) => value)
    .map(([key]) => key)
    .join("-");
  anchor.download = `daily-routine-${types}-${date}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};
