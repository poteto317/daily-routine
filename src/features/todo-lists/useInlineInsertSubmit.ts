import { useRef } from "react";
import { normalizeTitle } from "./todoListTitleNormalization";

type UseInlineInsertSubmitParams = {
  inputText: string;
  onAddAction: () => void;
};

/**
 * インライン挿入フォームの送信処理を担うフック。
 *
 * 入力のバリデーションと、送信時にソフトウェアキーボードを閉じるための
 * blur 発火をまとめて引き受け、コンポーネント側は描画と配線に専念できるようにする。
 *
 * blur は onAddAction より先に呼ぶ。onAddAction の中でフォームがアンマウント
 * されるため、後に呼んでも入力欄が既に存在せずキーボードが閉じない。
 *
 * なお、blur の代わりに「追加」ボタンへフォーカスを移す案も検討したが、
 * 追加直後は入力が空になってボタンが disabled 化し、フォーム自体も
 * アンマウントされるため、実ブラウザではフォーカスを保持できなかった。
 *
 * 「空のタイトル」の判定は normalizeTitle に委譲し、リポジトリ内で判定方法が
 * 分岐しないようにする。
 */
export const useInlineInsertSubmit = ({
  inputText,
  onAddAction,
}: UseInlineInsertSubmitParams) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const canSubmit = normalizeTitle(inputText) !== null;

  const handleAdd = () => {
    if (!canSubmit) return;
    inputRef.current?.blur();
    onAddAction();
  };

  return {
    inputRef,
    canSubmit,
    handleAdd,
  };
};
