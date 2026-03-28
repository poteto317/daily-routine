import type { Dispatch, SetStateAction } from "react";
import type { WeightRecord } from "@/types/routine";
import { resetWeightFormInputs } from "./pageStateActions";

type WeightStateSetters = {
  setWeightInput: Dispatch<SetStateAction<string>>;
  setNotesInput: Dispatch<SetStateAction<string>>;
  setShowForm: Dispatch<SetStateAction<boolean>>;
};

type WeightStorageReaders = {
  getTodayWeightRecord: () => WeightRecord | null;
};

type CreateCancelHandlerArgs = Pick<
  WeightStateSetters,
  "setWeightInput" | "setNotesInput" | "setShowForm"
> &
  Pick<WeightStorageReaders, "getTodayWeightRecord">;

export const createCancelWeightFormHandler = ({
  getTodayWeightRecord,
  setWeightInput,
  setNotesInput,
  setShowForm,
}: CreateCancelHandlerArgs) => {
  return () => {
    const formState = resetWeightFormInputs(getTodayWeightRecord());
    setWeightInput(formState.weightInput);
    setNotesInput(formState.notesInput);
    setShowForm(false);
  };
};