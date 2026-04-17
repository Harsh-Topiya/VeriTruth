import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from 'react-markdown';
import { History as HistoryIcon, Trash2, ChevronRight, Calendar, Clock, Brain, Shield, AlertCircle, CheckCircle2, Zap, Activity, Mic, Eye, Waves, Timer, BarChart3, Smile, User, LogIn, ArrowLeft, Filter, ArrowUpDown, CheckSquare, Square, X, Search } from "lucide-react";
import { useAnalysis } from "../context/AnalysisContext";
import { Background } from "../components/Background";
import { MetricGauge } from "../components/MetricGauge";
import Header from "../components/Header";
import { subscribeToUserSessions, deleteSession, deleteSessions } from "../services/sessionService";

interface Session {
  id: string;
  timestamp: any;
  verdict: "truth" | "deception" | "mixed_indicators";
  overallConfidence: number;
  recordingDuration: number;
  analysisResults: any;
  videoUrl?: string;
  title?: string;
}

type SortOption = "date" | "verdict" | "confidence";
type FilterOption = "all" | "truth" | "deception" | "mixed_indicators";

export default function History() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setAnalysisResults, user, isAuthReady } = useAnalysis();
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  
  // Filter & Sort State
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isConfirmingBulkDelete, setIsConfirmingBulkDelete] = useState(false);

  useEffect(() => {
    if (selectedIds.size === 0) {
      setIsConfirmingBulkDelete(false);
    }
  }, [selectedIds.size]);

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

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      setIsBulkDeleting(true);
      await deleteSessions(ids);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions", user?.uid] });
      setSelectedIds(new Set());
      setIsBulkDeleting(false);
    },
    onError: () => {
      setIsBulkDeleting(false);
    }
  });

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredSessions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredSessions.map(s => s.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    setIsConfirmingBulkDelete(true);
  };

  const confirmBulkDelete = () => {
    bulkDeleteMutation.mutate(Array.from(selectedIds));
    setIsConfirmingBulkDelete(false);
  };

  const getEffectiveVerdict = (session: Session) => {
    const isMixedIndicators = session.verdict === "mixed_indicators";
    const showSingleVerdict = !session.analysisResults?.segments || session.analysisResults.segments.length <= 1 || 
      session.analysisResults.segments.every((s: any) => s.verdict === session.analysisResults.segments[0].verdict);
    const isMixedFromSegments = !isMixedIndicators && !showSingleVerdict;
    
    return (isMixedIndicators || isMixedFromSegments) ? "mixed_indicators" : session.verdict;
  };

  const filteredSessions = sessions
    .filter(session => {
      const effectiveVerdict = getEffectiveVerdict(session);
      const matchesFilter = filterBy === "all" || effectiveVerdict === filterBy;
      const matchesSearch = !searchQuery || 
        (session.title || "Untitled Session").toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === "date") {
        const timeA = a.timestamp?.seconds || new Date(a.timestamp).getTime() || 0;
        const timeB = b.timestamp?.seconds || new Date(b.timestamp).getTime() || 0;
        comparison = timeA - timeB;
      } else if (sortBy === "verdict") {
        const verdictA = getEffectiveVerdict(a);
        const verdictB = getEffectiveVerdict(b);
        comparison = verdictA.localeCompare(verdictB);
      } else if (sortBy === "confidence") {
        comparison = a.overallConfidence - b.overallConfidence;
      }
      return sortOrder === "desc" ? -comparison : comparison;
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
        <div className="flex items-center justify-between mb-8">
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
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                <span className="text-emerald-500 mr-1">{sessions.length}</span> Sessions Saved
              </div>
            </div>
          )}
        </div>

        {/* Filter & Sort Bar */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[240px] relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="text"
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl py-3 pl-11 pr-10 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 transition-all placeholder:text-zinc-600"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-3 h-3 text-zinc-500" />
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-1">
              {(["all", "truth", "deception", "mixed_indicators"] as FilterOption[]).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setFilterBy(opt)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all relative ${
                    filterBy === opt 
                      ? "text-black" 
                      : "text-zinc-500 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {filterBy === opt && (
                    <motion.div 
                      layoutId="activeFilter"
                      className="absolute inset-0 bg-emerald-500 rounded-xl -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  {opt.replace("_", " ")}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className={`flex items-center gap-3 bg-white/5 backdrop-blur-md border rounded-2xl py-3 pl-10 pr-10 text-sm focus:outline-none transition-all hover:bg-white/10 cursor-pointer min-w-[140px] text-left ${
                    isSortDropdownOpen ? "border-emerald-500/50 ring-2 ring-emerald-500/10" : "border-white/10"
                  }`}
                >
                  <Filter className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isSortDropdownOpen ? "text-emerald-500" : "text-zinc-500"}`} />
                  <span className={`capitalize ${isSortDropdownOpen ? "text-white" : "text-zinc-400"}`}>{sortBy}</span>
                  <ChevronRight className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 transition-transform ${isSortDropdownOpen ? "-rotate-90 text-emerald-500" : "rotate-90"}`} />
                </button>

                <AnimatePresence>
                  {isSortDropdownOpen && (
                    <>
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsSortDropdownOpen(false)} 
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full mt-2 right-0 w-48 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-1.5"
                      >
                        {(["date", "verdict", "confidence"] as SortOption[]).map((opt) => (
                          <button
                            key={opt}
                            onClick={() => {
                              setSortBy(opt);
                              setIsSortDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                              sortBy === opt 
                                ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" 
                                : "text-zinc-400 hover:text-white hover:bg-white/5"
                            }`}
                          >
                            <span className="capitalize">{opt}</span>
                            {sortBy === opt && <CheckCircle2 className="w-4 h-4 ml-auto" />}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className={`p-3 rounded-2xl bg-white/5 backdrop-blur-md border transition-all ${
                  sortOrder === "asc" ? "border-white/10 text-zinc-400 hover:text-white hover:bg-white/10" : "border-emerald-500/30 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10"
                }`}
                title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
              >
                <ArrowUpDown className={`w-5 h-5 transition-transform duration-500 ${sortOrder === "asc" ? "" : "rotate-180"}`} />
              </button>
            </div>
          </div>

          {/* Selection & Bulk Actions */}
          <AnimatePresence>
            {selectedIds.size > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 shadow-xl shadow-emerald-500/5"
              >
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handleSelectAll}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    {selectedIds.size === filteredSessions.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    {selectedIds.size === filteredSessions.length ? "Deselect All" : "Select All"}
                  </button>
                  <div className="w-px h-4 bg-emerald-500/20" />
                  <span className="text-xs font-bold text-emerald-400/80 uppercase tracking-tight">
                    {selectedIds.size} sessions selected
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {isConfirmingBulkDelete ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-red-400 mr-2">Are you sure?</span>
                      <button
                        onClick={confirmBulkDelete}
                        disabled={isBulkDeleting}
                        className="px-4 py-2 rounded-xl bg-red-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-red-400 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-red-500/20"
                      >
                        {isBulkDeleting ? (
                          <Activity className="w-3 h-3 animate-spin" />
                        ) : (
                          "Confirm"
                        )}
                      </button>
                      <button
                        onClick={() => setIsConfirmingBulkDelete(false)}
                        className="px-4 py-2 rounded-xl bg-white/10 text-zinc-400 text-[10px] font-bold uppercase tracking-widest hover:bg-white/20 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setSelectedIds(new Set())}
                        className="px-4 py-2 rounded-xl hover:bg-white/5 text-[10px] font-bold uppercase tracking-widest text-zinc-400 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        disabled={isBulkDeleting}
                        className="px-6 py-2.5 rounded-xl bg-red-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-red-400 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-red-500/20"
                      >
                        {isBulkDeleting ? (
                          <Activity className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                        Delete Selected
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
            {filteredSessions?.map((session, index) => {
              const { date, time } = formatDate(session.timestamp);
              const effectiveVerdict = getEffectiveVerdict(session);
              const isTruth = effectiveVerdict === "truth";
              const isMixed = effectiveVerdict === "mixed_indicators";
              
              const isExpanded = expandedSessionId === session.id;
              const isSelected = selectedIds.has(session.id);
              const fullResults = isExpanded ? session.analysisResults : null;
              
              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`group relative rounded-3xl bg-white/5 border transition-all overflow-hidden ${
                    isExpanded ? "border-emerald-500/50 ring-1 ring-emerald-500/20" : 
                    isSelected ? "border-emerald-500/30 bg-emerald-500/[0.02]" : "border-white/10 hover:border-emerald-500/30"
                  }`}
                >
                  <div 
                    className="p-6 cursor-pointer flex items-center gap-4"
                    onClick={() => handleViewSession(session)}
                  >
                    {/* Selection Checkbox */}
                    <button
                      onClick={(e) => handleToggleSelect(session.id, e)}
                      className={`w-6 h-6 rounded-lg border transition-all flex items-center justify-center ${
                        isSelected 
                          ? "bg-emerald-500 border-emerald-500 text-black" 
                          : "bg-white/5 border-white/10 text-transparent group-hover:border-emerald-500/50"
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>

                    <div className="flex-1 flex items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                          isMixed
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                            : isTruth 
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                              : "bg-red-500/10 border-red-500/20 text-red-400"
                        }`}>
                          {isMixed ? <AlertCircle className="w-7 h-7" /> : isTruth ? <CheckCircle2 className="w-7 h-7" /> : <Shield className="w-7 h-7" />}
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-bold text-white mb-1">
                            {session.title || "Untitled Session"}
                          </h3>
                          <div className="flex items-center gap-3 mb-1">
                            <span className={`text-sm font-bold uppercase tracking-wider ${
                              isMixed ? "text-amber-400" : isTruth ? "text-emerald-400" : "text-red-400"
                            }`}>
                              {isMixed ? "Mixed Indicators" : effectiveVerdict === "truth" ? "Truth" : "Deception"} detected
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
                          {/* Veracity & Timestamp Summary */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Veracity Distribution */}
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                              <div className="flex items-center gap-3 mb-6">
                                <BarChart3 className="w-5 h-5 text-emerald-400" />
                                <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400">Veracity Distribution</h4>
                              </div>
                              <div className="space-y-4">
                                {(isMixed || isTruth) && (
                                  <div>
                                    <div className="flex justify-between text-xs font-bold mb-2 text-zinc-300">
                                      <span>Truthful</span>
                                      <span className="text-emerald-400">{fullResults?.truthPercentage || 0}%</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${fullResults?.truthPercentage || 0}%` }}
                                        className="h-full bg-emerald-500" 
                                      />
                                    </div>
                                  </div>
                                )}
                                {(isMixed || !isTruth) && (
                                  <div>
                                    <div className="flex justify-between text-xs font-bold mb-2 text-zinc-300">
                                      <span>Deceptive</span>
                                      <span className="text-red-400">{fullResults?.deceptionPercentage || 0}%</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${fullResults?.deceptionPercentage || 0}%` }}
                                        className="h-full bg-red-500" 
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Timestamp Summary */}
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                              <div className="flex items-center gap-3 mb-6">
                                <Timer className="w-5 h-5 text-blue-400" />
                                <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400">Timestamp Report</h4>
                              </div>
                              <div className="grid grid-cols-1 gap-2">
                                {fullResults?.segments?.filter((s: any) => {
                                  if (isMixed) return true;
                                  if (isTruth) return s.verdict === 'truth';
                                  return s.verdict === 'deception';
                                }).slice(0, 6).map((s: any, i: number) => (
                                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-1.5 h-1.5 rounded-full ${s.verdict === 'truth' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                      <span className="text-[10px] font-mono text-zinc-400">{s.startTime}s - {s.endTime}s</span>
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-wider ${s.verdict === 'truth' ? 'text-emerald-400' : 'text-red-400'}`}>
                                      {s.verdict}
                                    </span>
                                  </div>
                                ))}
                                {(!fullResults?.segments || fullResults.segments.filter((s: any) => {
                                  if (isMixed) return true;
                                  if (isTruth) return s.verdict === 'truth';
                                  return s.verdict === 'deception';
                                }).length === 0) && (
                                  <div className="text-center py-4 text-zinc-500 text-xs italic">
                                    No matching segments found for this verdict.
                                  </div>
                                )}
                              </div>
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
