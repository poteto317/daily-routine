import { VisibleFeaturesState } from "../state/featureVisibility";
import {
  FEATURE_VISIBILITY_ITEMS,
  getFeatureThumbClassName,
  getFeatureToggleClassName,
  getUpdatedVisibleFeatures,
} from "../helpers/featureVisibility";
import texts from "../locales/ja.json";

type Props = {
  visibleFeatures: VisibleFeaturesState;
  setVisibleFeatures: (value: VisibleFeaturesState) => void;
};

export const FeatureVisibilitySection = ({
  visibleFeatures,
  setVisibleFeatures,
}: Props) => {
  return (
    <div className="border-t dark:border-gray-600 pt-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-black mb-4">
        {texts.featureVisibility.title}
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        {texts.featureVisibility.description}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {FEATURE_VISIBILITY_ITEMS.map(({ key, label, icon }) => (
          <div
            key={key}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
          >
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {icon} {label}
            </span>
            <button
              type="button"
              onClick={() =>
                setVisibleFeatures(
                  getUpdatedVisibleFeatures(visibleFeatures, key),
                )
              }
              className={getFeatureToggleClassName(visibleFeatures[key])}
            >
              <span
                className={getFeatureThumbClassName(visibleFeatures[key])}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
