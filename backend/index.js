const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory storage
const timers = {};
const notes = [];

app.post('/clients/:id/start', (req, res) => {
  const { id } = req.params;
  timers[id] = { start: Date.now() };
  res.json({ status: 'started', client: id });
});

app.post('/clients/:id/stop', (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const timer = timers[id];
  if (!timer) return res.status(400).json({ error: 'Timer not started' });
  timer.stop = Date.now();
  if (text) notes.push({ text, time: timer.stop, client: id });
  res.json({ status: 'stopped', client: id, start: timer.start, stop: timer.stop });
});

app.post('/notes', (req, res) => {
  const { text } = req.body; // placeholder for speech-to-text result
  notes.push({ text, time: Date.now() });
  res.json({ status: 'noted' });
});

app.get('/summary', (req, res) => {
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  const since = Date.now() - oneWeek;

  const timersInRange = Object.entries(timers)
    .map(([client, t]) => ({ client, ...t }))
    .filter(t => t.stop && t.stop >= since);

  const notesInRange = notes.filter(n => n.time >= since);

  const summary = timersInRange.reduce((acc, { client, start, stop }) => {
    const dur = stop - start;
    acc[client] = (acc[client] || 0) + dur;
    return acc;
  }, {});

  res.json({ summary, timers: timersInRange, notes: notesInRange });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
