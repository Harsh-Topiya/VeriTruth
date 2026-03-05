import { createContext, useContext, useState, ReactNode } from "react";
import { AnalysisResults, RecordingData } from "../types";

interface AnalysisContextType {
  recordingData: RecordingData;
  setRecordingData: (data: RecordingData) => void;
  analysisResults: AnalysisResults | null;
  setAnalysisResults: (results: AnalysisResults | null) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const AnalysisProvider = ({ children }: { children: ReactNode }) => {
  const [recordingData, setRecordingData] = useState<RecordingData>({
    videoBlob: null,
    audioBlob: null,
  });
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  return (
    <AnalysisContext.Provider
      value={{
        recordingData,
        setRecordingData,
        analysisResults,
        setAnalysisResults,
        isAnalyzing,
        setIsAnalyzing,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error("useAnalysis must be used within an AnalysisProvider");
  }
  return context;
};
