import React, { useState } from 'react';
import { View, Button, Text } from 'react-native';

const API_URL = 'http://localhost:3000';

export default function App() {
  const [runningClient, setRunningClient] = useState(null);
  const [timerStart, setTimerStart] = useState(null);

  const startTimer = async (client) => {
    setRunningClient(client);
    setTimerStart(Date.now());
    try {
      await fetch(`${API_URL}/clients/${encodeURIComponent(client)}/start`, {
        method: 'POST',
      });
    } catch (err) {
      console.error('Failed to start timer', err);
    }
  };

  const stopTimer = async () => {
    if (!runningClient) return;
    try {
      await fetch(`${API_URL}/clients/${encodeURIComponent(runningClient)}/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: 'Voice note placeholder' }),
      });
    } catch (err) {
      console.error('Failed to stop timer', err);
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
