"use client";

import { useEffect, useState } from "react";
import { formatDuration } from "@/lib/storage";
import texts from "./locales/ja.json";
import { getProgressLabel } from "./helpers";

interface ProgressBarProps {
  completedMinutes: number;
  totalMinutes: number;
  progressPercentage: number;
}

interface ProgressBarDisplayProps {
  progressPercentage: number;
  completedMinutes: number;
  totalMinutes: number;
}

const ProgressBarDisplay = ({
  progressPercentage,
  completedMinutes,
  totalMinutes,
}: ProgressBarDisplayProps) => {
  return (
    <div className="bg-linear-to-r from-blue-500 to-indigo-500 rounded-lg p-4 text-white">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{texts.progressBar.title}</span>
        <span className="text-2xl font-bold">
          {getProgressLabel(progressPercentage)}
        </span>
      </div>
      <div className="mt-2 bg-white/20 rounded-full h-2 overflow-hidden">
        <div
          className="bg-white h-full transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <div className="mt-2 text-xs text-white/80 text-right">
        {formatDuration(completedMinutes)} / {formatDuration(totalMinutes)}
      </div>
    </div>
  );
};

/**
 * 今日のルーティン進捗を表示するプログレスバーコンポーネント
 * 完了率、完了時間/総時間をビジュアルに表示する。マウント時のアニメーション付き
 * @param {Object} props - コンポーネントのprops
 * @param {number} props.completedMinutes - 完了したルーティンの合計時間（分）
 * @param {number} props.totalMinutes - 今日のルーティンの合計時間（分）
 * @param {number} props.progressPercentage - 進捗率（0-100）
 * @returns {JSX.Element}
 */
const ProgressBar = ({
  completedMinutes,
  totalMinutes,
  progressPercentage,
}: ProgressBarProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ProgressBarDisplay
      progressPercentage={mounted ? progressPercentage : 0}
      completedMinutes={mounted ? completedMinutes : 0}
      totalMinutes={mounted ? totalMinutes : 0}
    />
  );
};

export default ProgressBar;
