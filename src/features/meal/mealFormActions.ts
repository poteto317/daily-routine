import type { Dispatch, SetStateAction } from "react";
import { createCanceledMealFormState, createOpenedMealFormState } from "./mealViewStateActions";

type MealStateSetters = {
  setShowForm: Dispatch<SetStateAction<boolean>>;
  setDescriptionInput: Dispatch<SetStateAction<string>>;
  setNotesInput: Dispatch<SetStateAction<string>>;
};

export const createResetMealFormAction = ({
  setDescriptionInput,
  setNotesInput,
}: Pick<MealStateSetters, "setDescriptionInput" | "setNotesInput">) => {
  return () => {
    const resetState = createCanceledMealFormState();
    setDescriptionInput(resetState.descriptionInput);
    setNotesInput(resetState.notesInput);
  };
};

export const createCancelMealFormAction = ({
  setShowForm,
  setDescriptionInput,
  setNotesInput,
}: Pick<
  MealStateSetters,
  "setShowForm" | "setDescriptionInput" | "setNotesInput"
>) => {
  return () => {
    const nextState = createCanceledMealFormState();
    setShowForm(nextState.showForm);
    setDescriptionInput(nextState.descriptionInput);
    setNotesInput(nextState.notesInput);
  };
};

export const createOpenMealFormAction = ({
  setShowForm,
}: Pick<MealStateSetters, "setShowForm">) => {
  return () => {
    setShowForm(createOpenedMealFormState().showForm);
  };
};