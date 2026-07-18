/**
 * Lightweight wedding CMS backend.
 *
 * - Serves the static site from /public
 * - Stores uploaded images in /uploads (via Multer)
 * - Stores text content in data.json (no database)
 * - Protects the admin panel + write APIs with a simple cookie session
 *
 * API:
 *   GET  /get-content     -> public: returns current merged content (defaults + saved)
 *   POST /update-text     -> admin: body = full content object -> saved to data.json
 *   POST /upload-image    -> admin: multipart field "image" -> returns { url }
 *   POST /admin-login     -> admin: body { user, pass } -> sets session cookie
 *   POST /admin-logout    -> admin: clears session
 *   GET  /admin-status    -> admin: { authed: true } or 401
 *   GET  /admin           -> login page (unauthed) or admin panel (authed)
 *
 * Credentials are read from the ADMIN_USER / ADMIN_PASS environment variables.
 */

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const multer = require('multer');
const { DEFAULT_DATA } = require('./public/data.js');

const app = express();
const PORT = process.env.PORT || 3000;

const PUBLIC_DIR = path.join(__dirname, 'public');
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const DATA_FILE = path.join(__dirname, 'data.json');

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

/* ---------- admin auth ---------- */

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';
if (!process.env.ADMIN_PASS) {
  console.warn('[SECURITY] Using default admin password. Set the ADMIN_PASS env var for production!');
}

const SALT = crypto.randomBytes(16);
const SESSION_TTL = 1000 * 60 * 60 * 8; // 8 hours
const SESSIONS = new Map(); // token -> { user, expires }

function hashPass(p) {
  return crypto.scryptSync(p, SALT, 64).toString('hex');
}
const ADMIN_PASS_HASH = hashPass(ADMIN_PASS);

function parseCookies(req) {
  const out = {};
  const raw = req.headers.cookie;
  if (!raw) return out;
  raw.split(';').forEach((c) => {
    const i = c.indexOf('=');
    if (i === -1) return;
    const k = c.slice(0, i).trim();
    const v = c.slice(i + 1).trim();
    out[k] = decodeURIComponent(v);
  });
  return out;
}

function isAuthed(req) {
  const token = parseCookies(req).admin_session;
  if (!token) return false;
  const s = SESSIONS.get(token);
  if (!s) return false;
  if (s.expires < Date.now()) {
    SESSIONS.delete(token);
    return false;
  }
  return true;
}

function requireAuth(req, res, next) {
  if (isAuthed(req)) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

function setSessionCookie(res, token) {
  const secure = process.env.NODE_ENV === 'production';
  res.cookie('admin_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL,
    secure
  });
}

/* ---------- content helpers ---------- */

function getContent() {
  let stored = {};
  try {
    if (fs.existsSync(DATA_FILE)) {
      stored = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) || {};
    }
  } catch (e) {
    console.error('Failed to read data.json:', e.message);
  }
  const merged = JSON.parse(JSON.stringify(DEFAULT_DATA));
  for (const key in stored) {
    if (
      typeof stored[key] === 'object' &&
      stored[key] !== null &&
      !Array.isArray(stored[key])
    ) {
      merged[key] = { ...merged[key], ...stored[key] };
    } else {
      merged[key] = stored[key];
    }
  }
  return merged;
}

function saveContent(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

/* ---------- image upload (Multer) ---------- */

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
  'image/svg+xml'
]);

const EXT_BY_MIME = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/avif': '.avif',
  'image/svg+xml': '.svg'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = EXT_BY_MIME[file.mimetype] || '.bin';
    // Generated name avoids user-supplied paths (path traversal) and odd chars.
    const safe = Date.now() + '-' + Math.random().toString(36).slice(2, 8) + ext;
    cb(null, safe);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed.'));
  }
});

/* ---------- middleware ---------- */

app.use(express.json({ limit: '1mb' }));

// Prevent bypassing the login by hitting /admin.html directly.
app.use((req, res, next) => {
  if (req.path === '/admin.html') return res.redirect('/admin');
  next();
});

app.use(express.static(PUBLIC_DIR));
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '1d' }));

/* ---------- auth routes ---------- */

app.get('/admin', (req, res) => {
  if (!isAuthed(req)) return res.sendFile(path.join(PUBLIC_DIR, 'login.html'));
  res.sendFile(path.join(PUBLIC_DIR, 'admin.html'));
});

app.get('/admin-status', (req, res) => {
  if (isAuthed(req)) return res.json({ authed: true });
  res.status(401).json({ authed: false });
});

app.post('/admin-login', (req, res) => {
  const { user, pass } = req.body || {};
  const userOk = user === ADMIN_USER;
  const passOk = pass && crypto.timingSafeEqual(
    Buffer.from(hashPass(pass), 'hex'),
    Buffer.from(ADMIN_PASS_HASH, 'hex')
  );
  console.log(`[login] user=${JSON.stringify(user)} userOk=${userOk} passOk=${!!passOk}`);
  if (userOk && passOk) {
    const token = crypto.randomBytes(32).toString('hex');
    SESSIONS.set(token, { user, expires: Date.now() + SESSION_TTL });
    setSessionCookie(res, token);
    return res.json({ ok: true });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

app.post('/admin-logout', (req, res) => {
  const token = parseCookies(req).admin_session;
  if (token) SESSIONS.delete(token);
  res.clearCookie('admin_session', { path: '/' });
  res.json({ ok: true });
});

/* ---------- content routes (write ops require auth) ---------- */

app.get('/get-content', (req, res) => {
  res.json(getContent());
});

app.post('/update-text', requireAuth, (req, res) => {
  try {
    const data = req.body;
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid payload' });
    }
    saveContent(data);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/upload-image', requireAuth, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No image file provided.' });
    res.json({ ok: true, url: '/uploads/' + req.file.filename });
  });
});

/* ---------- error handler ---------- */

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  res.status(400).json({ error: err.message || 'Upload error' });
});

app.listen(PORT, () => {
  console.log(`Wedding CMS running at http://localhost:${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin`);
});
