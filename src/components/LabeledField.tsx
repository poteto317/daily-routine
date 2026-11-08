"use client";

import { useId, type ReactNode } from "react";

type LabeledFieldProps = {
  label: string;
  /** 受け取った id を入力欄に付けること。ラベルとの紐付けに使う */
  children: (inputId: string) => ReactNode;
  labelClassName?: string;
  /** ラベルの右に置くバッジなど。アクセシブル名には含めない */
  labelAdornment?: ReactNode;
};

const DEFAULT_LABEL_CLASS_NAME =
  "block text-sm font-medium text-gray-700 dark:text-gray-700 mb-1";

/**
 * ラベル付きの入力欄。
 *
 * `<label>` と入力欄を id で結び付ける。見た目の上でラベルが付いていても
 * 紐付いていないと、読み上げでは名前の無い入力欄になり、ラベルをタップ
 * しても入力欄にフォーカスが移らない。
 *
 * id は描画ごとに一意なものを配るため、同じ画面に同じ項目が並んでも衝突しない。
 */
export const LabeledField = ({
  label,
  children,
  labelClassName,
  labelAdornment,
}: LabeledFieldProps) => {
  const inputId = useId();

  // 飾りは <label> の外に置く。中に入れるとバッジの文字まで
  // 入力欄の名前として読み上げられ、項目名が濁る
  const labelElement = (
    <label
      htmlFor={inputId}
      className={labelClassName ?? DEFAULT_LABEL_CLASS_NAME}
    >
      {label}
    </label>
  );

  return (
    <div>
      {labelAdornment ? (
        <div className="flex items-center gap-2 mb-1">
          {labelElement}
          {labelAdornment}
        </div>
      ) : (
        labelElement
      )}
      {children(inputId)}
    </div>
  );
};
