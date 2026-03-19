import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { AnalysisResults, RecordingData } from "../types";

interface User {
  uid: string;
  email: string | null;
}

interface AnalysisContextType {
  recordingData: RecordingData;
  setRecordingData: (data: RecordingData) => void;
  analysisResults: AnalysisResults | null;
  setAnalysisResults: (results: AnalysisResults | null) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
  user: User | null;
  isAuthReady: boolean;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const AnalysisProvider = ({ children }: { children: ReactNode }) => {
  const [recordingData, setRecordingData] = useState<RecordingData>({
    videoBlob: null,
    audioBlob: null,
  });
  
  // Initialize from localStorage
  const [analysisResults, setAnalysisResultsState] = useState<AnalysisResults | null>(() => {
    const saved = localStorage.getItem("veritruth_latest_results");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved results", e);
        return null;
      }
    }
    return null;
  });

  const setAnalysisResults = (results: AnalysisResults | null) => {
    setAnalysisResultsState(results);
    if (results) {
      localStorage.setItem("veritruth_latest_results", JSON.stringify(results));
    } else {
      localStorage.removeItem("veritruth_latest_results");
    }
  };

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Mock user for local storage state
  const [user] = useState<User | null>({ uid: "local-user", email: "guest@example.com" });
  const [isAuthReady] = useState(true);

  return (
    <AnalysisContext.Provider
      value={{
        recordingData,
        setRecordingData,
        analysisResults,
        setAnalysisResults,
        isAnalyzing,
        setIsAnalyzing,
        user,
        isAuthReady,
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
