const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory storage
const activeTimers = {};
const timers = [];
const notes = [];

async function transcribeAudio(audioData) {
  // Placeholder for real speech-to-text processing
  // `audioData` could be a base64 string or binary buffer in a real app
  return 'Transcription placeholder';
}

app.post('/clients/:id/start', (req, res) => {
  const { id } = req.params;
  activeTimers[id] = { start: Date.now(), client: id };
  res.json({ status: 'started', client: id });
});

app.post('/clients/:id/stop', async (req, res) => {
  const { id } = req.params;
  const { note, audio } = req.body;
  const timer = activeTimers[id];
  if (!timer) return res.status(400).json({ error: 'Timer not started' });
  timer.stop = Date.now();

  let text = note;
  if (!text && audio) {
    try {
      text = await transcribeAudio(audio);
    } catch (err) {
      console.error('Failed to transcribe audio', err);
    }
  }

  const entry = { client: id, start: timer.start, stop: timer.stop };
  if (text) {
    entry.transcription = text;
    notes.push({ text, time: timer.stop, client: id });
  }
  timers.push(entry);
  delete activeTimers[id];

  res.json({ status: 'stopped', ...entry });
});

app.post('/notes', (req, res) => {
  const { text } = req.body; // placeholder for speech-to-text result
  notes.push({ text, time: Date.now() });
  res.json({ status: 'noted' });
});

async function summarizeWeek(entries) {
  if (!process.env.OPENAI_API_KEY) {
    return 'AI summary placeholder';
  }
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Summarize the following time entries' },
        { role: 'user', content: JSON.stringify(entries) },
      ],
    }),
  });
  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'Failed to generate summary';
}

app.get('/summary', async (req, res) => {
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentTimers = timers.filter((t) => t.stop >= oneWeekAgo);
  const recentNotes = notes.filter((n) => n.time >= oneWeekAgo);
  const entries = { timers: recentTimers, notes: recentNotes };
  const summary = await summarizeWeek(entries);
  res.json({ summary, entries });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
