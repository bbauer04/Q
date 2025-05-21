# Time Tracking App

This repository contains a minimal skeleton for a time tracking application.
The app allows you to start and stop timers for different clients, record voice
notes or upload audio, and generate weekly summaries.

The code includes:

- **mobile-app/**: A simple React Native front-end with buttons to start/stop
  timers and record voice notes (using placeholders for speech-to-text).
- **backend/**: A Node.js/Express server that stores time entries, converts
  uploaded audio to text, and exposes an endpoint that summarizes the last
  week's activity using an AI service.
    - **Data Persistence**: The backend uses SQLite for data persistence. A database file named `timetracker.db` will be automatically created in the `backend` directory when the server starts. This file stores all timer entries and associated notes. Key data includes timer details (client ID, start time, end time) and notes (client ID or a general category, note text, and timestamp).

This is not a fully functional app, but a starting point that can be expanded.
