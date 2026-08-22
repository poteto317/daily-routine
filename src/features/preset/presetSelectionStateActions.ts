import { toggleSetSelection } from "./presetStateHelpers";

export const togglePresetSelection = <T>(current: Set<T>, value: T): Set<T> =>
  toggleSetSelection(current, value);

export { resolveCreateFilterSelection } from "./presetCreateFilterSelection";
