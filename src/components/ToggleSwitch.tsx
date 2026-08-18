"use client";

type ToggleSwitchProps = {
  checked: boolean;
  /** スクリーンリーダーに読ませる名前 */
  label: string;
  onToggle: () => void;
  /** トグル本体の見た目 */
  className?: string;
  /** つまみの見た目 */
  thumbClassName?: string;
};

/**
 * オン・オフを切り替えるトグル。
 *
 * role と aria-checked と名前の 3 点セットを引き受ける。これらは
 * どのトグルにも必要で、欠けるとスクリーンリーダーには「ボタン」としか
 * 読まれず、何のトグルか・今どちらなのかが分からなくなる。
 *
 * 見た目は呼び出し側が渡す。機能ごとに色もクラスの作り方も違い、そこまで
 * まとめると引数で分岐する部品になるため。
 */
export const ToggleSwitch = ({
  checked,
  label,
  onToggle,
  className,
  thumbClassName,
}: ToggleSwitchProps) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
      className={className}
    >
      <span className={thumbClassName} />
    </button>
  );
};
