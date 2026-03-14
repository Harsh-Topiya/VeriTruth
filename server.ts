import express from "express";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from "dotenv";
import Database from "better-sqlite3";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Database
const db = new Database("veritruth.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    verdict TEXT,
    overallConfidence REAL,
    facialScore REAL,
    voiceScore REAL,
    fusionScore REAL,
    facialConfidence REAL,
    speechClarity REAL,
    eyeContact REAL,
    recordingDuration REAL,
    aiAnalysis TEXT,
    fullResults TEXT
  )
`);

// Ensure new columns exist for existing databases
try {
  db.exec("ALTER TABLE sessions ADD COLUMN facialConfidence REAL");
} catch (e) {}
try {
  db.exec("ALTER TABLE sessions ADD COLUMN speechClarity REAL");
} catch (e) {}
try {
  db.exec("ALTER TABLE sessions ADD COLUMN eyeContact REAL");
} catch (e) {}
try {
  db.exec("ALTER TABLE sessions ADD COLUMN recordingDuration REAL");
} catch (e) {}

const app = express();
const PORT = 3000;

// Increase body limit for video uploads
app.use(express.json({ limit: '50mb' }));

// API Routes
app.post("/api/sessions/save", (req, res) => {
  try {
    const results = req.body;
    
    const stmt = db.prepare(`
      INSERT INTO sessions (verdict, overallConfidence, facialScore, voiceScore, fusionScore, facialConfidence, speechClarity, eyeContact, recordingDuration, aiAnalysis, fullResults)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      results.verdict,
      results.overallConfidence,
      results.facialScore,
      results.voiceScore,
      results.fusionScore,
      results.facialConfidence,
      results.speechClarity,
      results.eyeContact,
      results.recordingDuration,
      results.aiAnalysis,
      JSON.stringify(results)
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Database save error:", error);
    res.status(500).json({ error: "Failed to save session" });
  }
});

// History Endpoints
app.get("/api/sessions", (req, res) => {
  try {
    const sessions = db.prepare("SELECT id, strftime('%Y-%m-%dT%H:%M:%SZ', timestamp) as timestamp, verdict, overallConfidence, facialScore, voiceScore, fusionScore, facialConfidence, speechClarity, eyeContact, recordingDuration, aiAnalysis, fullResults FROM sessions ORDER BY timestamp DESC").all();
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

app.get("/api/sessions/:id", (req, res) => {
  try {
    const session = db.prepare("SELECT id, strftime('%Y-%m-%dT%H:%M:%SZ', timestamp) as timestamp, verdict, overallConfidence, facialScore, voiceScore, fusionScore, facialConfidence, speechClarity, eyeContact, recordingDuration, aiAnalysis, fullResults FROM sessions WHERE id = ?").get(req.params.id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch session" });
  }
});

app.delete("/api/sessions/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM sessions WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete session" });
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
