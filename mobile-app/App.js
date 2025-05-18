import React, { useState } from 'react';
import { View, Button, Text } from 'react-native';

export default function App() {
  const [runningClient, setRunningClient] = useState(null);
  const [timerStart, setTimerStart] = useState(null);

  const startTimer = (client) => {
    setRunningClient(client);
    setTimerStart(Date.now());
    // TODO: call backend to start timer
  };

  const stopTimer = () => {
    // TODO: call backend to stop timer and record voice note
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
