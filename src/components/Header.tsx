import { useState, ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Menu, X, History, Home, Zap, Info, HelpCircle, Upload, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAnalysis } from "../context/AnalysisContext";

interface HeaderProps {
  extraButtons?: ReactNode;
}

export default function Header({ extraButtons }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { analysisResults } = useAnalysis();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navItems = [
    { label: "Home", icon: <Home className="w-4 h-4" />, path: "/" },
    { label: "History", icon: <History className="w-4 h-4" />, path: "/history" },
    { label: "Live Analysis", icon: <Zap className="w-4 h-4" />, path: "/analyze" },
    { label: "Upload Analysis", icon: <Upload className="w-4 h-4" />, path: "/upload-analyze" },
    { label: "Latest Results", icon: <BarChart3 className="w-4 h-4" />, path: "/results" },
    { label: "Technology", icon: <Info className="w-4 h-4" />, path: "/#technology" },
    { label: "How it Works", icon: <HelpCircle className="w-4 h-4" />, path: "/#how-it-works" },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/40 backdrop-blur-xl border-b border-white/5 p-4 md:px-12">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6 text-black" />
            </div>
            <div className="flex flex-col -space-y-1">
              <div className="text-xl font-bold tracking-tight">
                <span className="text-white">Veri</span>
                <span className="text-emerald-400">Truth</span>
              </div>
              <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-500">AI Deception Analysis</span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3">
              {extraButtons}
            </div>
            
            <button
              onClick={toggleMenu}
              className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all active:scale-95 text-emerald-400"
              aria-label="Toggle Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Side Panel (Drawer) */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-slate-950 border-l border-white/10 z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-8 flex justify-between items-center border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-black" />
                  </div>
                  <span className="font-bold tracking-tight text-lg text-white">Menu</span>
                </div>
                <button
                  onClick={toggleMenu}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-8 space-y-8">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4">Navigation</p>
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={toggleMenu}
                      className="flex items-center gap-4 p-4 rounded-2xl hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors">
                        {item.icon}
                      </div>
                      <span className="font-bold text-zinc-300 group-hover:text-white transition-colors">{item.label}</span>
                    </Link>
                  ))}
                </div>

                <div className="md:hidden space-y-2">
                  {extraButtons && (
                    <>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4">Actions</p>
                      <div className="flex flex-col gap-3">
                        {extraButtons}
                      </div>
                    </>
                  )}
                </div>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
