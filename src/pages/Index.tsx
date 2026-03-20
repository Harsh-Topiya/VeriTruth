import { Link, useLocation } from "react-router-dom";
import { Shield, Brain, Mic, Eye, ArrowRight, CheckCircle2, Zap, BarChart3, Info, HelpCircle } from "lucide-react";
import { motion } from "motion/react";
import { Background } from "../components/Background";
import Header from "../components/Header";
import { useAnalysis } from "../context/AnalysisContext";
import { useEffect } from "react";

export default function Index() {
  const { analysisResults } = useAnalysis();
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      <Background />

      <Header />

      {/* Hero Section */}
      <header className="relative min-h-screen flex items-center justify-center pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-8">
                <Zap className="w-3 h-3" /> Next-Gen Deception Intelligence
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40">
                Uncover Truth with <span className="text-emerald-500">Multimodal AI</span>
              </h1>
              <p className="text-lg md:text-xl text-zinc-400 leading-relaxed mb-12 max-w-2xl mx-auto">
                VeriTruth combines advanced facial micro-expression analysis and voice stress detection to provide probabilistic assessments of deceptive behavior.
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <Link 
                  to="/analyze" 
                  className="px-10 py-5 bg-emerald-500 text-black rounded-full text-lg font-black flex items-center gap-3 hover:bg-emerald-400 transition-all group shadow-2xl shadow-emerald-500/40 active:scale-95"
                >
                  Begin New Session
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  to="/results" 
                  className="px-10 py-5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-lg font-bold hover:bg-emerald-500/20 transition-all active:scale-95 flex items-center gap-3"
                >
                  <BarChart3 className="w-6 h-6" />
                  Latest Results
                </Link>
                <Link 
                  to="/history" 
                  className="px-10 py-5 bg-white/5 border border-white/10 backdrop-blur-md text-white rounded-full text-lg font-bold hover:bg-white/10 transition-all active:scale-95"
                >
                  View History
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="technology" className="py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-sm font-bold text-emerald-500 uppercase tracking-[0.3em] mb-4">Detection Technology</h2>
            <p className="text-4xl md:text-6xl font-black tracking-tight max-w-3xl mx-auto leading-tight">
              Multimodal approach for <span className="text-emerald-500">unrivaled precision</span>.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Eye className="w-8 h-8 text-emerald-500" />,
                title: "Facial Micro-expressions",
                description: "Detects involuntary facial movements occurring in as little as 1/25th of a second that signal hidden emotions."
              },
              {
                icon: <Mic className="w-8 h-8 text-blue-500" />,
                title: "Voice Stress Analysis",
                description: "Analyzes frequency fluctuations and vocal patterns associated with psychological stress and cognitive load."
              },
              {
                icon: <Brain className="w-8 h-8 text-purple-500" />,
                title: "Multimodal Fusion",
                description: "Correlates data from multiple modalities to build a comprehensive deception profile with high confidence."
              }
            ].map((feature, i) => (
              <div key={i} className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl hover:border-emerald-500/50 transition-colors group">
                <div className="mb-6 p-3 bg-zinc-900 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-32 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl font-bold tracking-tight mb-12">How It Works</h2>
              <div className="space-y-8">
                {[
                  { title: "Record Response", description: "Enable your camera and microphone to record a short response to a specific question." },
                  { title: "Deception Extraction", description: "Our AI extracts thousands of data points from your facial movements and vocal patterns." },
                  { title: "Probabilistic Assessment", description: "Algorithms compare extracted patterns against known indicators of deceptive behavior." },
                  { title: "Detailed Reporting", description: "Receive a comprehensive breakdown of confidence scores and specific deceptive markers." }
                ].map((step, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="flex-shrink-0 w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold mb-2">{step.title}</h4>
                      <p className="text-zinc-400">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-3xl border border-zinc-800 overflow-hidden flex items-center justify-center">
                <div className="relative w-64 h-64">
                  <div className="absolute inset-0 border-2 border-emerald-500/30 rounded-full animate-[spin_10s_linear_infinite]" />
                  <div className="absolute inset-4 border-2 border-blue-500/30 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Shield className="w-20 h-20 text-emerald-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
