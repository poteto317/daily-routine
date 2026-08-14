import { toJstDateKey } from "@/lib/storage/core";

/**
 * createdAt の UTC 日付。
 *
 * アプリの他の場所では日付キーを UTC で作らない。ここだけは「以前の壊れた
 * 作り方」を再現する必要があるため、意図的に UTC のまま残している。
 * `toJstDateKey` に置き換えると、ずれた記録を見分けられなくなり移行が
 * 何も動かなくなる。
 */
const toUtcDateKey = (date: Date): string => date.toISOString().split("T")[0];

/**
 * UTC 基準で保存されてしまった記録の、正しい JST 日付を返す。ずれていなければ null。
 *
 * 以前は日付キーを `new Date().toISOString()` から作っていたため、
 * 日本時間の 0〜9 時に作られた記録が前日として保存されている。
 *
 * 移す対象は「`date` が `createdAt` の UTC 日付と一致し、かつ JST 日付とは
 * 異なる」記録だけに絞る。夜に作られた記録は UTC 日付と JST 日付が同じなので
 * 対象にならず、日付を手で入れ替えた記録も `date` が一致しないため触らない。
 */
export const findShiftedDateKey = (
  date: string,
  createdAt: string | undefined,
): string | null => {
  if (!createdAt) return null;

  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return null;

  const utcKey = toUtcDateKey(created);
  const jstKey = toJstDateKey(created);
  if (utcKey === jstKey) return null;
  if (date !== utcKey) return null;

  return jstKey;
};
