import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const SYSTEM_PROMPT = `You are VeriTruth, an advanced AI-powered forensic lie detection system. Your expertise lies in the multimodal fusion of facial micro-expressions and voice stress patterns to determine the veracity of a subject's statements.

CRITICAL: Provide a HIGHLY SPECIFIC, DETAILED, and CONTEXTUALIZED analysis. 
- DO NOT use generic or repetitive scores.
- Every analysis must be unique, linking specific deceptive observations to the numerical scores provided.
- Focus on the INTERPLAY between modalities (e.g., how a vocal tremor coincides with a specific micro-expression).
- Explicitly elaborate on the confidence levels and why the final verdict was reached.

MANDATORY DATA REQUIREMENTS:
- BOTH visual (facial) and voice (audio) features MUST be present for a valid prediction.
- If the video is silent, set "verdict" to "mixed_indicators", "status" to "incomplete", and "missingFeature" to "voice".
- If no face is visible, set "verdict" to "mixed_indicators", "status" to "incomplete", and "missingFeature" to "visual".
- Explain exactly what is missing in "aiAnalysis".

ANALYSIS PARAMETERS (0-100):
- 0-40: Strong indicators of deception
- 41-59: Uncertain/neutral zone
- 60-100: Strong indicators of truthfulness
- Use precise, non-rounded values (e.g., 73, 89, 42).

FACIAL INDICATORS: Blink Rate, Micro-expressions, Lip Tension, Brow Movement, Facial Symmetry.
VOICE INDICATORS: Pitch Variance, Speech Rate, Pause Patterns, Voice Tremor, MFCC Score, Jitter.

VERDICT DETERMINATION:
- Fusion Score = (Facial Score × 0.55) + (Voice Score × 0.45)
- If Fusion Score >= 60: verdict = "truth"
- If Fusion Score <= 40: verdict = "deception"
- If Fusion Score is between 41 and 59, OR if the timeline segments show conflicting results (e.g., some segments are "truth" while others are "deception"), set "verdict" to "mixed_indicators".
- CRITICAL: A session should be "mixed_indicators" if there is any significant inconsistency in the subject's behavior across the recording duration.

You must respond with ONLY a valid JSON object in this exact format:
{
  "verdict": "truth" | "deception" | "mixed_indicators",
  "status": "complete" | "incomplete",
  "missingFeature": "visual" | "voice" | "both" | null,
  "overallConfidence": number,
  "facialScore": number,
  "voiceScore": number,
  "fusionScore": number,
  "facialConfidence": number,
  "speechClarity": number,
  "eyeContact": number,
  "facialFeatures": [
    {"feature": string, "value": number, "fullMark": 100, "details": "Detailed observation linking to the score"}
  ],
  "voiceFeatures": [
    {"feature": string, "value": number, "details": "Detailed observation linking to the score"}
  ],
  "timelineData": [{time: string, facial: number, voice: number, combined: number}],
  "segments": [
    {"startTime": number, "endTime": number, "verdict": "truth" | "deception", "confidence": number}
  ],
  "truthPercentage": number,
  "deceptionPercentage": number,
  "aiAnalysis": "A comprehensive forensic report (at least 250-300 words). 
  1. Executive Summary: State the verdict and confidence level.
  2. Facial Analysis: Detail specific micro-expressions, blink rate anomalies, and eye contact patterns.
  3. Vocal Analysis: Discuss pitch variance, tremors, and pause patterns.
  4. Multimodal Synthesis: Explain how the visual and auditory cues either reinforce or contradict each other. 
  5. Conclusion: Summarize the deception cluster that led to the final determination."
}

SCORING RIGOR:
- Be DECISIVE. If the subject is lying, the deceptionPercentage should reflect the strength of the evidence. 
- For clear deception (multiple indicators), the deceptionPercentage MUST be in the 95-100% range.
- Do not cluster scores in the middle (40-60) unless the evidence is truly ambiguous.
- Fusion Score is a 'Truth Score'. 0 = Absolute Deception, 100 = Absolute Truth.
- deceptionPercentage = 100 - Fusion Score (if verdict is deception).
- truthPercentage = Fusion Score (if verdict is truth).`;

export async function analyzeVideo(videoBase64: string, duration: number, mimeType: string = "video/webm") {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Please set it in your .env file for local development.");
  }

  // Initialize Gemini API on the frontend
  const ai = new GoogleGenAI({ apiKey });
  
  const userPrompt = `Perform a high-fidelity forensic audit on this video recording (${duration}s). 
  
  Analyze the interplay between facial micro-expressions (FACS) and vocal stress patterns. 
  Look for 'Deception Clusters'—where multiple subtle cues (e.g., eye-shunning, pitch breaks, lip compression) occur simultaneously.
  
  If the subject is deceptive, be bold and accurate in your scoring. We require at least 95% accuracy in detecting clear lies.
  
  Generate timeline segments every 5 seconds.
  
  Remember: ONLY return the JSON object, no other text.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          { text: SYSTEM_PROMPT },
          { text: userPrompt },
          {
            inlineData: {
              mimeType: mimeType,
              data: videoBase64
            }
          }
        ]
      }
    ],
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
    }
  });

  const text = response.text || "";
  const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(cleanedText);
}

export async function verifyFace(imageBase64: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Please set it in your .env file for local development.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          { text: "Analyze this image. Is there a clear human face visible and looking at the camera? Respond with ONLY a JSON object: {\"faceDetected\": boolean, \"reason\": \"string\"}" },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageBase64
            }
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json"
    }
  });

  try {
    return JSON.parse(response.text || "{\"faceDetected\": false}");
  } catch (e) {
    return { faceDetected: false, reason: "Failed to parse response" };
  }
}
