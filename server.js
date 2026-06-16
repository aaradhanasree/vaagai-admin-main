require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const port = process.env.PORT || 3000;

// Admin password - set in .env or use default for first setup
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync('admin123', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'vaagai-admin-secret-change-in-production';

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// --- File paths ---
const DATA_DIR = path.join(__dirname, 'data');
const PROGRAMS_FILE = path.join(DATA_DIR, 'programs.json');
const GALLERY_FILE = path.join(DATA_DIR, 'gallery.json');
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');
const IMG_DIR = path.join(__dirname, 'img');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// --- Multer config for image uploads ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, IMG_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        if (!allowed.includes(ext)) {
            return cb(new Error('Only image files are allowed'));
        }
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        const uniqueName = Date.now() + '-' + safeName;
        cb(null, uniqueName);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// --- Helper: read/write JSON ---
function readJSON(filePath) {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch {
        return [];
    }
}

function writeJSON(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// --- Auth middleware ---
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    try {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
}

// --- Admin Auth ---
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body || {};
    if (!password) {
        return res.status(400).json({ success: false, message: 'Password is required' });
    }
    if (bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)) {
        const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '4h' });
        return res.json({ success: true, token });
    }
    return res.status(401).json({ success: false, message: 'Invalid password' });
});

// --- Public APIs ---
app.get('/api/programs', (req, res) => {
    const programs = readJSON(PROGRAMS_FILE);
    res.json(programs);
});

app.get('/api/gallery', (req, res) => {
    const gallery = readJSON(GALLERY_FILE);
    res.json(gallery);
});

// --- Admin: Programs CRUD ---
app.post('/api/admin/programs', authMiddleware, upload.single('image'), (req, res) => {
    const programs = readJSON(PROGRAMS_FILE);
    const { title, titleTa, description, descriptionTa, category } = req.body;
    if (!title || !description || !category) {
        return res.status(400).json({ success: false, message: 'Title, description & category required' });
    }
    const newId = programs.length > 0 ? Math.max(...programs.map(p => p.id)) + 1 : 1;
    const program = {
        id: newId,
        title,
        titleTa: titleTa || '',
        description,
        descriptionTa: descriptionTa || '',
        category,
        image: req.file ? 'img/' + req.file.filename : ''
    };
    programs.push(program);
    writeJSON(PROGRAMS_FILE, programs);
    res.json({ success: true, program });
});

app.put('/api/admin/programs/:id', authMiddleware, upload.single('image'), (req, res) => {
    const programs = readJSON(PROGRAMS_FILE);
    const id = parseInt(req.params.id);
    const index = programs.findIndex(p => p.id === id);
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Program not found' });
    }
    const { title, titleTa, description, descriptionTa, category } = req.body;
    if (title) programs[index].title = title;
    if (titleTa !== undefined) programs[index].titleTa = titleTa;
    if (description) programs[index].description = description;
    if (descriptionTa !== undefined) programs[index].descriptionTa = descriptionTa;
    if (category) programs[index].category = category;
    if (req.file) programs[index].image = 'img/' + req.file.filename;
    writeJSON(PROGRAMS_FILE, programs);
    res.json({ success: true, program: programs[index] });
});

app.delete('/api/admin/programs/:id', authMiddleware, (req, res) => {
    let programs = readJSON(PROGRAMS_FILE);
    const id = parseInt(req.params.id);
    const program = programs.find(p => p.id === id);
    if (!program) {
        return res.status(404).json({ success: false, message: 'Program not found' });
    }
    programs = programs.filter(p => p.id !== id);
    writeJSON(PROGRAMS_FILE, programs);
    res.json({ success: true, message: 'Program deleted' });
});

// --- Admin: Gallery CRUD ---
app.post('/api/admin/gallery', authMiddleware, (req, res) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(413).json({ success: false, message: 'File too large. Maximum size is 5MB.' });
            }
            return res.status(400).json({ success: false, message: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Image file is required' });
        }
        const gallery = readJSON(GALLERY_FILE);
        const imagePath = 'img/' + req.file.filename;
        gallery.push(imagePath);
        writeJSON(GALLERY_FILE, gallery);
        res.json({ success: true, image: imagePath });
    });
});

app.delete('/api/admin/gallery', authMiddleware, (req, res) => {
    const { image } = req.body;
    if (!image) {
        return res.status(400).json({ success: false, message: 'Image path is required' });
    }
    let gallery = readJSON(GALLERY_FILE);
    gallery = gallery.filter(img => img !== image);
    writeJSON(GALLERY_FILE, gallery);
    res.json({ success: true, message: 'Image removed from gallery' });
});

// --- Public API: Events ---
app.get('/api/events', (req, res) => {
    const events = readJSON(EVENTS_FILE);
    res.json(events);
});

// --- Admin: Events CRUD ---
app.post('/api/admin/events', authMiddleware, (req, res) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(413).json({ success: false, message: 'File too large. Maximum size is 5MB.' });
            }
            return res.status(400).json({ success: false, message: err.message });
        }
        const { title, date } = req.body;
        if (!title || !date) {
            return res.status(400).json({ success: false, message: 'Title and date are required' });
        }
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Event poster image is required' });
        }
        const events = readJSON(EVENTS_FILE);
        const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
        const event = {
            id: newId,
            title,
            date,
            image: 'img/' + req.file.filename
        };
        events.push(event);
        writeJSON(EVENTS_FILE, events);
        res.json({ success: true, event });
    });
});

app.put('/api/admin/events/:id', authMiddleware, (req, res) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(413).json({ success: false, message: 'File too large. Maximum size is 5MB.' });
            }
            return res.status(400).json({ success: false, message: err.message });
        }
        const events = readJSON(EVENTS_FILE);
        const id = parseInt(req.params.id);
        const index = events.findIndex(e => e.id === id);
        if (index === -1) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        const { title, date } = req.body;
        if (title) events[index].title = title;
        if (date) events[index].date = date;
        if (req.file) events[index].image = 'img/' + req.file.filename;
        writeJSON(EVENTS_FILE, events);
        res.json({ success: true, event: events[index] });
    });
});

app.delete('/api/admin/events/:id', authMiddleware, (req, res) => {
    let events = readJSON(EVENTS_FILE);
    const id = parseInt(req.params.id);
    const event = events.find(e => e.id === id);
    if (!event) {
        return res.status(404).json({ success: false, message: 'Event not found' });
    }
    events = events.filter(e => e.id !== id);
    writeJSON(EVENTS_FILE, events);
    res.json({ success: true, message: 'Event deleted' });
});

// Database config - uses environment variables from .env
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
};

app.get('/api/test_connection', async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.end();
    res.json({ success: true, message: 'Connected to database' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Name, email and message are required.' });
  }

  try {
    const conn = await mysql.createConnection(dbConfig);
    const sql = 'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)';
    const [result] = await conn.execute(sql, [name, email, subject || '', message]);
    await conn.end();

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Vaagai backend running on http://localhost:${port}`);
  });
} else {
  module.exports = app;
}
