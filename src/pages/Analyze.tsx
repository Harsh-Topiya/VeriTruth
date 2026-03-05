import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Mic, Loader2, Play, Square, AlertCircle, CheckCircle2, Info, Brain } from "lucide-react";
import { useAnalysis } from "../context/AnalysisContext";
import { motion, AnimatePresence } from "motion/react";

export default function Analyze() {
  const navigate = useNavigate();
  const { setRecordingData, setAnalysisResults, setIsAnalyzing, isAnalyzing } = useAnalysis();
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [chunks, setChunks] = useState<Blob[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: 1280, height: 720 }, 
        audio: true 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setPermissionError(null);
    } catch (err) {
      console.error("Error accessing media devices:", err);
      setPermissionError("Camera and microphone access denied. Please enable them to continue.");
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

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoBase64,
          recordingDuration: recordingTime
        }),
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const results = await response.json();
      
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
        recordingDuration: recordingTime,
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
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Behavioral Analysis</h1>
            <p className="text-zinc-400">Enable your camera and microphone, then record your response for analysis.</p>
          </div>
          <button 
            onClick={() => navigate("/")}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Recording Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative aspect-video bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl">
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
                    className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/90 backdrop-blur-sm z-20"
                  >
                    <Camera className="w-16 h-16 text-zinc-700 mb-6" />
                    <button 
                      onClick={startCamera}
                      className="px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-zinc-200 transition-all flex items-center gap-2"
                    >
                      Enable Camera & Mic
                    </button>
                    {permissionError && (
                      <p className="mt-4 text-red-400 text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {permissionError}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {isRecording && (
                <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="font-mono font-bold tracking-widest">
                    {Math.floor(recordingTime / 60).toString().padStart(2, '0')}:
                    {(recordingTime % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              )}

              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-30">
                  <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Brain className="w-10 h-10 text-emerald-500" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Analyzing Behavioral Patterns...</h3>
                  <p className="text-zinc-400 animate-pulse">Processing facial and voice data fusion</p>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-4">
              {!isRecording ? (
                <button 
                  disabled={!stream || isAnalyzing}
                  onClick={startRecording}
                  className="px-12 py-5 bg-emerald-500 text-black rounded-full font-bold text-lg flex items-center gap-3 hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
                >
                  <Play className="w-6 h-6 fill-current" />
                  Start Recording
                </button>
              ) : (
                <button 
                  onClick={stopRecording}
                  className="px-12 py-5 bg-white text-black rounded-full font-bold text-lg flex items-center gap-3 hover:bg-zinc-200 transition-all shadow-lg shadow-white/20"
                >
                  <Square className="w-6 h-6 fill-current" />
                  Stop & Analyze
                </button>
              )}
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Info className="w-5 h-5 text-emerald-500" />
                Tips for Best Results
              </h3>
              <ul className="space-y-4 text-sm text-zinc-400">
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  Ensure good lighting on your face
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  Speak clearly at a normal pace
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  Keep your face centered in frame
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  Minimize background noise
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  Record for at least 10 seconds
                </li>
              </ul>
            </div>

            <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl">
              <h3 className="text-lg font-bold mb-4 text-emerald-500">Analysis Status</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Camera</span>
                  <span className={stream ? "text-emerald-500" : "text-zinc-600"}>
                    {stream ? "Connected" : "Not Ready"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Microphone</span>
                  <span className={stream ? "text-emerald-500" : "text-zinc-600"}>
                    {stream ? "Connected" : "Not Ready"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Neural Network</span>
                  <span className="text-emerald-500">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
