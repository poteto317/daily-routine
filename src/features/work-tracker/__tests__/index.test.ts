import * as workTrackerModule from "../index";

describe("work-tracker index exports", () => {
  it("WorkTrackerPage and storage functions are exported", () => {
    expect(workTrackerModule.WorkTrackerPage).toBeDefined();
    expect(workTrackerModule.getWorkTemplates).toBeDefined();
    expect(workTrackerModule.saveWorkTemplates).toBeDefined();
    expect(workTrackerModule.addWorkTemplate).toBeDefined();
    expect(workTrackerModule.updateWorkTemplate).toBeDefined();
    expect(workTrackerModule.updateWorkTemplateLastUsed).toBeDefined();
    expect(workTrackerModule.deleteWorkTemplate).toBeDefined();
    expect(workTrackerModule.getOrCreateWorkTemplate).toBeDefined();
    expect(workTrackerModule.getWorkSessionHistory).toBeDefined();
    expect(workTrackerModule.saveWorkSessionHistory).toBeDefined();
    expect(workTrackerModule.getTodayWorkSessions).toBeDefined();
    expect(workTrackerModule.addWorkSession).toBeDefined();
    expect(workTrackerModule.updateWorkSession).toBeDefined();
    expect(workTrackerModule.deleteWorkSession).toBeDefined();
    expect(workTrackerModule.getAllWorkSessions).toBeDefined();
    expect(workTrackerModule.getSessionsByTemplateId).toBeDefined();
    expect(workTrackerModule.getSessionsByWorkName).toBeDefined();
    expect(workTrackerModule.getTemplateStats).toBeDefined();
    expect(workTrackerModule.getWorkNameStats).toBeDefined();
  });
});
