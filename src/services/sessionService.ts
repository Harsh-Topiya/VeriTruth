import { AnalysisResults } from "../types";

export interface SessionData {
  id: string;
  userId: string;
  createdAt: string;
  timestamp: string;
  verdict: "truth" | "deception";
  overallConfidence: number;
  recordingDuration: number;
  analysisResults: AnalysisResults;
  videoUrl?: string;
}

const STORAGE_KEY = "truth_lens_sessions";
const SESSION_UPDATE_EVENT = "truth_lens_session_update";

const notifyUpdate = () => {
  window.dispatchEvent(new Event(SESSION_UPDATE_EVENT));
};

export const saveSession = async (
  results: AnalysisResults, 
  videoBlob?: Blob | null
) => {
  const sessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  
  const sessionId = Math.random().toString(36).substring(2, 15);
  
  const sessionData = {
    id: sessionId,
    userId: "local-user",
    createdAt: new Date().toISOString(),
    timestamp: new Date().toISOString(),
    verdict: results.verdict,
    overallConfidence: results.overallConfidence,
    recordingDuration: results.recordingDuration || 0,
    analysisResults: results,
  };

  sessions.unshift(sessionData);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  notifyUpdate();

  return sessionId;
};

export const subscribeToUserSessions = (
  userId: string, 
  callback: (sessions: any[]) => void
) => {
  const loadSessions = () => {
    const sessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    callback(sessions);
  };

  loadSessions();
  
  window.addEventListener('storage', loadSessions);
  window.addEventListener(SESSION_UPDATE_EVENT, loadSessions);
  
  return () => {
    window.removeEventListener('storage', loadSessions);
    window.removeEventListener(SESSION_UPDATE_EVENT, loadSessions);
  };
};

export const getUserSessions = async (userId?: string) => {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
};

export const getSessionById = async (sessionId: string) => {
  const sessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  return sessions.find((s: any) => s.id === sessionId) || null;
};

export const deleteSession = async (sessionId: string) => {
  const sessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  const filtered = sessions.filter((s: any) => s.id !== sessionId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  notifyUpdate();
};
