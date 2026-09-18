const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

let data = { likes: 0, visits: 0, guestbook: [] };
try {
  data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
} catch (_) { /* first run */ }

function save() {
  try { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2)); } catch (_) {}
}

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'cr7-fan-backend', uptime: process.uptime() });
});

app.get('/api/likes', (req, res) => res.json({ likes: data.likes }));

app.post('/api/likes', (req, res) => {
  data.likes += 1;
  save();
  res.json({ likes: data.likes });
});

app.get('/api/visits', (req, res) => res.json({ visits: data.visits }));

app.post('/api/visits', (req, res) => {
  data.visits += 1;
  save();
  res.json({ visits: data.visits });
});

app.get('/api/guestbook', (req, res) => {
  res.json({ entries: [...data.guestbook].reverse() });
});

app.post('/api/guestbook', (req, res) => {
  const name = String(req.body.name || '익명 팬').trim().slice(0, 30) || '익명 팬';
  const message = String(req.body.message || '').trim().slice(0, 200);
  if (!message) {
    return res.status(400).json({ error: '메시지를 입력해 주세요' });
  }
  const entry = { id: Date.now(), name, message, at: new Date().toISOString() };
  data.guestbook.push(entry);
  if (data.guestbook.length > 200) data.guestbook = data.guestbook.slice(-200);
  save();
  res.status(201).json(entry);
});

app.listen(PORT, () => {
  console.log(`CR7 fan backend listening on port ${PORT}`);
});
