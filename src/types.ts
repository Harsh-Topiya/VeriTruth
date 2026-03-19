export interface AnalysisResults {
  verdict: "truth" | "deception" | "insufficient_data";
  status?: "complete" | "incomplete";
  missingFeature?: "visual" | "voice" | "both";
  overallConfidence: number;
  facialScore: number;
  voiceScore: number;
  fusionScore: number;
  facialConfidence: number;
  speechClarity: number;
  eyeContact: number;
  facialFeatures: {
    feature: string;
    value: number;
    fullMark: number;
    details?: string;
  }[];
  voiceFeatures: {
    feature: string;
    value: number;
    details?: string;
  }[];
  timelineData: {
    time: string;
    facial: number;
    voice: number;
    combined: number;
  }[];
  recordingDuration: number;
  aiAnalysis?: string;
  title?: string;
}

export interface RecordingData {
  videoBlob: Blob | null;
  audioBlob: Blob | null;
}
