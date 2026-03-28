import type { WeightRecord } from "@/types/routine";
import {
  createWeightPageData,
  deleteWeightAndReload,
  resetWeightFormInputs,
  saveWeightAndReload,
} from "../page/pageStateActions";

describe("weight-tracker pageStateActions", () => {
  const olderRecord: WeightRecord = {
    id: "weight-1",
    date: "2024-01-11",
    weight: 70.2,
    notes: "before",
    createdAt: "2024-01-11T07:00:00.000Z",
    updatedAt: "2024-01-11T07:00:00.000Z",
  };

  const todayRecord: WeightRecord = {
    id: "weight-2",
    date: "2024-01-12",
    weight: 69.8,
    notes: "after",
    createdAt: "2024-01-12T07:00:00.000Z",
    updatedAt: "2024-01-12T07:00:00.000Z",
  };

  it("today record と recent records から page data を作る", () => {
    expect(
      createWeightPageData(todayRecord, {
        [olderRecord.date]: olderRecord,
        [todayRecord.date]: todayRecord,
      }),
    ).toEqual({
      todayRecord,
      recentRecords: [todayRecord, olderRecord],
    });
  });

  it("today record からフォーム初期値を作る", () => {
    expect(resetWeightFormInputs(todayRecord)).toEqual({
      weightInput: "69.8",
      notesInput: "after",
    });
  });

  it("メモがない today record なら notesInput を空にする", () => {
    expect(
      resetWeightFormInputs({
        ...todayRecord,
        notes: undefined,
      }),
    ).toEqual({
      weightInput: "69.8",
      notesInput: "",
    });
  });

  it("record がなければ空フォーム初期値を返す", () => {
    expect(resetWeightFormInputs(null)).toEqual({
      weightInput: "",
      notesInput: "",
    });
  });

  it("不正な体重なら保存せず alert する", () => {
    const alertFn = jest.fn();
    const saveWeight = jest.fn();

    expect(
      saveWeightAndReload({
        today: "2024-01-12",
        weightInput: "0",
        notesInput: "memo",
        alertMessage: "invalid",
        saveWeight,
        reloadData: jest.fn(),
        closeForm: jest.fn(),
        alertFn,
      }),
    ).toBe(false);

    expect(alertFn).toHaveBeenCalledWith("invalid");
    expect(saveWeight).not.toHaveBeenCalled();
  });

  it("alertFn未指定時は window.alert を使う", () => {
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

    expect(
      saveWeightAndReload({
        today: "2024-01-12",
        weightInput: "abc",
        notesInput: "memo",
        alertMessage: "invalid",
        saveWeight: jest.fn(),
        reloadData: jest.fn(),
        closeForm: jest.fn(),
      }),
    ).toBe(false);

    expect(alertSpy).toHaveBeenCalledWith("invalid");
    alertSpy.mockRestore();
  });

  it("有効な体重なら保存して再読込しフォームを閉じる", () => {
    const saveWeight = jest.fn();
    const reloadData = jest.fn();
    const closeForm = jest.fn();

    expect(
      saveWeightAndReload({
        today: "2024-01-12",
        weightInput: "69.8",
        notesInput: " memo ",
        alertMessage: "invalid",
        saveWeight,
        reloadData,
        closeForm,
      }),
    ).toBe(true);

    expect(saveWeight).toHaveBeenCalledWith("2024-01-12", 69.8, "memo");
    expect(reloadData).toHaveBeenCalled();
    expect(closeForm).toHaveBeenCalled();
  });

  it("メモが空なら undefined で保存する", () => {
    const saveWeight = jest.fn();

    expect(
      saveWeightAndReload({
        today: "2024-01-12",
        weightInput: "69.8",
        notesInput: "   ",
        alertMessage: "invalid",
        saveWeight,
        reloadData: jest.fn(),
        closeForm: jest.fn(),
      }),
    ).toBe(true);

    expect(saveWeight).toHaveBeenCalledWith("2024-01-12", 69.8, undefined);
  });

  it("削除確認が通ったときだけ削除して再読込する", () => {
    const deleteWeight = jest.fn();
    const reloadData = jest.fn();

    expect(
      deleteWeightAndReload({
        date: "2024-01-12",
        confirmMessage: "delete?",
        deleteWeight,
        reloadData,
        confirmFn: jest.fn(() => true),
      }),
    ).toBe(true);

    expect(deleteWeight).toHaveBeenCalledWith("2024-01-12");
    expect(reloadData).toHaveBeenCalled();
  });

  it("削除確認が拒否されたら何もしない", () => {
    const deleteWeight = jest.fn();
    const reloadData = jest.fn();

    expect(
      deleteWeightAndReload({
        date: "2024-01-12",
        confirmMessage: "delete?",
        deleteWeight,
        reloadData,
        confirmFn: jest.fn(() => false),
      }),
    ).toBe(false);

    expect(deleteWeight).not.toHaveBeenCalled();
    expect(reloadData).not.toHaveBeenCalled();
  });

  it("confirmFn未指定時は window.confirm を使う", () => {
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
    const deleteWeight = jest.fn();
    const reloadData = jest.fn();

    expect(
      deleteWeightAndReload({
        date: "2024-01-12",
        confirmMessage: "delete?",
        deleteWeight,
        reloadData,
      }),
    ).toBe(true);

    expect(confirmSpy).toHaveBeenCalledWith("delete?");
    expect(deleteWeight).toHaveBeenCalledWith("2024-01-12");
    confirmSpy.mockRestore();
  });
});
