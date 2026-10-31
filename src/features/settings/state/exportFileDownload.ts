import { type TransferOptions } from "./constants";
import { downloadJsonFile } from "@/lib/downloadJsonFile";
import { getTodayString } from "@/lib/storage/core";

/**
 * 組み立てたデータを、選択したグループ名と日付のファイル名で書き出す。
 *
 * 「何を書き出すか」とは変わる理由が別なので分けてある。ここが持つのは
 * ファイル名の組み立てだけ。
 */
export const downloadExportData = (options: TransferOptions, data: object) => {
  const date = getTodayString();
  const types = Object.entries(options)
    .filter(([, value]) => value)
    .map(([key]) => key)
    .join("-");
  downloadJsonFile(`daily-routine-${types}-${date}.json`, data);
};
