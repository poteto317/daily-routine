import {
  PRESET_FIELD_DESCRIPTION_LABEL,
  PRESET_FIELD_NAME_LABEL,
} from "../helpers";

type PresetNameDescriptionFieldsProps = {
  name: string;
  description: string;
  namePlaceholder: string;
  descriptionPlaceholder: string;
  onChangeName: (name: string) => void;
  onChangeDescription: (description: string) => void;
};

const FIELD_CLASS_NAME =
  "w-full p-2 border rounded-lg dark:bg-gray-600 dark:text-white dark:border-gray-500";

/**
 * プリセットの名前と説明の入力欄。作成画面と編集画面で共有する。
 *
 * placeholder は入力が始まると消えるため、支援技術向けの名前は
 * aria-label で別に与える。文言は画面によらず同じものを使う。
 */
export const PresetNameDescriptionFields = ({
  name,
  description,
  namePlaceholder,
  descriptionPlaceholder,
  onChangeName,
  onChangeDescription,
}: PresetNameDescriptionFieldsProps) => (
  <>
    <input
      type="text"
      value={name}
      onChange={(event) => onChangeName(event.target.value)}
      className={FIELD_CLASS_NAME}
      placeholder={namePlaceholder}
      aria-label={PRESET_FIELD_NAME_LABEL}
    />
    <textarea
      value={description}
      onChange={(event) => onChangeDescription(event.target.value)}
      className={FIELD_CLASS_NAME}
      placeholder={descriptionPlaceholder}
      rows={2}
      aria-label={PRESET_FIELD_DESCRIPTION_LABEL}
    />
  </>
);
