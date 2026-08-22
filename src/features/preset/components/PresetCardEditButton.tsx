import { PRESET_EDIT_LABEL } from "../presetCardPresentation";

type Props = {
  onClick: () => void;
};

/** プリセットカードの編集ボタン */
export const PresetCardEditButton = ({ onClick }: Props) => (
  <button
    onClick={(event) => {
      event.stopPropagation();
      onClick();
    }}
    className="text-blue-400 hover:text-blue-600 p-2 text-sm whitespace-nowrap"
    aria-label="プリセットを編集"
  >
    {PRESET_EDIT_LABEL}
  </button>
);
