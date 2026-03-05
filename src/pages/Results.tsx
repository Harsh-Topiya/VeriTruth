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
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12 font-sans selection:bg-emerald-500/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <button 
                onClick={() => navigate("/analyze")}
                className="p-2 hover:bg-zinc-900 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-3xl font-bold tracking-tight">Analysis Results</h1>
            </div>
            <p className="text-zinc-400">
              Detailed breakdown of multimodal behavioral analysis 
              <span className="ml-2 px-2 py-0.5 bg-zinc-900 rounded text-xs font-mono">
                ID: {Math.random().toString(36).substring(7).toUpperCase()}
              </span>
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-zinc-800 transition-all">
              <Download className="w-4 h-4" /> Export Report
            </button>
            <button className="px-5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-zinc-800 transition-all">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </header>

        {/* Top Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`col-span-2 p-8 rounded-3xl border flex items-center justify-between ${
              isTruth 
                ? "bg-emerald-500/5 border-emerald-500/20" 
                : "bg-red-500/5 border-red-500/20"
            }`}
          >
            <div>
              <span className="text-sm font-bold uppercase tracking-widest opacity-60 mb-2 block">Final Verdict</span>
              <h2 className={`text-6xl font-black tracking-tighter uppercase ${
                isTruth ? "text-emerald-500" : "text-red-500"
              }`}>
                {analysisResults.verdict}
              </h2>
            </div>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
              isTruth ? "bg-emerald-500/20" : "bg-red-500/20"
            }`}>
              {isTruth ? (
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              ) : (
                <AlertTriangle className="w-10 h-10 text-red-500" />
              )}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl"
          >
            <span className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Confidence</span>
            <div className="flex items-baseline gap-2">
              <h2 className="text-5xl font-black tracking-tighter">{analysisResults.overallConfidence}%</h2>
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl"
          >
            <span className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Duration</span>
            <h2 className="text-5xl font-black tracking-tighter">{analysisResults.recordingDuration}s</h2>
          </motion.div>
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Timeline Chart */}
          <div className="lg:col-span-2 p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                Confidence Over Time
              </h3>
              <div className="flex gap-4 text-xs font-bold uppercase tracking-widest">
                <span className="flex items-center gap-1.5 text-emerald-500">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" /> Facial
                </span>
                <span className="flex items-center gap-1.5 text-blue-500">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" /> Voice
                </span>
              </div>
            </div>
            <div className="h-[300px] w-full">
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="time" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="facial" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorFacial)" />
                  <Area type="monotone" dataKey="voice" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVoice)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Radar Chart */}
          <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-500" />
              Modality Contribution
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={analysisResults.facialFeatures}>
                  <PolarGrid stroke="#27272a" />
                  <PolarAngleAxis dataKey="feature" stroke="#52525b" fontSize={10} />
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
          <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Brain className="w-5 h-5 text-emerald-500" />
              AI Analysis Summary
            </h3>
            <div className="prose prose-invert max-w-none">
              <p className="text-zinc-400 leading-relaxed italic">
                "{analysisResults.aiAnalysis}"
              </p>
            </div>
            <div className="mt-8 pt-8 border-t border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-bold">VeriTruth Core v4.2</p>
                  <p className="text-xs text-zinc-500">Neural Behavioral Engine</p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Scores */}
          <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl">
            <h3 className="text-xl font-bold mb-6">Feature Breakdown</h3>
            <div className="space-y-6">
              {[
                { label: "Facial Micro-expressions", score: analysisResults.facialScore, color: "bg-emerald-500" },
                { label: "Vocal Stress Index", score: analysisResults.voiceScore, color: "bg-blue-500" },
                { label: "Cognitive Load Fusion", score: analysisResults.fusionScore, color: "bg-purple-500" }
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm font-bold mb-2 uppercase tracking-widest">
                    <span className="text-zinc-400">{item.label}</span>
                    <span>{item.score}%</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
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
            className="px-12 py-5 bg-white text-black rounded-full font-bold text-lg hover:bg-zinc-200 transition-all shadow-xl shadow-white/10"
          >
            Start New Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
