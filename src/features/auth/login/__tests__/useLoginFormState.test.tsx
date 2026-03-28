import { renderHook } from "@testing-library/react";

jest.mock("../useLoginCredentialsState", () => ({
  useLoginCredentialsState: jest.fn(),
}));

jest.mock("../useLoginModeState", () => ({
  useLoginModeState: jest.fn(),
}));

jest.mock("../useLoginFieldActions", () => ({
  useLoginFieldActions: jest.fn(),
}));

import { useLoginCredentialsState } from "../useLoginCredentialsState";
import { useLoginFormState } from "../useLoginFormState";
import { useLoginFieldActions } from "../useLoginFieldActions";
import { useLoginModeState } from "../useLoginModeState";

describe("useLoginFormState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("credentials/mode/field action hook を compose する", () => {
    const credentials = {
      email: "",
      password: "",
      setEmail: jest.fn(),
      setPassword: jest.fn(),
    };
    const mode = {
      isSignUp: false,
      setIsSignUp: jest.fn(),
    };
    const actions = {
      handleEmailChange: jest.fn(),
      handlePasswordChange: jest.fn(),
    };
    (useLoginCredentialsState as jest.Mock).mockReturnValue(credentials);
    (useLoginModeState as jest.Mock).mockReturnValue(mode);
    (useLoginFieldActions as jest.Mock).mockReturnValue(actions);

    const { result } = renderHook(() => useLoginFormState());

    expect(useLoginCredentialsState).toHaveBeenCalledTimes(1);
    expect(useLoginModeState).toHaveBeenCalledTimes(1);
    expect(useLoginFieldActions).toHaveBeenCalledWith({
      setEmail: credentials.setEmail,
      setPassword: credentials.setPassword,
    });
    expect(result.current).toEqual({
      email: "",
      handleEmailChange: actions.handleEmailChange,
      handlePasswordChange: actions.handlePasswordChange,
      isSignUp: false,
      password: "",
      setIsSignUp: mode.setIsSignUp,
    });
  });
});
