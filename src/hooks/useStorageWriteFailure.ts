"use client";

import { useCallback, useEffect, useState } from "react";
import {
  STORAGE_WRITE_FAILED_EVENT,
  replayLastStorageWriteFailure,
  type StorageWriteFailureDetail,
} from "@/lib/storage/core";

/**
 * localStorage への書き込み失敗を購読する。
 *
 * dismiss で閉じたあとも、次に書き込みが失敗すればまた failure が入る。
 * 容量超過は解消されない限り書き込みのたびに起きるため、一度閉じたきり
 * 二度と出ない作りにすると、消え続けるデータにユーザーが気づけない。
 */
export const useStorageWriteFailure = () => {
  const [failure, setFailure] = useState<StorageWriteFailureDetail | null>(
    null,
  );

  useEffect(() => {
    const handleFailure = (event: CustomEvent<StorageWriteFailureDetail>) => {
      const { detail } = event;
      setFailure((current) => {
        // 同じ失敗が続く間は状態を据え置き、再描画を起こさない。
        // 再描画をきっかけに別の書き込みが失敗すると連鎖が始まるため。
        if (
          current &&
          current.key === detail.key &&
          current.reason === detail.reason
        ) {
          return current;
        }
        return detail;
      });
    };

    window.addEventListener(STORAGE_WRITE_FAILED_EVENT, handleFailure);

    // リスナーを張る前に起きた失敗を拾う。React は子の effect を親より先に
    // 実行するため、子のマウント処理で失敗するとイベントには間に合わない。
    // 再送という形にして、状態を更新する経路を handleFailure 1 本に保つ。
    replayLastStorageWriteFailure();

    return () => {
      window.removeEventListener(STORAGE_WRITE_FAILED_EVENT, handleFailure);
    };
  }, []);

  const dismiss = useCallback(() => setFailure(null), []);

  return { failure, dismiss };
};
