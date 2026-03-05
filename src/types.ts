export interface AnalysisResults {
  verdict: "truth" | "deception";
  overallConfidence: number;
  facialScore: number;
  voiceScore: number;
  fusionScore: number;
  facialFeatures: {
    feature: string;
    value: number;
    fullMark: number;
  }[];
  voiceFeatures: {
    feature: string;
    value: number;
  }[];
  timelineData: {
    time: string;
    facial: number;
    voice: number;
    combined: number;
  }[];
  recordingDuration: number;
  aiAnalysis?: string;
}

export interface RecordingData {
  videoBlob: Blob | null;
  audioBlob: Blob | null;
}
