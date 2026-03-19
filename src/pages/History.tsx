import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from 'react-markdown';
import { History as HistoryIcon, Trash2, ChevronRight, Calendar, Clock, Brain, Shield, AlertCircle, CheckCircle2, Zap, Activity, Mic, Eye, Waves, Timer, BarChart3, Smile, User, LogIn, ArrowLeft } from "lucide-react";
import { useAnalysis } from "../context/AnalysisContext";
import { Background } from "../components/Background";
import { MetricGauge } from "../components/MetricGauge";
import Header from "../components/Header";
import { subscribeToUserSessions, deleteSession } from "../services/sessionService";

interface Session {
  id: string;
  timestamp: any;
  verdict: "truth" | "deception" | "insufficient_data";
  overallConfidence: number;
  recordingDuration: number;
  analysisResults: any;
  videoUrl?: string;
  title?: string;
}

export default function History() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setAnalysisResults, user, isAuthReady } = useAnalysis();
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      if (isAuthReady) setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = subscribeToUserSessions(user.uid, (data) => {
      setSessions(data as Session[]);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, isAuthReady]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteSession(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions", user?.uid] });
    },
  });

  const handleViewSession = (session: Session) => {
    if (expandedSessionId === session.id) {
      setExpandedSessionId(null);
    } else {
      setExpandedSessionId(session.id);
    }
  };

  const handleGoToResults = (session: Session) => {
    setAnalysisResults(session.analysisResults);
    navigate("/results");
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return { date: "N/A", time: "N/A" };
    
    const date = new Date(timestamp);
    
    return {
      date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (isAuthReady && !user) {
    return (
      <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500/30 relative">
        <Background />
        <Header />
        <div className="max-w-4xl mx-auto px-6 py-32 relative z-10 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-8">
            <LogIn className="w-10 h-10 text-zinc-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Sign in to view history</h1>
          <p className="text-zinc-400 max-w-md mb-8">
            Your analysis sessions are securely stored and linked to your account. Please sign in to access your history.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500/30 relative">
      <Background />
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-32 relative z-10">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate(-1)}
              className="p-3 rounded-2xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <HistoryIcon className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Analysis History</h1>
                <p className="text-zinc-500 text-sm">Review your previous detection sessions</p>
              </div>
            </div>
          </div>
          {sessions && sessions.length > 0 && (
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-zinc-400">
              {sessions.length} Sessions Saved
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-zinc-500 animate-pulse">Loading history...</p>
          </div>
        ) : error ? (
          <div className="p-8 rounded-3xl bg-red-500/5 border border-red-500/20 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load history</h3>
            <p className="text-zinc-400">There was an error connecting to the database.</p>
          </div>
        ) : sessions?.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white/5 border border-white/10 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
              <HistoryIcon className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No sessions found</h3>
            <p className="text-zinc-400 mb-8">You haven't performed any analyses yet.</p>
            <button 
              onClick={() => navigate("/analyze")}
              className="px-6 py-3 rounded-2xl bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition-all"
            >
              Start First Analysis
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions?.map((session, index) => {
              const { date, time } = formatDate(session.timestamp);
              const isTruth = session.verdict === "truth";
              const isExpanded = expandedSessionId === session.id;
              const fullResults = isExpanded ? session.analysisResults : null;
              
              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`group relative rounded-3xl bg-white/5 border transition-all overflow-hidden ${
                    isExpanded ? "border-emerald-500/50 ring-1 ring-emerald-500/20" : "border-white/10 hover:border-emerald-500/30"
                  }`}
                >
                  <div 
                    className="p-6 cursor-pointer"
                    onClick={() => handleViewSession(session)}
                  >
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                          isTruth 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                            : "bg-red-500/10 border-red-500/20 text-red-400"
                        }`}>
                          {isTruth ? <CheckCircle2 className="w-7 h-7" /> : <Shield className="w-7 h-7" />}
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-bold text-white mb-1">
                            {session.title || "Untitled Session"}
                          </h3>
                          <div className="flex items-center gap-3 mb-1">
                            <span className={`text-sm font-bold uppercase tracking-wider ${
                              isTruth ? "text-emerald-400" : "text-red-400"
                            }`}>
                              {session.verdict} detected
                            </span>
                            <span className="w-1 h-1 rounded-full bg-zinc-700" />
                            <span className="text-zinc-400 text-sm font-medium">
                              {session.overallConfidence}% Confidence
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-zinc-500 text-xs">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {date}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              {time}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-1 h-1 rounded-full bg-zinc-700" />
                              <span>{session.recordingDuration || 0}s</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <AnimatePresence mode="wait">
                            {deletingSessionId === session.id ? (
                              <motion.div
                                key="confirm"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex items-center gap-2"
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteMutation.mutate(session.id);
                                    setDeletingSessionId(null);
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-red-400 transition-colors"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeletingSessionId(null);
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-white/10 text-zinc-400 text-[10px] font-bold uppercase tracking-wider hover:bg-white/20 transition-colors"
                                >
                                  Cancel
                                </button>
                              </motion.div>
                            ) : (
                              <motion.button
                                key="delete"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingSessionId(session.id);
                                }}
                                className="p-3 rounded-xl bg-white/5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
                                title="Delete session"
                              >
                                <Trash2 className="w-5 h-5" />
                              </motion.button>
                            )}
                          </AnimatePresence>
                        </div>
                        <div className={`p-3 rounded-xl transition-all ${
                          isExpanded ? "bg-emerald-500 text-black rotate-90" : "bg-white/5 text-zinc-400 group-hover:bg-emerald-500 group-hover:text-black"
                        }`}>
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="border-t border-white/5 bg-white/[0.02]"
                      >
                        <div className="p-8 space-y-10">
                          {/* Facial Indicators */}
                          <div>
                            <div className="flex items-center gap-3 mb-6">
                              <div className="w-1 h-5 bg-emerald-500 rounded-full" />
                              <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400">Facial Indicators</h4>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                              {fullResults?.facialFeatures?.map((f: any, i: number) => (
                                <MetricGauge 
                                  key={i}
                                  label={f.feature} 
                                  value={f.value} 
                                  icon={
                                    f.feature.includes("Blink") ? Eye :
                                    f.feature.includes("Micro") ? Smile :
                                    f.feature.includes("Eye") ? Eye :
                                    f.feature.includes("Lip") ? User :
                                    f.feature.includes("Brow") ? User :
                                    f.feature.includes("Symmetry") ? Shield :
                                    Shield
                                  } 
                                  color="bg-emerald-500" 
                                  size="sm"
                                />
                              ))}
                            </div>
                          </div>

                          {/* Vocal Indicators */}
                          <div>
                            <div className="flex items-center gap-3 mb-6">
                              <div className="w-1 h-5 bg-blue-500 rounded-full" />
                              <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400">Vocal Indicators</h4>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                              {fullResults?.voiceFeatures?.map((f: any, i: number) => (
                                <MetricGauge 
                                  key={i}
                                  label={f.feature} 
                                  value={f.value} 
                                  icon={
                                    f.feature.includes("Pitch") ? Waves :
                                    f.feature.includes("Rate") ? Timer :
                                    f.feature.includes("Pause") ? Clock :
                                    f.feature.includes("Tremor") ? Activity :
                                    f.feature.includes("MFCC") ? BarChart3 :
                                    f.feature.includes("Jitter") ? Activity :
                                    Mic
                                  } 
                                  color="bg-blue-500" 
                                  size="sm"
                                />
                              ))}
                            </div>
                          </div>

                          <div className="p-6 rounded-2xl bg-white/5 border border-white/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                              <Brain className="w-24 h-24 text-emerald-500" />
                            </div>
                            <div className="flex items-center gap-2 mb-4 text-zinc-400">
                              <Brain className="w-4 h-4" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">AI Analysis Summary</span>
                            </div>
                            <div className="text-zinc-300 text-sm leading-relaxed italic relative z-10 markdown-body">
                              <ReactMarkdown>{session.analysisResults?.aiAnalysis || ""}</ReactMarkdown>
                            </div>
                            <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
                              {session.videoUrl && (
                                <a 
                                  href={session.videoUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors"
                                >
                                  Download Session Video
                                </a>
                              )}
                              <button
                                onClick={() => handleGoToResults(session)}
                                className="px-6 py-2.5 rounded-xl bg-white text-black font-bold text-[10px] uppercase tracking-wider hover:bg-zinc-200 transition-all flex items-center gap-2 ml-auto"
                              >
                                View Full Report <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
