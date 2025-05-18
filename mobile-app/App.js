import React, { useState } from 'react';
import { View, Button, Text, Alert } from 'react-native';

const API_URL = 'http://localhost:3000';

export default function App() {
  const [runningClient, setRunningClient] = useState(null);
  const [timerStart, setTimerStart] = useState(null);

  const startTimer = async (client) => {
    setRunningClient(client);
    setTimerStart(Date.now());
    try {
      const res = await fetch(`${API_URL}/clients/${encodeURIComponent(client)}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to start timer');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not start timer on server');
    }
  };

  const stopTimer = async () => {
    try {
      const body = { text: 'TODO: voice note transcription' };
      const res = await fetch(`${API_URL}/clients/${encodeURIComponent(runningClient)}/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to stop timer');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not stop timer on server');
    }
    setRunningClient(null);
    setTimerStart(null);
  };

  return (
    <View style={{ padding: 20 }}>
      {runningClient ? (
        <View>
          <Text>Tracking time for {runningClient}</Text>
          <Button title="Stop Timer" onPress={stopTimer} />
        </View>
      ) : (
        <View>
          <Button title="Start Client A" onPress={() => startTimer('Client A')} />
          <Button title="Start Client B" onPress={() => startTimer('Client B')} />
        </View>
      )}
    </View>
  );
}
