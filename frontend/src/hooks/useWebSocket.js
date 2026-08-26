import { useEffect, useState } from 'react';

function useWebSocket() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${wsProtocol}//${window.location.host}`);

    ws.onmessage = (event) => {
      try {
        setData(JSON.parse(event.data));
      } catch (error) {
        console.error('Error:', error);
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  return { data };
}

export default useWebSocket;
