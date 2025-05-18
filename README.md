# Time Tracking App

This repository contains a minimal skeleton for a time tracking application.
The app allows you to start and stop timers for different clients and store
short text notes for each timer entry. Weekly summaries aggregate the time spent
per client.

The code includes:

- **mobile-app/**: A React Native front-end with buttons that call the backend
  to start and stop timers. Voice notes are currently placeholders that will be
  replaced with speech-to-text recording in the future.
- **backend/**: A Node.js/Express server that stores time entries and simple
  weekly summaries. Voice-to-text and AI summarization can be integrated later.

This is not a fully functional app, but a starting point that can be expanded.

## Running the example

Start the backend:

```bash
cd backend
npm install
node index.js
```

The React Native app expects the backend to run on `http://localhost:3000`.
