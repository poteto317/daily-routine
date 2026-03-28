import { createRoutineQueriesResult } from "../routineQueriesResult";

describe("routineQueriesResult", () => {
  it("routine query hook の公開 shape を組み立てる", () => {
    const queries = {
      getTodayRoutines: jest.fn(),
      getRoutinesByDayOfWeek: jest.fn(),
      getHolidayRoutines: jest.fn(),
      getIsTodayHoliday: jest.fn(),
    };

    expect(createRoutineQueriesResult(queries)).toEqual(queries);
  });
});
