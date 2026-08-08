import { PRESET_DUPLICATE_LABEL } from "../helpers";

type Props = {
  onClick: () => void;
};

/** プリセットカードのコピーボタン */
export const PresetCardDuplicateButton = ({ onClick }: Props) => (
  <button
    onClick={(event) => {
      event.stopPropagation();
      onClick();
    }}
    className="text-gray-400 hover:text-gray-600 p-2 text-sm whitespace-nowrap"
    aria-label="プリセットをコピー"
  >
    {PRESET_DUPLICATE_LABEL}
  </button>
);
