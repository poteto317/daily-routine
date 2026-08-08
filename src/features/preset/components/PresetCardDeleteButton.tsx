import { PRESET_DELETE_LABEL } from "../helpers";

type Props = {
  onClick: () => void;
};

/** プリセットカードの削除ボタン */
export const PresetCardDeleteButton = ({ onClick }: Props) => (
  <button
    onClick={(event) => {
      event.stopPropagation();
      onClick();
    }}
    className="text-red-500 hover:text-red-700 p-2 text-sm whitespace-nowrap"
    aria-label="プリセットを削除"
  >
    {PRESET_DELETE_LABEL}
  </button>
);
