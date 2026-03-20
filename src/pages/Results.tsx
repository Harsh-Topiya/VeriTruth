import { useNavigate, Link } from "react-router-dom";
import { useState, useRef } from "react";
import ReactMarkdown from 'react-markdown';
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
  Brain,
  Home,
  History,
  X,
  FileText,
  Printer,
  Eye,
  Mic,
  Waves,
  Timer,
  Clock,
  BarChart3,
  Smile,
  Wind,
  User
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
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
import { motion, AnimatePresence } from "motion/react";
import { Background } from "../components/Background";
import { MetricGauge } from "../components/MetricGauge";
import Header from "../components/Header";

export default function Results() {
  const navigate = useNavigate();
  const { analysisResults, user } = useAnalysis();
  const [showPreview, setShowPreview] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleExport = () => {
    setShowPreview(true);
  };

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = 210;
    const pdfHeight = 297;
    
    const sections = reportRef.current.querySelectorAll('[data-pdf-section]');
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i] as HTMLElement;
      
      const canvas = await html2canvas(section, {
        scale: 3, // Higher scale for better quality
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        imageTimeout: 0,
        windowWidth: 794, // Fixed width for A4 aspect ratio
      });
      
      const imgData = canvas.toDataURL("image/png", 1.0);
      const imgWidth = pdfWidth;
      const imgHeight = pdfHeight; // Force fit to A4 page height
      
      if (i > 0) pdf.addPage();
      
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight, undefined, "FAST");
    }
    
    pdf.save(`veritruth_report_${new Date().getTime()}.pdf`);
    setShowPreview(false);
  };

  const handleShare = async () => {
    if (!analysisResults) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'VeriTruth Analysis Results',
          text: `VeriTruth Analysis: ${analysisResults.verdict.toUpperCase()} detected with ${analysisResults.overallConfidence}% confidence.`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      alert("Your browser doesn't support direct sharing. You can copy the URL from the address bar to share your results manually.");
    }
  };

  if (!analysisResults) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6">
        <AlertTriangle className="w-16 h-16 text-zinc-700 mb-6" />
        <h2 className="text-2xl font-bold mb-4">No Analysis Data</h2>
        <p className="text-zinc-400 mb-8">Please record and analyze a video first to see results.</p>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate("/")}
            className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full font-bold hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <Home className="w-5 h-5" /> Home
          </button>
          <button 
            onClick={() => navigate("/analyze")}
            className="px-8 py-4 bg-emerald-500 text-black rounded-full font-bold hover:bg-emerald-400 transition-all flex items-center gap-2"
          >
            <Zap className="w-5 h-5 fill-current" /> Go to Analysis
          </button>
        </div>
      </div>
    );
  }

  const isTruth = analysisResults.verdict === "truth";
  const isInsufficient = analysisResults.verdict === "insufficient_data";

  // Check if it's a single verdict throughout
  const hasMultipleSegments = analysisResults.segments && analysisResults.segments.length > 1;
  const allSameVerdict = analysisResults.segments && analysisResults.segments.every(s => s.verdict === analysisResults.segments![0].verdict);
  const showSingleVerdict = !hasMultipleSegments || allSameVerdict;

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-emerald-500/30 flex flex-col relative">
      <Background />
      <Header 
        extraButtons={
          <>
            {user && (
              <button 
                onClick={() => navigate("/history")}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-white/10 transition-all text-zinc-400 hover:text-white"
              >
                <History className="w-4 h-4" /> History
              </button>
            )}
            <button 
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-white/10 transition-all text-zinc-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button 
              onClick={handleExport}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-white/10 transition-all text-zinc-400 hover:text-white"
            >
              <Download className="w-4 h-4" /> Export
            </button>
            <button 
              onClick={handleShare}
              className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-emerald-500/20 transition-all text-emerald-400"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
          </>
        }
      />

      <main className="flex-grow pt-32 pb-12 px-6 md:px-12 overflow-y-auto relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Top Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`col-span-2 p-6 rounded-3xl border flex items-center justify-between ${
                isInsufficient
                  ? "bg-amber-500/5 border-amber-500/20"
                  : isTruth 
                    ? "bg-emerald-500/5 border-emerald-500/20" 
                    : "bg-red-500/5 border-red-500/20"
              }`}
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2 block">
                  {analysisResults.title || "Untitled Session"}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2 block">Final Verdict</span>
                <h2 className={`text-4xl font-black tracking-tighter uppercase ${
                  isInsufficient || !showSingleVerdict ? "text-amber-500" : isTruth ? "text-emerald-500" : "text-red-500"
                }`}>
                  {isInsufficient 
                    ? "Incomplete Data" 
                    : showSingleVerdict 
                      ? analysisResults.verdict 
                      : "Mixed Indicators"
                  }
                </h2>
              </div>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                isInsufficient || !showSingleVerdict ? "bg-amber-500/20" : isTruth ? "bg-emerald-500/20" : "bg-red-500/20"
              }`}>
                {isInsufficient || !showSingleVerdict ? (
                  <AlertTriangle className={`w-8 h-8 text-amber-500`} />
                ) : isTruth ? (
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

          {/* Temporal Analysis & Percentages */}
          {!isInsufficient && !showSingleVerdict && (
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="md:col-span-1 p-6 bg-slate-900/40 border border-white/5 rounded-3xl"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4 block">Veracity Distribution</span>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-bold text-emerald-500">Truthful</span>
                      <span className="text-xs font-mono">{analysisResults.truthPercentage}%</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${analysisResults.truthPercentage}%` }}
                        className="h-full bg-emerald-500"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-bold text-red-500">Deceptive</span>
                      <span className="text-xs font-mono">{analysisResults.deceptionPercentage}%</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${analysisResults.deceptionPercentage}%` }}
                        className="h-full bg-red-500"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="md:col-span-2 p-6 bg-slate-900/40 border border-white/5 rounded-3xl"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4 block">Timestamp Report</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {analysisResults.segments?.map((segment, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-white/5 border border-white/5 rounded-2xl">
                      <div className={`w-2 h-10 rounded-full ${segment.verdict === 'truth' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-3 h-3 text-zinc-500" />
                          <span className="text-xs font-mono text-zinc-300">{segment.startTime}s - {segment.endTime}s</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold uppercase tracking-tight ${segment.verdict === 'truth' ? 'text-emerald-500' : 'text-red-500'}`}>
                            {segment.verdict === 'truth' ? 'Truthful' : 'Deceptive'}
                          </span>
                          <span className="text-[10px] text-zinc-500">({segment.confidence}% confidence)</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {/* Core Modality Metrics */}
          {!isInsufficient && (
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl flex items-center justify-between group relative cursor-help"
                title={`Facial Confidence: ${analysisResults.facialConfidence}%`}
              >
                <div className="flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/60 mb-2 block">Facial Confidence</span>
                  <div className="flex items-center gap-4">
                    <h2 className="text-4xl font-black tracking-tighter text-emerald-400">{analysisResults.facialConfidence}%</h2>
                    <div className="flex-1 h-1.5 bg-emerald-500/10 rounded-full overflow-hidden max-w-[100px]">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${analysisResults.facialConfidence}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-emerald-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <Smile className="w-6 h-6 text-emerald-400" />
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-3xl flex items-center justify-between group relative cursor-help"
                title={`Speech Clarity: ${analysisResults.speechClarity}%`}
              >
                <div className="flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500/60 mb-2 block">Speech Clarity</span>
                  <div className="flex items-center gap-4">
                    <h2 className="text-4xl font-black tracking-tighter text-blue-400">{analysisResults.speechClarity}%</h2>
                    <div className="flex-1 h-1.5 bg-blue-500/10 rounded-full overflow-hidden max-w-[100px]">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${analysisResults.speechClarity}%` }}
                        transition={{ duration: 1, delay: 0.6 }}
                        className="h-full bg-blue-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                  <Mic className="w-6 h-6 text-blue-400" />
                </div>
              </motion.div>
            </div>
          )}

          {/* Charts Grid */}
          {!isInsufficient && (
            <div className="grid lg:grid-cols-1 gap-8 mb-8">
              {/* Timeline Chart */}
              <div className="p-6 bg-slate-900/40 border border-white/5 rounded-3xl">
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
            </div>
          )}

          {isInsufficient && (
            <div className="p-12 bg-amber-500/5 border border-amber-500/20 rounded-3xl mb-8 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-10 h-10 text-amber-500" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">Incomplete Analysis Data</h3>
              <p className="text-zinc-400 max-w-2xl text-lg leading-relaxed">
                VeriTruth requires both <span className="text-emerald-400 font-bold">visual facial tracking</span> and <span className="text-blue-400 font-bold">voice stress analysis</span> to provide a reliable verdict. 
                {analysisResults.missingFeature === 'voice' && " No audible speech was detected in this recording."}
                {analysisResults.missingFeature === 'visual' && " No clear facial features were detected in this recording."}
                {analysisResults.missingFeature === 'both' && " Neither facial features nor audible speech were detected."}
              </p>
              <div className="mt-8 flex gap-4">
                <button 
                  onClick={() => navigate("/analyze")}
                  className="px-8 py-3 bg-amber-500 text-black rounded-full font-bold hover:bg-amber-400 transition-all"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Detailed Breakdown */}
          {!isInsufficient && (
            <>
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                    <h3 className="text-lg font-black uppercase tracking-tighter">Facial Indicators</h3>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {analysisResults.facialFeatures.filter(f => f.feature !== "Facial Confidence" && f.feature !== "Eye Contact").map((f, i) => (
                    <MetricGauge 
                      key={i}
                      label={f.feature} 
                      value={f.value} 
                      details={f.details}
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

              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-blue-500 rounded-full" />
                    <h3 className="text-lg font-black uppercase tracking-tighter">Vocal Indicators</h3>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {analysisResults.voiceFeatures.filter(f => f.feature !== "Speech Clarity" && f.feature !== "Voice Stress Index").map((f, i) => (
                    <MetricGauge 
                      key={i}
                      label={f.feature} 
                      value={f.value} 
                      details={f.details}
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
            </>
          )}

          <div className="grid lg:grid-cols-1 gap-8">
            {/* AI Summary */}
            <div className="p-8 bg-slate-900/40 border border-white/5 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Brain className="w-32 h-32 text-emerald-500" />
              </div>
              <h3 className="text-base font-bold mb-6 flex items-center gap-2">
                <Brain className="w-4 h-4 text-emerald-500" />
                Detailed AI Deception Summary
              </h3>
              <div className="prose prose-invert max-w-none">
                <div className="text-lg text-zinc-300 leading-relaxed font-medium markdown-body">
                  <ReactMarkdown>{analysisResults.aiAnalysis}</ReactMarkdown>
                </div>
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

      {/* PDF Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPreview(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-zinc-900/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-lg font-bold">Report Preview</h3>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={downloadPDF}
                    className="px-6 py-2.5 bg-emerald-500 text-black rounded-full text-xs font-bold flex items-center gap-2 hover:bg-emerald-400 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" /> Download PDF
                  </button>
                  <button 
                    onClick={() => setShowPreview(false)}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* PDF Content Area (White Background for PDF) */}
              <div className="flex-grow overflow-y-auto p-8 bg-zinc-800/50">
                <div 
                  ref={reportRef}
                  className="w-full max-w-[210mm] mx-auto space-y-8"
                >
                  {/* PAGE 1: VISUAL DATA */}
                  <div 
                    data-pdf-section="visual"
                    className="w-[210mm] h-[297mm] bg-white pt-[6mm] pb-[10mm] px-[12mm] font-serif flex flex-col overflow-hidden mx-auto"
                    style={{ color: "#000000" }}
                  >
                    <div className="flex justify-between items-end pb-3 mb-6" style={{ borderBottom: "2px solid #18181b" }}>
                      <div>
                        <div className="flex items-center gap-2">
                          <Shield className="w-10 h-10" style={{ color: "#059669" }} />
                          <div>
                            <h1 className="text-[32px] font-black tracking-tighter leading-none">VERITRUTH</h1>
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] mt-1" style={{ color: "#71717a" }}>AI DECEPTION ANALYSIS</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "#71717a" }}>Report Generated</p>
                        <p className="text-[12px] font-bold">{new Date().toLocaleDateString()} | {new Date().toLocaleTimeString()}</p>
                      </div>
                    </div>

                    <div className="flex gap-6 mb-6">
                      <div className="flex-[2] p-5 rounded-xl" style={{ backgroundColor: "#fafafa", border: "1px solid #e4e4e7" }}>
                        <h2 className="text-[11px] font-bold uppercase tracking-widest mb-2 leading-normal" style={{ color: "#71717a" }}>Subject Assessment</h2>
                        <div className="flex items-center gap-4">
                          <div className={`font-black uppercase ${analysisResults?.verdict === 'insufficient_data' ? 'text-xl' : 'text-[28px]'}`} style={{ color: analysisResults?.verdict === 'insufficient_data' || !showSingleVerdict ? '#d97706' : analysisResults?.verdict === 'truth' ? '#059669' : '#dc2626' }}>
                            {analysisResults?.verdict === 'insufficient_data' 
                              ? 'Insufficient Data' 
                              : showSingleVerdict 
                                ? analysisResults?.verdict 
                                : 'Mixed Indicators'}
                          </div>
                          <div className="h-8 w-px" style={{ backgroundColor: "#e4e4e7" }} />
                          <div className="flex flex-col gap-1">
                            <p className="text-2xl font-black leading-tight" style={{ color: "#18181b" }}>{analysisResults?.overallConfidence}%</p>
                            <p className="text-[9px] font-bold uppercase whitespace-nowrap" style={{ color: "#71717a" }}>Confidence Score</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 p-5 rounded-xl" style={{ backgroundColor: "#fafafa", border: "1px solid #e4e4e7" }}>
                        <div className="space-y-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] uppercase font-bold" style={{ color: "#71717a" }}>Title:</span>
                            <span className="font-bold text-[11px] break-words leading-normal" style={{ color: "#18181b" }}>{analysisResults?.title || "Untitled Session"}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] uppercase font-bold" style={{ color: "#71717a" }}>Duration:</span>
                            <span className="font-bold text-[11px]" style={{ color: "#18181b" }}>{analysisResults?.recordingDuration} Seconds</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {!showSingleVerdict && (
                      <div className="grid grid-cols-2 gap-6 mb-6">
                        <div className="p-5 rounded-xl" style={{ backgroundColor: "#fafafa", border: "1px solid #e4e4e7" }}>
                          <h2 className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: "#71717a" }}>Veracity Distribution</h2>
                          <div className="space-y-3">
                            <div className="flex justify-between text-[10px] font-bold" style={{ color: "#18181b" }}>
                              <span>Truthful</span>
                              <span>{analysisResults.truthPercentage}%</span>
                            </div>
                            <div className="h-1.5 rounded-full" style={{ backgroundColor: "#f4f4f5" }}>
                              <div className="h-full" style={{ width: `${analysisResults.truthPercentage}%`, backgroundColor: "#059669" }} />
                            </div>
                            <div className="flex justify-between text-[10px] font-bold" style={{ color: "#18181b" }}>
                              <span>Deceptive</span>
                              <span>{analysisResults.deceptionPercentage}%</span>
                            </div>
                            <div className="h-1.5 rounded-full" style={{ backgroundColor: "#f4f4f5" }}>
                              <div className="h-full" style={{ width: `${analysisResults.deceptionPercentage}%`, backgroundColor: "#dc2626" }} />
                            </div>
                          </div>
                        </div>
                        <div className="p-5 rounded-xl" style={{ backgroundColor: "#fafafa", border: "1px solid #e4e4e7" }}>
                          <h2 className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: "#71717a" }}>Timestamp Summary</h2>
                          <div className="space-y-1.5">
                            {analysisResults.segments?.slice(0, 4).map((s, i) => (
                              <div key={i} className="flex justify-between text-[9px]" style={{ color: "#3f3f46" }}>
                                <span className="font-mono">{s.startTime}s-{s.endTime}s:</span>
                                <span className="font-bold uppercase" style={{ color: s.verdict === 'truth' ? '#059669' : '#dc2626' }}>{s.verdict}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mb-6">
                      <h2 className="text-[11px] font-bold uppercase tracking-widest pb-1 mb-3 leading-normal" style={{ color: "#18181b", borderBottom: "1px solid #e4e4e7" }}>Core Deception Metrics</h2>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl text-center" style={{ backgroundColor: "#f9fafb", border: "1px solid #f3f4f6" }}>
                          <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: "#6b7280" }}>Facial Confidence</p>
                          <p className="text-[20px] font-black" style={{ color: "#18181b" }}>{analysisResults?.facialConfidence || 0}%</p>
                        </div>
                        <div className="p-4 rounded-xl text-center" style={{ backgroundColor: "#f9fafb", border: "1px solid #f3f4f6" }}>
                          <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: "#6b7280" }}>Speech Clarity</p>
                          <p className="text-[20px] font-black" style={{ color: "#18181b" }}>{analysisResults?.speechClarity || 0}%</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h2 className="text-[11px] font-bold uppercase tracking-widest pb-1 mb-4 leading-normal" style={{ color: "#18181b", borderBottom: "1px solid #e4e4e7" }}>Facial Indicators Analysis</h2>
                      <div className="grid grid-cols-2 gap-x-10 gap-y-4">
                        {analysisResults?.facialFeatures.filter(f => f.feature !== "Facial Confidence" && f.feature !== "Eye Contact").map((f, i) => (
                          <div key={i}>
                            <div className="flex justify-between text-[10px] font-bold mb-1.5 leading-normal" style={{ color: "#18181b" }}>
                              <span>{f.feature}</span>
                              <span style={{ color: "#059669" }}>{f.value}%</span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#f4f4f5" }}>
                              <div className="h-full" style={{ width: `${f.value}%`, backgroundColor: "#059669" }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <h2 className="text-[11px] font-bold uppercase tracking-widest pb-1 mb-4 leading-normal" style={{ color: "#18181b", borderBottom: "1px solid #e4e4e7" }}>Vocal Indicators Analysis</h2>
                      <div className="grid grid-cols-2 gap-x-10 gap-y-4">
                        {analysisResults?.voiceFeatures.filter(f => f.feature !== "Speech Clarity").map((f, i) => (
                          <div key={i}>
                            <div className="flex justify-between text-[10px] font-bold mb-1.5 leading-normal" style={{ color: "#18181b" }}>
                              <span>{f.feature}</span>
                              <span style={{ color: "#2563eb" }}>{f.value}%</span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#f4f4f5" }}>
                              <div className="h-full" style={{ width: `${f.value}%`, backgroundColor: "#2563eb" }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-auto pt-6 text-center" style={{ borderTop: "1px solid #e4e4e7" }}>
                      <p className="text-[10px] font-bold tracking-[0.3em] uppercase" style={{ color: "#a1a1aa" }}>
                        Confidential Analysis Report • Page 1 of 2
                      </p>
                    </div>
                  </div>

                  {/* PAGE 2: AI SUMMARY */}
                  <div 
                    data-pdf-section="summary"
                    className="w-[210mm] h-[297mm] bg-white pt-[10mm] pb-[10mm] px-[12mm] font-serif flex flex-col overflow-hidden mx-auto"
                    style={{ color: "#000000" }}
                  >
                    <div className="flex justify-between items-center pb-3 mb-8" style={{ borderBottom: "2px solid #18181b" }}>
                      <div className="flex items-center gap-2">
                        <Shield className="w-8 h-8" style={{ color: "#059669" }} />
                        <h1 className="text-[24px] font-black tracking-tighter leading-none">VERITRUTH</h1>
                      </div>
                      <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#71717a" }}>Detailed AI Summary</p>
                    </div>

                    <div className="flex-grow overflow-hidden">
                      <h2 className="text-[14px] font-bold uppercase tracking-widest pb-1 mb-4 leading-normal" style={{ color: "#18181b", borderBottom: "1px solid #e4e4e7" }}>Analysis Findings</h2>
                      <div className="text-[12pt] leading-relaxed markdown-body-pdf" style={{ color: "#27272a" }}>
                        <ReactMarkdown>{analysisResults?.aiAnalysis}</ReactMarkdown>
                      </div>
                    </div>

                    <div className="mt-auto pt-6 text-center" style={{ borderTop: "1px solid #e4e4e7" }}>
                      <p className="text-[10px] font-bold tracking-[0.3em] uppercase" style={{ color: "#a1a1aa" }}>
                        Confidential Analysis Report • Page 2 of 2
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
