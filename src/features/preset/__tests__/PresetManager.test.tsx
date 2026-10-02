import { render, screen } from "@testing-library/react";
import { PresetManager } from "../PresetManager";
import { usePresetManagerState } from "../usePresetManagerState";
import { PRESET_MANAGER_TEXT } from "../presetManagerPresentation";

jest.mock("../usePresetManagerState");

const mockUsePresetManagerState = usePresetManagerState as jest.MockedFunction<
  typeof usePresetManagerState
>;

describe("PresetManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePresetManagerState.mockReturnValue({
      presets: [],
      selectedPresetId: null,
      selectedDays: new Set<number>(),
      isCreating: false,
      newPresetName: "",
      newPresetDescription: "",
      sourceDay: 0,
      editingPresetId: null,
      editPresetName: "",
      editPresetDescription: "",
      editSourceDay: 0,
      setIsCreating: jest.fn(),
      setSelectedPresetId: jest.fn(),
      setNewPresetName: jest.fn(),
      setNewPresetDescription: jest.fn(),
      setSourceDay: jest.fn(),
      setEditPresetName: jest.fn(),
      setEditPresetDescription: jest.fn(),
      setEditSourceDay: jest.fn(),
      toggleDaySelection: jest.fn(),
      handleCreatePreset: jest.fn(),
      handleDeletePreset: jest.fn(),
      handleApplyPreset: jest.fn(),
      handleDuplicatePreset: jest.fn(),
      handleStartEdit: jest.fn(),
      handleCancelEdit: jest.fn(),
      handleSaveEdit: jest.fn(),
    });
  });

  it("タイトルと説明文をレンダリングする", () => {
    render(
      <PresetManager
        currentRoutines={[]}
        onApplyPreset={jest.fn()}
      />,
    );

    expect(screen.getByText(PRESET_MANAGER_TEXT.title)).toBeInTheDocument();
    expect(
      screen.getByText(PRESET_MANAGER_TEXT.description),
    ).toBeInTheDocument();
  });
});
