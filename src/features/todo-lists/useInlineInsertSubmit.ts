import { useDismissKeyboardOnSubmit } from "@/hooks/useDismissKeyboardOnSubmit";
import { normalizeTitle } from "./todoListTitleNormalization";

type UseInlineInsertSubmitParams = {
  inputText: string;
  onAddAction: () => void;
};

/**
 * インライン挿入フォームの送信処理を担うフック。
 *
 * 「このフォームにとって有効なタイトルとは何か」の判定だけを受け持ち、
 * 送信時にソフトウェアキーボードを閉じる手続きは useDismissKeyboardOnSubmit に
 * 委譲する。判定は normalizeTitle に委ね、リポジトリ内で判定方法が分岐しない
 * ようにする。
 */
export const useInlineInsertSubmit = ({
  inputText,
  onAddAction,
}: UseInlineInsertSubmitParams) => {
  const canSubmit = normalizeTitle(inputText) !== null;

  const { handleSubmit } = useDismissKeyboardOnSubmit({
    canSubmit,
    onSubmit: onAddAction,
  });

  return {
    canSubmit,
    handleAdd: handleSubmit,
  };
};
