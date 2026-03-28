import { render } from "@testing-library/react";
import ProgressBar from "../ProgressBar";

type ProgressProps = {
  completedMinutes: number;
  totalMinutes: number;
  progressPercentage: number;
};

export const renderProgressBar = (props: ProgressProps) => {
  return render(<ProgressBar {...props} />);
};
