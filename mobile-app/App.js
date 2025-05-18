import React, { useState } from 'react';
import { View, Button } from 'react-native';

const API_BASE = ""; // TODO: set API base URL

export default function App() {
  const [isRunning, setIsRunning] = useState(false);
  const clientId = 1; // replace with actual client ID as needed

  const startTimer = async (id) => {
    try {
      await fetch(`${API_BASE}/clients/${id}/start`, { method: 'POST' });
      setIsRunning(true);
    } catch (err) {
      console.error('Failed to start timer', err);
    }
  };

  const stopTimer = async (id) => {
    try {
      await fetch(`${API_BASE}/clients/${id}/stop`, { method: 'POST' });
    } catch (err) {
      console.error('Failed to stop timer', err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <View>
      <Button title="Start" onPress={() => startTimer(clientId)} />
      <Button title="Stop" onPress={() => stopTimer(clientId)} />
    </View>
  );
}
