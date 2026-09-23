import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3002;
const DB_PATH = path.join(__dirname, 'db.json');

// ─── Middleware ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '50mb' }));
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (_req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ─── DB helpers ────────────────────────────────────────────────────────────
interface DB {
  responses: any[];
  settings: any;
}

function readDB(): DB {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const init: DB = { responses: [], settings: {} };
      fs.writeFileSync(DB_PATH, JSON.stringify(init, null, 2));
      return init;
    }
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch (e) {
    console.error('DB read error:', e);
    return { responses: [], settings: {} };
  }
}

function writeDB(data: DB) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function generateRefId(): string {
  const db = readDB();
  const year = new Date().getFullYear();
  const maxId = db.responses.reduce((max: number, r: any) => {
    const m = r.id?.match(/JOK-\d+-(\d+)/);
    return m ? Math.max(max, parseInt(m[1])) : max;
  }, 1000);
  return `JOK-${year}-${maxId + 1}`;
}

// ─── Routes ───────────────────────────────────────────────────────────────

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET all responses
app.get('/api/responses', (_req, res) => {
  const db = readDB();
  res.json(db.responses.sort((a: any, b: any) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()));
});

// POST new response (form submission)
app.post('/api/responses', (req, res) => {
  const db = readDB();
  const newResponse = {
    id: generateRefId(),
    submittedAt: new Date().toISOString(),
    status: 'New',
    notes: [],
    ...req.body,
  };
  db.responses.push(newResponse);
  writeDB(db);
  console.log(`✅ New submission: ${newResponse.id} — ${newResponse.submitterName}`);
  res.status(201).json(newResponse);
});

// PATCH response (status update / notes)
app.patch('/api/responses/:id', (req, res) => {
  const db = readDB();
  const idx = db.responses.findIndex((r: any) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Response not found' });
  db.responses[idx] = { ...db.responses[idx], ...req.body };
  writeDB(db);
  res.json(db.responses[idx]);
});

// POST note to response
app.post('/api/responses/:id/notes', (req, res) => {
  const db = readDB();
  const idx = db.responses.findIndex((r: any) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Response not found' });
  const note = {
    id: `note-${Date.now()}`,
    createdAt: new Date().toISOString(),
    author: req.body.author || 'Staff Admin',
    content: req.body.content,
  };
  db.responses[idx].notes = [...(db.responses[idx].notes || []), note];
  writeDB(db);
  res.json(db.responses[idx]);
});

// DELETE single response
app.delete('/api/responses/:id', (req, res) => {
  const db = readDB();
  const initialLen = db.responses.length;
  db.responses = db.responses.filter((r: any) => r.id !== req.params.id);
  if (db.responses.length === initialLen) {
    return res.status(404).json({ error: 'Response not found' });
  }
  writeDB(db);
  res.json({ success: true, deletedId: req.params.id });
});

// DELETE all responses (Clear all)
app.delete('/api/responses', (_req, res) => {
  const db = readDB();
  db.responses = [];
  writeDB(db);
  console.log('🗑️ All responses cleared');
  res.json({ success: true, message: 'All responses cleared' });
});

// GET settings
app.get('/api/settings', (_req, res) => {
  const db = readDB();
  res.json(db.settings);
});

// PUT settings
app.put('/api/settings', (req, res) => {
  const db = readDB();
  db.settings = { ...db.settings, ...req.body };
  writeDB(db);
  res.json(db.settings);
});

// DELETE response
app.delete('/api/responses/:id', (req, res) => {
  const db = readDB();
  const before = db.responses.length;
  db.responses = db.responses.filter((r: any) => r.id !== req.params.id);
  if (db.responses.length === before) return res.status(404).json({ error: 'Not found' });
  writeDB(db);
  res.json({ success: true });
});

// ─── Start ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🏠 Jokdel Royal API Server running at http://localhost:${PORT}`);
  console.log(`   DB file: ${DB_PATH}\n`);
});
