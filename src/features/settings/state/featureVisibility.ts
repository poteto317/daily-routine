import { getSettings } from "@/features/settings/storage";

export type VisibleFeaturesState = {
  journal: boolean;
  calendar: boolean;
  statistics: boolean;
  pomodoro: boolean;
  worktracker: boolean;
  weightTracker: boolean;
  workoutTracker: boolean;
  meal: boolean;
  budget: boolean;
  weather: boolean;
  preset: boolean;
  todoLists: boolean;
  syncManagement: boolean;
  testMatrix: boolean;
  accountAdmin: boolean;
};

export const getInitialVisibleFeatures = (): VisibleFeaturesState => {
  const settings = getSettings();
  return {
    journal: settings.visibleFeatures?.journal ?? true,
    calendar: settings.visibleFeatures?.calendar ?? true,
    statistics: settings.visibleFeatures?.statistics ?? true,
    pomodoro: settings.visibleFeatures?.pomodoro ?? true,
    worktracker: settings.visibleFeatures?.worktracker ?? true,
    weightTracker: settings.visibleFeatures?.weightTracker ?? true,
    workoutTracker: settings.visibleFeatures?.workoutTracker ?? true,
    meal: settings.visibleFeatures?.meal ?? true,
    budget: settings.visibleFeatures?.budget ?? true,
    weather: settings.visibleFeatures?.weather ?? true,
    preset: settings.visibleFeatures?.preset ?? true,
    todoLists: settings.visibleFeatures?.todoLists ?? true,
    syncManagement: settings.visibleFeatures?.syncManagement ?? true,
    testMatrix: settings.visibleFeatures?.testMatrix ?? true,
    accountAdmin: settings.visibleFeatures?.accountAdmin ?? true,
  };
};
