import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileVideo, X, Brain, Shield, CheckCircle2, AlertCircle, Info, ArrowLeft, Play, Trash2, Loader2, BarChart3 } from "lucide-react";
import { useAnalysis } from "../context/AnalysisContext";
import { motion, AnimatePresence } from "motion/react";
import { analyzeVideo } from "../services/geminiService";
import { Background } from "../components/Background";
import Header from "../components/Header";

export default function UploadAnalyze() {
  const navigate = useNavigate();
  const { setAnalysisResults, setIsAnalyzing, isAnalyzing, analysisResults } = useAnalysis();
  
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    if (!selectedFile.type.startsWith("video/")) {
      setError("Please upload a valid video file.");
      return;
    }
    if (selectedFile.size > 50 * 1024 * 1024) { // 50MB limit
      setError("File size exceeds 50MB limit.");
      return;
    }
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startAnalysis = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    
    try {
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          resolve(base64String);
        };
      });
      reader.readAsDataURL(file);
      const videoBase64 = await base64Promise;

      // Call Gemini API
      // For uploaded files, we might not know the exact duration easily without a video element
      // We can try to get it from the video element if previewUrl is set
      const videoElement = document.createElement("video");
      videoElement.src = previewUrl!;
      
      const duration = await new Promise<number>((resolve) => {
        videoElement.onloadedmetadata = () => {
          resolve(Math.floor(videoElement.duration));
        };
        // Fallback if metadata fails to load
        setTimeout(() => resolve(30), 2000);
      });

      const results = await analyzeVideo(videoBase64, duration, file.type);
      results.recordingDuration = duration;

      // Save results to backend
      await fetch("/api/sessions/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(results),
      });
      
      setAnalysisResults(results);
      setIsAnalyzing(false);
      navigate("/results");
    } catch (err) {
      console.error("Analysis error:", err);
      setIsAnalyzing(false);
      setError("Analysis failed. Please try again with a different file.");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans flex flex-col">
      <Background />
      <Header 
        extraButtons={
          <button 
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-white/10 transition-all text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        }
      />

      <main className="flex-grow pt-32 pb-12 px-6 md:px-12 overflow-y-auto relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tighter">Upload Analysis</h1>
                <p className="text-zinc-500 text-sm">Analyze pre-recorded video files for behavioral patterns</p>
              </div>

              <div className="relative aspect-video bg-slate-900/40 border-2 border-dashed border-white/10 rounded-[40px] overflow-hidden flex flex-col items-center justify-center group transition-all hover:border-emerald-500/30">
                <AnimatePresence mode="wait">
                  {!file ? (
                    <motion.div 
                      key="upload-prompt"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col items-center p-12 text-center"
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Upload className="w-10 h-10 text-emerald-400" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Drop your video here</h3>
                      <p className="text-sm text-zinc-500 mb-8 max-w-xs">
                        Support for MP4, WebM, and MOV files up to 50MB
                      </p>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-zinc-200 transition-all flex items-center gap-2"
                      >
                        Select File
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="video/*" 
                        className="hidden" 
                      />
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="file-preview"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 flex flex-col"
                    >
                      <video 
                        src={previewUrl!} 
                        className="w-full h-full object-cover"
                        controls
                      />
                      <div className="absolute top-6 right-6 flex gap-2">
                        <button 
                          onClick={removeFile}
                          className="p-3 bg-black/60 backdrop-blur-md text-white rounded-full hover:bg-red-500 transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {isAnalyzing && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center z-30">
                    <div className="relative w-20 h-20 mb-8">
                      <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full" />
                      <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Brain className="w-8 h-8 text-emerald-500" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Analyzing Patterns...</h3>
                    <p className="text-xs text-zinc-400 animate-pulse">Processing facial and voice data fusion</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center gap-4">
                <button 
                  disabled={!file || isAnalyzing}
                  onClick={startAnalysis}
                  className="px-12 py-5 bg-emerald-500 text-black rounded-full font-bold text-lg flex items-center gap-3 hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Play className="w-6 h-6 fill-current" />
                      Start Analysis
                    </>
                  )}
                </button>
                {analysisResults && !isAnalyzing && (
                  <button 
                    onClick={() => navigate("/results")}
                    className="px-8 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-emerald-500/20 transition-all"
                  >
                    <BarChart3 className="w-4 h-4" />
                    View Latest Results
                  </button>
                )}
                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm font-medium">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-8 bg-slate-900/40 border border-white/5 rounded-[32px]">
                <h3 className="text-base font-bold mb-6 flex items-center gap-2">
                  <Info className="w-4 h-4 text-emerald-500" />
                  Upload Requirements
                </h3>
                <ul className="space-y-4 text-xs text-zinc-400">
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    Video must be under 50MB
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    Face should be clearly visible
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    Audio must be clear and audible
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    Prefer MP4 or WebM formats
                  </li>
                </ul>
              </div>

              <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-[32px]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h4 className="font-bold text-sm">Privacy Guaranteed</h4>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Uploaded files are processed securely. We do not store your raw video files on our servers after analysis is complete.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
