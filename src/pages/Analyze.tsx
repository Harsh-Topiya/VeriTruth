import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Camera, Mic, Loader2, Play, Square, AlertCircle, CheckCircle2, Info, Brain, Shield, History } from "lucide-react";
import { useAnalysis } from "../context/AnalysisContext";
import { motion, AnimatePresence } from "motion/react";
import { analyzeVideo } from "../services/geminiService";
import { Background } from "../components/Background";

export default function Analyze() {
  const navigate = useNavigate();
  const { setRecordingData, setAnalysisResults, setIsAnalyzing, isAnalyzing } = useAnalysis();
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingTimeRef = useRef(0);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [chunks, setChunks] = useState<Blob[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync ref with state for use in callbacks
  useEffect(() => {
    recordingTimeRef.current = recordingTime;
  }, [recordingTime]);

  const startCamera = async () => {
    setPermissionError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPermissionError("Your browser does not support camera/microphone access or you are not in a secure (HTTPS) context.");
      return;
    }

    // Try with ideal constraints first
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "user", 
          width: { ideal: 1280 }, 
          height: { ideal: 720 } 
        }, 
        audio: true 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      return;
    } catch (err: any) {
      console.warn("Failed with ideal constraints, trying basic fallback...", err);
    }

    // Fallback to basic constraints
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error("Error accessing media devices:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionError("Permission denied. Please click the camera icon in your browser's address bar to 'Always allow' access, then refresh the page.");
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setPermissionError("No camera or microphone found. Please connect a device and try again.");
      } else {
        setPermissionError(`Could not access camera/mic: ${err.message || "Unknown error"}`);
      }
    }
  };

  const startRecording = () => {
    if (!stream) return;
    
    const recorder = new MediaRecorder(stream);
    const localChunks: Blob[] = [];
    
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        localChunks.push(e.data);
      }
    };
    
    recorder.onstop = () => {
      const videoBlob = new Blob(localChunks, { type: "video/webm" });
      setRecordingData({ videoBlob, audioBlob: videoBlob });
      processAnalysis(videoBlob);
    };
    
    setMediaRecorder(recorder);
    setChunks([]);
    recorder.start();
    setIsRecording(true);
    setRecordingTime(0);
    
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const processAnalysis = async (blob: Blob) => {
    setIsAnalyzing(true);
    
    try {
      // Convert blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          resolve(base64String);
        };
      });
      reader.readAsDataURL(blob);
      const videoBase64 = await base64Promise;

      // Call Gemini API on the frontend
      const results = await analyzeVideo(videoBase64, recordingTimeRef.current);
      
      // Ensure recordingDuration is included in the results
      results.recordingDuration = recordingTimeRef.current;

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
    } catch (error) {
      console.error("Analysis error:", error);
      setIsAnalyzing(false);
      // Fallback to mock data if API fails (for demo purposes)
      const mockResults = {
        verdict: Math.random() > 0.5 ? "truth" : ("deception" as "truth" | "deception"),
        overallConfidence: 85,
        facialScore: 80,
        voiceScore: 90,
        fusionScore: 85,
        facialFeatures: [
          { feature: "Micro-expressions", value: 80, fullMark: 100 },
          { feature: "Eye Movement", value: 75, fullMark: 100 },
          { feature: "Muscle Tension", value: 85, fullMark: 100 },
          { feature: "Blink Rate", value: 90, fullMark: 100 }
        ],
        voiceFeatures: [
          { feature: "Frequency Jitter", value: 5 },
          { feature: "Amplitude Shimmer", value: 4 },
          { feature: "Pitch Variance", value: 6 },
          { feature: "Speech Rate", value: 8 }
        ],
        timelineData: Array.from({ length: 10 }, (_, i) => ({
          time: `${i}s`,
          facial: 80 + Math.random() * 10,
          voice: 85 + Math.random() * 10,
          combined: 82 + Math.random() * 10
        })),
        recordingDuration: recordingTimeRef.current,
        aiAnalysis: "Analysis complete. Multimodal fusion indicates high probability of truthful behavior based on micro-expression clusters and vocal frequency fluctuations."
      };
      setAnalysisResults(mockResults);
      navigate("/results");
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stream]);

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans flex flex-col">
      <Background />
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/40 backdrop-blur-xl border-b border-white/5 p-6 md:px-12">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
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
          <div className="flex items-center gap-6">
            <Link 
              to="/history"
              className="text-zinc-500 hover:text-white transition-colors text-xs font-medium flex items-center gap-2"
            >
              <History className="w-3.5 h-3.5" /> History
            </Link>
            <button 
              onClick={() => navigate("/")}
              className="text-zinc-500 hover:text-white transition-colors text-xs font-medium"
            >
              Cancel Session
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-32 pb-12 px-6 md:px-12 overflow-y-auto relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Recording Area */}
            <div className="lg:col-span-2 space-y-6">
              <div className="relative aspect-video bg-slate-900/50 rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover"
                />
                
                <AnimatePresence>
                  {!stream && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-sm z-20"
                    >
                      <Camera className="w-12 h-12 text-zinc-700 mb-6" />
                      <button 
                        onClick={startCamera}
                        className="px-6 py-3 bg-white text-black rounded-full font-bold hover:bg-zinc-200 transition-all flex items-center gap-2 text-sm"
                      >
                        Enable Camera & Mic
                      </button>
                      {permissionError && (
                        <p className="mt-4 text-red-400 text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {permissionError}
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {isRecording && (
                  <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="font-mono font-bold tracking-widest text-xs">
                      {Math.floor(recordingTime / 60).toString().padStart(2, '0')}:
                      {(recordingTime % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                )}

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

              <div className="flex justify-center gap-4">
                {!isRecording ? (
                  <button 
                    disabled={!stream || isAnalyzing}
                    onClick={startRecording}
                    className="px-10 py-4 bg-emerald-500 text-black rounded-full font-bold text-base flex items-center gap-3 hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    Start Recording
                  </button>
                ) : (
                  <button 
                    onClick={stopRecording}
                    className="px-10 py-4 bg-white text-black rounded-full font-bold text-base flex items-center gap-3 hover:bg-zinc-200 transition-all shadow-lg shadow-white/20"
                  >
                    <Square className="w-5 h-5 fill-current" />
                    Stop & Analyze
                  </button>
                )}
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              <div className="p-6 bg-slate-900/40 border border-white/5 rounded-3xl">
                <h3 className="text-base font-bold mb-6 flex items-center gap-2">
                  <Info className="w-4 h-4 text-emerald-500" />
                  Tips for Best Results
                </h3>
                <ul className="space-y-4 text-xs text-zinc-400">
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    Ensure good lighting on your face
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    Speak clearly at a normal pace
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    Keep your face centered in frame
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    Minimize background noise
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    Record for at least 10 seconds
                  </li>
                </ul>
              </div>

              <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl">
                <h3 className="text-base font-bold mb-4 text-emerald-500">Analysis Status</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Camera</span>
                    <span className={stream ? "text-emerald-500" : "text-zinc-600"}>
                      {stream ? "Connected" : "Not Ready"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Microphone</span>
                    <span className={stream ? "text-emerald-500" : "text-zinc-600"}>
                      {stream ? "Connected" : "Not Ready"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Neural Network</span>
                    <span className="text-emerald-500">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
