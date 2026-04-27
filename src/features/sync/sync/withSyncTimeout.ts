/**
 * 指定した非同期処理にタイムアウトを設定する。
 * タイムアウト時間内に完了しない場合、指定したメッセージで reject する。
 * settled フラグにより、タイムアウト後に元の処理が完了しても resolve/reject しない。
 * clearTimeout を呼ぶことでタイマーのリークを防ぐ。
 */
export const withSyncTimeout = <T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  timeoutMessage: string,
): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error(timeoutMessage));
      }
    }, timeoutMs);

    fn().then(
      (result) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(result);
        }
      },
      (error: unknown) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          reject(error);
        }
      },
    );
  });
