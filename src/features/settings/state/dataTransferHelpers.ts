import { setLocalDataUpdatedAt, withSyncBatch } from "@/lib/storage/core";
import { type TransferOptions } from "./constants";
import {
  TRANSFER_GROUPS,
  type TransferGroup,
  type TransferPayload,
} from "./dataTransferGroups";

export type ImportPayload = TransferPayload;

/** エクスポートファイルの形式バージョン */
const EXPORT_FORMAT_VERSION = "3.0";

/** 選択されているグループだけを返す */
const selectedGroups = (options: TransferOptions): TransferGroup[] =>
  TRANSFER_GROUPS.filter((group) => options[group.key]);

export const createExportData = (options: TransferOptions) => {
  const data: TransferPayload = {
    exportDate: new Date().toISOString(),
    version: EXPORT_FORMAT_VERSION,
  };

  selectedGroups(options).forEach((group) => {
    Object.assign(data, group.collect());
  });

  return data;
};

export const getSelectedTypeLabels = (options: TransferOptions) =>
  selectedGroups(options).map((group) => group.label);

/**
 * 選択したグループだけをローカルへ書き戻す。
 *
 * ファイルに該当データが無いグループは飛ばす。旧バージョンで書き出した
 * ファイルには新しいグループのキーが存在せず、既定値で上書きすると
 * 手元のデータを消してしまうため。
 *
 * 書き込む前に全グループを検証しきる。書きながら検証すると、途中で形の
 * 誤りに当たったときに、それより前のグループだけが置き換わった中途半端な
 * 状態が残る。ユーザーには「インポート失敗」と出るのに手元のデータは
 * 変わっており、どこまで反映されたか分からなくなる。
 *
 * 保存はバッチにまとめる。まとめないと保存のたびに更新時刻が書かれ、
 * そのたびに購読側がストレージを読み直す。全グループを取り込むと
 * 保存は 19 件あり、更新時刻の書き込みも同じ回数になる。
 * クラウド同期の saveSyncDataToLocal と同じ扱いにする。
 *
 * バッチを抜けたあとに更新時刻を進める。進めないと、クラウド同期が
 * ローカルを「古いまま」と判断して取り込んだ内容を上書きしてしまう。
 *
 * 逆に、取り込む対象が 1 つも無いときは更新時刻を進めない。旧バージョンの
 * ファイルには新しいグループのデータが入っておらず、何も書き換えていないのに
 * 進めると、クラウド同期がローカルを「新しい」と誤認して他端末の新しい
 * データを上書きしてしまう。
 */
export const importSelectedData = (
  data: ImportPayload,
  options: TransferOptions,
) => {
  const groups = selectedGroups(options).filter((group) => group.hasData(data));
  if (groups.length === 0) return;

  groups.forEach((group) => {
    group.validate(data);
  });

  withSyncBatch(() => {
    groups.forEach((group) => {
      group.restore(data);
    });
  });

  setLocalDataUpdatedAt(Date.now());
};
