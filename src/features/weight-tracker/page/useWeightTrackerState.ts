import { getTodayWeightRecord } from "../storage";
import { createWeightPageActionBindings } from "./weightPageActionBindings";
import { createWeightTrackerStateResult } from "./weightTrackerStateResult";
import { useWeightTrackerActions } from "./useWeightTrackerActions";
import { useWeightTrackerFormState } from "./useWeightTrackerFormState";
import { useWeightTrackerDataState } from "./useWeightTrackerDataState";

export const useWeightTrackerState = () => {
  const {
    initialTodayRecord,
    recentRecords,
    setRecentRecords,
    setTodayRecord,
    today,
    todayRecord,
  } = useWeightTrackerDataState();
  const {
    notesInput,
    showForm,
    weightInput,
    handleCancelForm,
    setNotesInput,
    setShowForm,
    setWeightInput,
  } = useWeightTrackerFormState({
    initialTodayRecord,
    getTodayWeightRecord,
  });
  const { handleDeleteRecord, handleSaveWeight } = useWeightTrackerActions(
    createWeightPageActionBindings({
      weightInput,
      notesInput,
      setTodayRecord,
      setWeightInput,
      setNotesInput,
      setShowForm,
      setRecentRecords,
    }),
  );

  return createWeightTrackerStateResult({
    today,
    todayRecord,
    weightInput,
    notesInput,
    showForm,
    recentRecords,
    setWeightInput,
    setNotesInput,
    setShowForm,
    handleSaveWeight,
    handleCancelForm,
    handleDeleteRecord,
  });
};
