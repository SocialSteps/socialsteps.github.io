import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// Proxy for Nvidia API BEFORE body parser to handle SSE streams flawlessly
app.use('/api/nvidia', createProxyMiddleware({
  target: 'https://integrate.api.nvidia.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api/nvidia': '',
  },
}));

// Proxy for Piper TTS API BEFORE body parser so POST body streams properly
app.use('/api/tts', createProxyMiddleware({
  target: 'http://localhost:5000',
  changeOrigin: true,
  pathRewrite: {
    '^/api/tts': '',
  },
}));

app.use(express.json());

// Set up SQLite Database
const db = new sqlite3.Database(path.join(__dirname, 'profiles.db'), (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Connected to SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS profiles (
      passwordKey TEXT PRIMARY KEY,
      name TEXT,
      age TEXT,
      likes TEXT,
      strengths TEXT,
      weaknesses TEXT,
      animal TEXT,
      color TEXT,
      notes TEXT,
      createdAt TEXT
    )`);
  }
});

app.post('/api/profiles/login', (req, res) => {
  const { passwordKey } = req.body;
  if (!passwordKey) return res.status(400).json({ error: 'Missing passwordKey' });
  
  db.get('SELECT * FROM profiles WHERE passwordKey = ?', [passwordKey], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Profile not found' });
    res.json(row);
  });
});

app.post('/api/profiles/register', (req, res) => {
  const { passwordKey, name, age, likes, strengths, weaknesses, animal, color, notes, createdAt } = req.body;
  if (!passwordKey) return res.status(400).json({ error: 'Missing passwordKey' });
  
  const stmt = db.prepare(`INSERT OR REPLACE INTO profiles 
    (passwordKey, name, age, likes, strengths, weaknesses, animal, color, notes, createdAt) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    
  stmt.run(
    [passwordKey, name, age, likes, strengths, weaknesses, animal, color, notes || '', createdAt || new Date().toISOString()],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      
      db.get('SELECT * FROM profiles WHERE passwordKey = ?', [passwordKey], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
      });
    }
  );
  stmt.finalize();
});

app.put('/api/profiles/:passwordKey', (req, res) => {
  const { passwordKey } = req.params;
  const { notes } = req.body;
  
  db.run('UPDATE profiles SET notes = ? WHERE passwordKey = ?', [notes, passwordKey], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Profile not found' });
    res.json({ success: true });
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
