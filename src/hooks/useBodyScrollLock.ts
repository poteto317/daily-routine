import { useEffect } from "react";

/**
 * isLocked の間、body のスクロールを止める（メニューやモーダルを開いている間の背面スクロール防止）。
 * ロック解除時とアンマウント時は overflow を空に戻す。
 */
export const useBodyScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    document.body.style.overflow = isLocked ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isLocked]);
};
