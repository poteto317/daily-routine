"use client";

import { useId, type ReactNode } from "react";

type FieldGroupProps = {
  label: string;
  children: ReactNode;
  labelClassName?: string;
  groupClassName?: string;
};

const DEFAULT_LABEL_CLASS_NAME =
  "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2";

/**
 * 見出し付きのボタン群。曜日やカテゴリのように、入力欄ではなく選択肢が
 * 並ぶ場所で使う。
 *
 * 見出しは `<label>` にしない。label は入力欄を指すための要素で、指す先が
 * 無いまま置くと紐付いていない label が増えるだけになる。代わりに
 * `role="group"` から `aria-labelledby` で見出しを指し、文言は 1 か所に置く。
 * `aria-label` と見出しの両方に同じ文言を置くと、読み上げで同じ語が続く。
 */
export const FieldGroup = ({
  label,
  children,
  labelClassName,
  groupClassName,
}: FieldGroupProps) => {
  const labelId = useId();

  return (
    <div>
      <p id={labelId} className={labelClassName ?? DEFAULT_LABEL_CLASS_NAME}>
        {label}
      </p>
      <div role="group" aria-labelledby={labelId} className={groupClassName}>
        {children}
      </div>
    </div>
  );
};
