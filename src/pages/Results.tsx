import { useNavigate } from "react-router-dom";
import { useAnalysis } from "../context/AnalysisContext";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeft, 
  Download, 
  Share2, 
  TrendingUp, 
  Activity,
  Zap,
  Brain
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { motion } from "motion/react";

export default function Results() {
  const navigate = useNavigate();
  const { analysisResults } = useAnalysis();

  if (!analysisResults) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6">
        <AlertTriangle className="w-16 h-16 text-zinc-700 mb-6" />
        <h2 className="text-2xl font-bold mb-4">No Analysis Data</h2>
        <p className="text-zinc-400 mb-8">Please record and analyze a video first to see results.</p>
        <button 
          onClick={() => navigate("/analyze")}
          className="px-8 py-4 bg-emerald-500 text-black rounded-full font-bold hover:bg-emerald-400 transition-all"
        >
          Go to Analysis
        </button>
      </div>
    );
  }

  const isTruth = analysisResults.verdict === "truth";

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-emerald-500/30 flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/40 backdrop-blur-xl border-b border-white/5 p-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/analyze")}
              className="p-2 hover:bg-zinc-900 rounded-full transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Shield className="w-5 h-5 text-black" />
              </div>
              <div className="flex flex-col -space-y-1">
                <div className="text-base font-bold tracking-tight">
                  <span className="text-white">Veri</span>
                  <span className="text-emerald-400">Truth</span>
                </div>
                <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-zinc-500">AI Deception Analysis</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold flex items-center gap-2 hover:bg-white/10 transition-all">
              <Download className="w-3 h-3" /> Export
            </button>
            <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold flex items-center gap-2 hover:bg-white/10 transition-all">
              <Share2 className="w-3 h-3" /> Share
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-32 pb-12 px-6 md:px-12 overflow-y-auto relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Top Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`col-span-2 p-6 rounded-3xl border flex items-center justify-between ${
                isTruth 
                  ? "bg-emerald-500/5 border-emerald-500/20" 
                  : "bg-red-500/5 border-red-500/20"
              }`}
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2 block">Final Verdict</span>
                <h2 className={`text-4xl font-black tracking-tighter uppercase ${
                  isTruth ? "text-emerald-500" : "text-red-500"
                }`}>
                  {analysisResults.verdict}
                </h2>
              </div>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                isTruth ? "bg-emerald-500/20" : "bg-red-500/20"
              }`}>
                {isTruth ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                )}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 bg-slate-900/40 border border-white/5 rounded-3xl"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Confidence</span>
              <div className="flex items-baseline gap-2">
                <h2 className="text-4xl font-black tracking-tighter">{analysisResults.overallConfidence}%</h2>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 bg-slate-900/40 border border-white/5 rounded-3xl"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Duration</span>
              <h2 className="text-4xl font-black tracking-tighter">{analysisResults.recordingDuration}s</h2>
            </motion.div>
          </div>

          {/* Charts Grid */}
          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            {/* Timeline Chart */}
            <div className="lg:col-span-2 p-6 bg-slate-900/40 border border-white/5 rounded-3xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  Confidence Over Time
                </h3>
                <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
                  <span className="flex items-center gap-1.5 text-emerald-500">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Facial
                  </span>
                  <span className="flex items-center gap-1.5 text-blue-500">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> Voice
                  </span>
                </div>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analysisResults.timelineData}>
                    <defs>
                      <linearGradient id="colorFacial" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorVoice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                      itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="facial" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorFacial)" />
                    <Area type="monotone" dataKey="voice" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorVoice)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Radar Chart */}
            <div className="p-6 bg-slate-900/40 border border-white/5 rounded-3xl">
              <h3 className="text-base font-bold mb-8 flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-500" />
                Modality Contribution
              </h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={analysisResults.facialFeatures}>
                    <PolarGrid stroke="#1e293b" />
                    <PolarAngleAxis dataKey="feature" stroke="#64748b" fontSize={9} />
                    <Radar
                      name="Score"
                      dataKey="value"
                      stroke="#a855f7"
                      fill="#a855f7"
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* AI Summary */}
            <div className="p-6 bg-slate-900/40 border border-white/5 rounded-3xl">
              <h3 className="text-base font-bold mb-6 flex items-center gap-2">
                <Brain className="w-4 h-4 text-emerald-500" />
                AI Analysis Summary
              </h3>
              <div className="prose prose-invert max-w-none">
                <p className="text-sm text-zinc-400 leading-relaxed italic">
                  "{analysisResults.aiAnalysis}"
                </p>
              </div>
              <div className="mt-8 pt-8 border-t border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">VeriTruth Core v4.2</p>
                    <p className="text-[10px] text-zinc-500">Neural Behavioral Engine</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Scores */}
            <div className="p-6 bg-slate-900/40 border border-white/5 rounded-3xl">
              <h3 className="text-base font-bold mb-6">Feature Breakdown</h3>
              <div className="space-y-6">
                {[
                  { label: "Facial Micro-expressions", score: analysisResults.facialScore, color: "bg-emerald-500" },
                  { label: "Vocal Stress Index", score: analysisResults.voiceScore, color: "bg-blue-500" },
                  { label: "Cognitive Load Fusion", score: analysisResults.fusionScore, color: "bg-purple-500" }
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-[10px] font-bold mb-2 uppercase tracking-widest">
                      <span className="text-zinc-400">{item.label}</span>
                      <span>{item.score}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.score}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full ${item.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-12 flex justify-center">
            <button 
              onClick={() => navigate("/analyze")}
              className="px-10 py-4 bg-white text-black rounded-full font-bold text-base hover:bg-zinc-200 transition-all shadow-xl shadow-white/10"
            >
              Start New Analysis
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
