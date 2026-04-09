import { VISIBLE_FEATURE_ITEMS } from "../state/constants";
import type { VisibleFeaturesState } from "../state/featureVisibility";

export const FEATURE_VISIBILITY_ITEMS = VISIBLE_FEATURE_ITEMS;

export const getUpdatedVisibleFeatures = (
  visibleFeatures: VisibleFeaturesState,
  key: keyof VisibleFeaturesState,
): VisibleFeaturesState => {
  return {
    ...visibleFeatures,
    [key]: !visibleFeatures[key],
  };
};

export const getFeatureToggleClassName = (enabled: boolean): string => {
  return `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
    enabled ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
  }`;
};

export const getFeatureThumbClassName = (enabled: boolean): string => {
  return `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
    enabled ? "translate-x-6" : "translate-x-1"
  }`;
};
