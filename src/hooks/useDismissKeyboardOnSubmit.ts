type UseDismissKeyboardOnSubmitParams = {
  /** 送信可能か。false のときは何もしない */
  canSubmit: boolean;
  onSubmit: () => void;
};

/**
 * いま入力中の欄からフォーカスを外し、モバイルのソフトウェアキーボードを閉じる。
 *
 * ソフトウェアキーボードはテキスト入力にフォーカスがあるときだけ表示されるため、
 * blur することで閉じる。フォームの多くは送信後にアンマウントされるが、
 * アンマウントでキーボードが閉じるかはブラウザ実装に依存するため、明示的に blur する。
 *
 * 特定の ref ではなく「フォーカス中のテキスト入力」を対象にするのは、
 * 入力欄が複数あるフォーム（例: 名前と金額）でどの欄から送信しても
 * キーボードが閉じるようにするため。ref を1つだけ受け取る形では、
 * その ref 以外の欄で Enter を押したときにキーボードが開いたまま残る。
 *
 * 対象をテキスト入力に限定しているので、ボタンのクリックで送信した場合に
 * ボタンのフォーカスを奪うことはない（その場合は入力欄から離れた時点で
 * すでにキーボードは閉じている）。
 *
 * blur は onSubmit より先に呼ぶ。onSubmit の中でフォームがアンマウントされると
 * 入力欄が存在しなくなり、後から blur しても効果がない。
 *
 * canSubmit が false のときは何もしない。何も作成されていないのにキーボードだけ
 * 閉じると、ユーザーが再入力しづらくなるため。作成ボタンは disabled で守られて
 * いても Enterキー経路には同じガードが無いことが多いので、ここで一律に防ぐ。
 *
 * なお、blur の代わりに送信ボタンへフォーカスを移す案も検討したが、送信直後は
 * 入力が空になってボタンが disabled 化し、フォーム自体もアンマウントされるため、
 * 実ブラウザではフォーカスを保持できなかった。
 *
 * この挙動は E2E では検証できない。フォームのアンマウント時にブラウザが発火する
 * blur イベントとフォーカス移動が、明示的な blur() と観測上区別できないため。
 * 検証はユニットテストと手動確認（docs/03-testing/test-matrix.md）で担う。
 */
export const useDismissKeyboardOnSubmit = ({
  canSubmit,
  onSubmit,
}: UseDismissKeyboardOnSubmitParams) => {
  const handleSubmit = () => {
    if (!canSubmit) return;

    const active = document.activeElement;
    if (
      active instanceof HTMLInputElement ||
      active instanceof HTMLTextAreaElement
    ) {
      active.blur();
    }

    onSubmit();
  };

  return { handleSubmit };
};
