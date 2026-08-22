import * as helpers from "../helpers";
import * as cardPresentation from "../routineCardPresentation";
import * as footerPresentation from "../routineFormFooterPresentation";
import * as headerPresentation from "../routineFormHeaderPresentation";
import * as itemPresentation from "../routineItemPresentation";

describe("routine component helpers compatibility exports", () => {
  it("責務別presentationの公開関数を既存経路から再exportする", () => {
    expect(helpers.getDurationLabel).toBe(cardPresentation.getDurationLabel);
    expect(helpers.getRoutineTitleClassName).toBe(
      cardPresentation.getRoutineTitleClassName,
    );
    expect(helpers.shouldUseSwipeOnlyRoutineItem).toBe(
      itemPresentation.shouldUseSwipeOnlyRoutineItem,
    );
    expect(helpers.getRoutineFormHeaderTitle).toBe(
      headerPresentation.getRoutineFormHeaderTitle,
    );
    expect(helpers.getRoutineFormSubmitLabel).toBe(
      footerPresentation.getRoutineFormSubmitLabel,
    );
  });
});
