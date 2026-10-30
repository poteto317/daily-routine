import { BUG_REPORT_IMAGE_ACCEPT, MAX_BUG_REPORT_IMAGES } from "../constants";
import type { BugReportImageError } from "../imageSelection";
import texts from "../locales/ja.json";

type Props = {
  images: readonly File[];
  previews: readonly string[];
  errors: readonly BugReportImageError[];
  disabled: boolean;
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
};

const ERROR_TEXT_MAP: Record<BugReportImageError, string> = {
  unsupportedType: texts.validation.imageUnsupportedType,
  tooLarge: texts.validation.imageTooLarge,
  tooMany: texts.validation.imageTooMany,
};

/**
 * 不具合報告のスクリーンショット選択・サムネイル表示・エラー表示コンポーネント。
 */
export const BugReportImagePicker = ({
  images,
  previews,
  errors,
  disabled,
  onAdd,
  onRemove,
}: Props) => {
  const isInputDisabled = disabled || images.length >= MAX_BUG_REPORT_IMAGES;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = "";
    if (selected.length > 0) {
      onAdd(selected);
    }
  };

  return (
    <div className="space-y-2">
      <div>
        <label
          htmlFor="bug-images"
          className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-1"
        >
          {texts.form.imagesLabel}
        </label>
        <input
          id="bug-images"
          type="file"
          accept={BUG_REPORT_IMAGE_ACCEPT}
          multiple
          disabled={isInputDisabled}
          aria-describedby="bug-images-hint"
          onChange={handleChange}
          className="block w-full text-sm text-gray-700 dark:text-gray-800 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <p
          id="bug-images-hint"
          className="mt-1 text-xs text-gray-500 dark:text-gray-600"
        >
          {texts.form.imagesHint}
        </p>
      </div>

      {errors.length > 0 && (
        <ul
          role="alert"
          className="text-xs text-red-600 dark:text-red-700 space-y-0.5 list-disc list-inside"
        >
          {errors.map((err) => (
            <li key={err}>{ERROR_TEXT_MAP[err]}</li>
          ))}
        </ul>
      )}

      {images.length > 0 && (
        <ul className="grid grid-cols-3 gap-2">
          {images.map((_, index) => {
            const numberText = String(index + 1);
            const altText = texts.form.imageAlt.replace("{n}", numberText);
            const removeLabel = texts.form.imageRemove.replace(
              "{n}",
              numberText,
            );
            const previewUrl = previews[index] ?? "";

            return (
              <li
                key={`${previewUrl}-${index}`}
                className="relative rounded-lg border border-gray-300 dark:border-gray-400 overflow-hidden bg-gray-50 dark:bg-slate-100 h-24"
              >
                {previewUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={previewUrl}
                    alt={altText}
                    className="w-full h-full object-cover"
                  />
                ) : null}
                <button
                  type="button"
                  aria-label={removeLabel}
                  disabled={disabled}
                  onClick={() => onRemove(index)}
                  className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-xs hover:bg-black/85 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-white"
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
