import { Link } from "react-router-dom";
import { Shield, Brain, Mic, Eye, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

export default function Index() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-emerald-500/30">
      {/* Hero Section */}
      <header className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <nav className="flex items-center justify-between mb-24">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Shield className="w-6 h-6 text-black" />
              </div>
              <span className="text-xl font-bold tracking-tight">TruthSeeker AI</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
              <a href="#technology" className="hover:text-white transition-colors">Technology</a>
              <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
              <a href="#research" className="hover:text-white transition-colors">Research</a>
            </div>
            <Link 
              to="/analyze" 
              className="px-5 py-2.5 bg-white text-black rounded-full text-sm font-semibold hover:bg-zinc-200 transition-all active:scale-95"
            >
              Start Analysis
            </Link>
          </nav>

          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] mb-8">
                Uncover Truth with <span className="text-emerald-500">Multimodal AI</span>
              </h1>
              <p className="text-xl text-zinc-400 leading-relaxed mb-12 max-w-2xl">
                VeriTruth combines advanced facial micro-expression analysis and voice stress detection to provide probabilistic assessments of deceptive behavior.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/analyze" 
                  className="px-8 py-4 bg-emerald-500 text-black rounded-full text-lg font-bold flex items-center gap-2 hover:bg-emerald-400 transition-all group"
                >
                  Begin New Session
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="px-8 py-4 bg-zinc-900 border border-zinc-800 text-white rounded-full text-lg font-bold hover:bg-zinc-800 transition-all">
                  View Demo
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="technology" className="py-32 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-20">
            <h2 className="text-sm font-bold text-emerald-500 uppercase tracking-widest mb-4">Advanced Detection Technology</h2>
            <p className="text-4xl font-bold tracking-tight max-w-2xl">
              Our multimodal approach analyzes multiple behavioral indicators simultaneously for more reliable results.
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
                description: "Correlates data from multiple modalities to build a comprehensive behavioral profile with high confidence."
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
                  { title: "Behavioral Extraction", description: "Our AI extracts thousands of data points from your facial movements and vocal patterns." },
                  { title: "Probabilistic Assessment", description: "Algorithms compare extracted patterns against known indicators of deceptive behavior." },
                  { title: "Detailed Reporting", description: "Receive a comprehensive breakdown of confidence scores and specific behavioral markers." }
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

      {/* Footer */}
      <footer className="py-20 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-500" />
            <span className="text-lg font-bold">TruthSeeker AI</span>
          </div>
          <p className="text-zinc-500 text-sm">
            For academic and research purposes only. Not for forensic use. © 2024 TruthSeeker AI.
          </p>
          <div className="flex gap-6 text-sm text-zinc-400">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
