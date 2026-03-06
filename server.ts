import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Increase body limit for video uploads
app.use(express.json({ limit: '50mb' }));

// API Routes
app.post("/api/analyze", async (req, res) => {
  try {
    const { videoBase64, recordingDuration } = req.body;

    if (!videoBase64) {
      return res.status(400).json({ error: "No video data provided" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const systemPrompt = `You are VeriTruth, an advanced AI-powered lie detection system that analyzes facial micro-expressions and voice stress patterns to determine truthfulness.

ANALYSIS PARAMETERS AND RANGES:
- All scores must be between 0-100
- Scores 0-40: Strong indicators of deception
- Scores 41-59: Uncertain/neutral zone
- Scores 60-100: Strong indicators of truthfulness

FACIAL MICRO-EXPRESSION INDICATORS TO ANALYZE:
1. Blink Rate (0-100): Normal blinking suggests truth, excessive/suppressed suggests stress
2. Micro-expressions (0-100): Fleeting expressions that contradict stated emotions
3. Eye Contact (0-100): Appropriate eye contact suggests confidence in statements
4. Lip Tension (0-100): Compressed or tense lips may indicate withholding information
5. Brow Movement (0-100): Asymmetrical or excessive brow movement may suggest deception
6. Facial Symmetry (0-100): Genuine expressions are typically more symmetrical

VOICE STRESS INDICATORS TO ANALYZE:
1. Pitch Variance (0-100): Unusual pitch changes may indicate stress
2. Speech Rate (0-100): Speaking too fast or slow compared to baseline
3. Pause Patterns (0-100): Unnatural pauses before answering
4. Voice Tremor (0-100): Micro-tremors in voice indicating nervousness
5. MFCC Score (0-100): Mel-frequency cepstral coefficients analysis
6. Jitter (0-100): Voice frequency perturbation analysis

VERDICT DETERMINATION:
- Fusion Score = (Facial Score × 0.55) + (Voice Score × 0.45)
- If Fusion Score >= 55: verdict = "truth"
- If Fusion Score < 55: verdict = "deception"
- Overall Confidence = Fusion Score

You must respond with ONLY a valid JSON object (no markdown, no explanation) in this exact format:
{
  "verdict": "truth" or "deception",
  "overallConfidence": number (0-100),
  "facialScore": number (0-100),
  "voiceScore": number (0-100),
  "fusionScore": number (0-100),
  "facialFeatures": [
    {"feature": "Blink Rate", "value": number, "fullMark": 100},
    {"feature": "Micro-expressions", "value": number, "fullMark": 100},
    {"feature": "Eye Contact", "value": number, "fullMark": 100},
    {"feature": "Lip Tension", "value": number, "fullMark": 100},
    {"feature": "Brow Movement", "value": number, "fullMark": 100},
    {"feature": "Facial Symmetry", "value": number, "fullMark": 100}
  ],
  "voiceFeatures": [
    {"feature": "Pitch Variance", "value": number},
    {"feature": "Speech Rate", "value": number},
    {"feature": "Pause Patterns", "value": number},
    {"feature": "Voice Tremor", "value": number},
    {"feature": "MFCC Score", "value": number},
    {"feature": "Jitter", "value": number}
  ],
  "timelineData": [array of {time: "0-5s", facial: number, voice: number, combined: number}],
  "aiAnalysis": "Brief 2-3 sentence analysis explaining the key indicators that led to this verdict"
}`;

    const userPrompt = `Analyze this video recording for signs of truthfulness or deception. The recording is ${recordingDuration} seconds long.

Based on the visible facial expressions, body language, and any audible voice patterns, provide a comprehensive lie detection analysis with specific scores for each parameter.

Generate timeline segments every 5 seconds up to the recording duration.

Remember: ONLY return the JSON object, no other text.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: systemPrompt },
            { text: userPrompt },
            {
              inlineData: {
                mimeType: "video/webm",
                data: videoBase64
              }
            }
          ]
        }
      ]
    });

    let text = response.text || "";
    // Clean up potential markdown
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const results = JSON.parse(text);
    res.json(results);

  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({ error: "Analysis failed" });
  }
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static("dist"));
  app.get("*", (req, res) => {
    res.sendFile("dist/index.html", { root: "." });
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
