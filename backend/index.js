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
  const timer = timers[id];
  if (!timer) return res.status(400).json({ error: 'Timer not started' });
  timer.stop = Date.now();
  // TODO: handle voice note and speech-to-text transcription
  res.json({ status: 'stopped', client: id, start: timer.start, stop: timer.stop });
});

app.post('/notes', (req, res) => {
  const { text } = req.body; // placeholder for speech-to-text result
  notes.push({ text, time: Date.now() });
  res.json({ status: 'noted' });
});

app.get('/summary', (req, res) => {
  // TODO: integrate with AI service to summarize weekly entries
  res.json({ timers, notes });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
