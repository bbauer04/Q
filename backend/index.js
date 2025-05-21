const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./timetracker.db', (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS timers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client TEXT NOT NULL,
      start_time INTEGER NOT NULL,
      end_time INTEGER NOT NULL
    )
  `, (err) => {
    if (err) {
      console.error('Error creating timers table:', err.message);
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client TEXT NOT NULL,
      text TEXT NOT NULL,
      timestamp INTEGER NOT NULL
    )
  `, (err) => {
    if (err) {
      console.error('Error creating notes table:', err.message);
    }
  });
});

// In-memory storage
const activeTimers = {};
// const timers = []; // Replaced by DB
// const notes = []; // Replaced by DB

// Helper function to get recent timers from DB
function getRecentTimersFromDB(db, oneWeekAgo) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT client, start_time AS start, end_time AS stop FROM timers WHERE end_time >= ?`;
    db.all(sql, [oneWeekAgo], (err, rows) => {
      if (err) {
        console.error('Error fetching recent timers:', err.message);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Helper function to get recent notes from DB
function getRecentNotesFromDB(db, oneWeekAgo) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT client, text, timestamp AS time FROM notes WHERE timestamp >= ?`;
    db.all(sql, [oneWeekAgo], (err, rows) => {
      if (err) {
        console.error('Error fetching recent notes:', err.message);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

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

  db.run(
    `INSERT INTO timers (client, start_time, end_time) VALUES (?, ?, ?)`,
    [id, timer.start, timer.stop],
    function (err) {
      if (err) {
        console.error('Error inserting timer into database:', err.message);
        return res.status(500).json({ error: 'Failed to save timer.' });
      }
      // Timer insertion successful, proceed with note insertion if applicable
      entry.db_timer_id = this.lastID; // Optionally store the new timer ID

      if (text) {
        entry.transcription = text;
        db.run(
          `INSERT INTO notes (client, text, timestamp) VALUES (?, ?, ?)`,
          [id, text, timer.stop],
          function (err) {
            if (err) {
              console.error('Error inserting note into database:', err.message);
              // Timer was saved, but note failed.
              return res.status(500).json({ error: 'Timer saved, but failed to save note.' });
            }
            entry.db_note_id = this.lastID; // Optionally store the new note ID
            delete activeTimers[id];
            return res.json({ status: 'stopped', ...entry });
          }
        );
      } else {
        // No note to insert, timer saved successfully
        delete activeTimers[id];
        return res.json({ status: 'stopped', ...entry });
      }
    }
  );
  // The response is now handled within the callbacks
});

app.post('/notes', (req, res) => {
  const { text } = req.body; // placeholder for speech-to-text result
  const client = "__GENERAL__"; // Predefined client ID for general notes
  const timestamp = Date.now();

  db.run(
    `INSERT INTO notes (client, text, timestamp) VALUES (?, ?, ?)`,
    [client, text, timestamp],
    function (err) {
      if (err) {
        console.error('Error inserting general note into database:', err.message);
        return res.status(500).json({ error: 'Failed to save note.' });
      }
      // notes.push({ text, time: Date.now() }); // Replaced by DB insert
      return res.json({ status: 'noted', db_note_id: this.lastID }); // Optionally include new note ID
    }
  );
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
  let recentTimers, recentNotes;

  try {
    recentTimers = await getRecentTimersFromDB(db, oneWeekAgo);
    recentNotes = await getRecentNotesFromDB(db, oneWeekAgo);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch data for summary.' });
  }

  const entries = { timers: recentTimers, notes: recentNotes };
  const summary = await summarizeWeek(entries);
  res.json({ summary, entries });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
