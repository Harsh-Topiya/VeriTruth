import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { History as HistoryIcon, Trash2, ChevronRight, Calendar, Clock, Brain, Shield, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAnalysis } from "../context/AnalysisContext";
import { Background } from "../components/Background";

interface Session {
  id: number;
  timestamp: string;
  verdict: "truth" | "deception";
  overallConfidence: number;
  facialScore: number;
  voiceScore: number;
  fusionScore: number;
  aiAnalysis: string;
  fullResults: string;
}

export default function History() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setAnalysisResults } = useAnalysis();

  const { data: sessions, isLoading, error } = useQuery<Session[]>({
    queryKey: ["sessions"],
    queryFn: async () => {
      const response = await fetch("/api/sessions");
      if (!response.ok) throw new Error("Failed to fetch history");
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/sessions/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete session");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });

  const handleViewSession = (session: Session) => {
    const fullResults = JSON.parse(session.fullResults);
    setAnalysisResults(fullResults);
    navigate("/results");
  };

  const formatDate = (dateStr: string) => {
    // SQLite CURRENT_TIMESTAMP is in UTC. Append 'Z' to ensure browser parses it as UTC.
    const date = new Date(dateStr.includes(' ') && !dateStr.includes('Z') ? dateStr.replace(' ', 'T') + 'Z' : dateStr);
    return {
      date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500/30 relative">
      <Background />
      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <HistoryIcon className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Analysis History</h1>
              <p className="text-zinc-500 text-sm">Review your previous detection sessions</p>
            </div>
          </div>
          <button 
            onClick={() => navigate("/")}
            className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-sm font-medium"
          >
            Back to Home
          </button>
        </header>

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
              
              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all cursor-pointer"
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
                            <span>{JSON.parse(session.fullResults).recordingDuration || 0}s</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Are you sure you want to delete this session?")) {
                            deleteMutation.mutate(session.id);
                          }
                        }}
                        className="p-3 rounded-xl bg-white/5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
                        title="Delete session"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <div className="p-3 rounded-xl bg-white/5 text-zinc-400 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
