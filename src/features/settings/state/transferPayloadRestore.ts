/** エクスポート・インポートで読み書きする JSON の中身 */
export type TransferPayload = Record<string, unknown>;

/**
 * payload の 1 項目。検証と保存を分けて持つ。
 *
 * 分けるのは、書き込む前に全項目を検証しきるため。書きながら検証すると、
 * 途中で形の誤りに当たったときに、それより前の項目だけが置き換わった
 * 中途半端な状態が残る。
 */
export type TransferField = {
  key: string;
  /** payload にこの項目の値が入っているか */
  hasValue: (payload: TransferPayload) => boolean;
  /** 形が期待どおりか確かめる。誤っていれば例外を投げる */
  validate: (payload: TransferPayload) => void;
  /** payload に値があれば保存する */
  restore: (payload: TransferPayload) => void;
};

/**
 * 取り込む対象かどうか。
 *
 * 旧バージョンで書き出したファイルには新しい項目のキーが存在しない。
 * 無い項目を既定値で上書きすると、手元のデータを消してしまう。
 *
 * truthy 判定を使わないのは、`false` や `0` や空文字といった正当な値を
 * 取りこぼさないため。「無い」は `undefined` と `null` だけを指す。
 */
const isPresent = (value: unknown): boolean =>
  value !== undefined && value !== null;

/** 形を問わずそのまま保存する項目 */
export const anyField = <T>(
  key: string,
  save: (value: T) => void,
): TransferField => ({
  key,
  hasValue: (payload) => isPresent(payload[key]),
  validate: () => {},
  restore: (payload) => {
    const value = payload[key];
    if (!isPresent(value)) return;
    save(value as T);
  },
});

/** 配列であることを確かめてから保存する項目 */
export const arrayField = <T>(
  key: string,
  save: (value: T[]) => void,
  errorMessage: string,
): TransferField => ({
  key,
  hasValue: (payload) => isPresent(payload[key]),
  validate: (payload) => {
    const value = payload[key];
    if (!isPresent(value)) return;
    if (!Array.isArray(value)) throw new Error(errorMessage);
  },
  restore: (payload) => {
    const value = payload[key];
    if (!isPresent(value)) return;
    save(value as T[]);
  },
});

/**
 * 配列でないオブジェクトであることを確かめてから保存する項目。
 *
 * 配列を弾くのは、月をキーにした履歴のような形を期待する項目に配列が入ると、
 * 壊れた形のまま保存されてしまうため。
 */
export const objectField = <T>(
  key: string,
  save: (value: T) => void,
  errorMessage: string,
): TransferField => ({
  key,
  hasValue: (payload) => isPresent(payload[key]),
  validate: (payload) => {
    const value = payload[key];
    if (!isPresent(value)) return;
    if (typeof value !== "object" || Array.isArray(value)) {
      throw new Error(errorMessage);
    }
  },
  restore: (payload) => {
    const value = payload[key];
    if (!isPresent(value)) return;
    save(value as T);
  },
});
