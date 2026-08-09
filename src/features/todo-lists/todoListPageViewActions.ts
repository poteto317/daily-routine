import { normalizeTitle } from "./todoListTitleNormalization";

export const addTodoItemFromDetailInput = (params: {
  inputText: string;
  listId: string;
  onAddItem: (listId: string, title: string) => void;
  clearInput: () => void;
  /**
   * 追加成功時に入力欄からフォーカスを外す。
   * ソフトウェアキーボードはテキスト入力にフォーカスがあるときだけ表示される
   * ため、これによりモバイルではキーボードが閉じる。
   * バリデーション失敗時は呼ばれない（何も追加されていないのにキーボードが
   * 閉じるとユーザーが再入力しづらくなるため）。
   */
  blurInput: () => void;
}): boolean => {
  const { inputText, listId, onAddItem, clearInput, blurInput } = params;
  const normalized = normalizeTitle(inputText);

  if (!normalized) {
    return false;
  }

  onAddItem(listId, normalized);
  clearInput();
  blurInput();
  return true;
};
