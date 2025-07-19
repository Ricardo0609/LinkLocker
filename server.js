const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');

const app = express();
const db = new Database('videos.db');

app.use(cors());
app.use(express.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
db.prepare(`
  CREATE TABLE IF NOT EXISTS videos (
    id TEXT PRIMARY KEY,
    titulo TEXT,
    canal TEXT,
    link TEXT,
    apartadoId TEXT
  )
`).run();

app.post('/api/videos', (req, res) => {
  const { id, titulo, canal, link, apartadoId } = req.body;
  const stmt = db.prepare('INSERT INTO videos (id, titulo, canal, link, apartadoId) VALUES (?, ?, ?, ?, ?)');
  try {
    stmt.run(id, titulo, canal, link, apartadoId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar en la base de datos', detail: err.message });
  }
});

app.get('/api/videos', (req, res) => {
  const videos = db.prepare('SELECT * FROM videos').all();
  res.json(videos);
});

app.get('/test-db', (req, res) => {
  try {
    const tablas = db.prepare("SELECT name FROM sqlite_master WHERE type = ?").all('table');
    res.json({ tablas });
  } catch (err) {
    res.status(500).json({ error: 'Error al acceder a la base de datos', detail: err.message });
  }
});

// Ruta principal para index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
