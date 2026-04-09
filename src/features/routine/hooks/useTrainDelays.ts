import { useState } from "react";
import { type TrainDelayInfo } from "@/types/routine";
import { getSettings } from "@/features/settings/storage";

/** 電車遅延情報の取得（モックデータ） */
export const useTrainDelays = () => {
  const [trainDelays] = useState<TrainDelayInfo[]>(() => {
    const settings = getSettings();
    if (
      !settings.trainDelay?.enabled ||
      !settings.trainDelay.monitoredLines.length
    ) {
      return [];
    }
    const mockDelays: TrainDelayInfo[] = [];
    const now = new Date().toISOString();
    settings.trainDelay.monitoredLines.forEach((line) => {
      if (Math.random() < 0.3) {
        mockDelays.push({
          lineId: line.lineId,
          lineName: line.lineName,
          company: line.company,
          delayMinutes: Math.floor(Math.random() * 40) + 5,
          reason: ["人身事故", "信号トラブル", "車両点検", "混雑"][
            Math.floor(Math.random() * 4)
          ],
          section: "全線",
          lastUpdated: now,
        });
      }
    });
    return mockDelays;
  });

  return trainDelays;
};
