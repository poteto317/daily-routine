import { useEffect, useRef } from "react";
import { isImeComposingNativeKeyDown } from "@/lib/isImeComposingKeyDown";

type Options = {
  /** true の間だけ Escape を監視する */
  isActive: boolean;
  /** インライン関数を渡してよい（内部で ref を経由するため再購読は起きない） */
  onClose: () => void;
};

/**
 * Escape キーで onClose を呼ぶ。
 *
 * `role="dialog"` + `aria-modal="true"` を持つモーダルは、キーボード利用者が
 * Escape で閉じられることを期待するため、その挙動を満たすために使う。
 * ポインタ操作での外側クリック判定は含まない（それが必要な場合は
 * useCloseOnOutsideInteraction を使う）。
 *
 * 日本語入力では変換候補の取り消しにも Escape を使うため、IME 変換中は
 * 閉じない。これがないと、入力途中で変換を取り消そうとしただけで
 * モーダルごと閉じて入力内容が失われる。
 */
export const useCloseOnEscape = ({ isActive, onClose }: Options) => {
  // onClose を依存配列に入れると、呼び出し側がインライン関数を渡している場合に
  // 再レンダリングのたびにリスナーを張り直すことになる（DetailPanel は備考入力の
  // 1文字ごとに再レンダリングされる）。ref 経由で最新の onClose を参照し、
  // 購読は isActive の変化時だけに限定する。
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (isImeComposingNativeKeyDown(event)) return;

      onCloseRef.current();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isActive]);
};
