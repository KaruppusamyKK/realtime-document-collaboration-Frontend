import React, { useState, useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const DocumentSender = () => {
  const [client, setClient] = useState(null);
  const [message, setMessage] = useState('');
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/websocket');
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
      console.log('Connected to WebSocket');
      setClient(stompClient);
    }, (error) => {
      console.error('Error connecting to WebSocket:', error);
    });

    return () => {
      if (stompClient.connected) {
        stompClient.disconnect(() => console.log('WebSocket disconnected'));
      }
    };
  }, []);

  useEffect(() => {
    if (client && message) {
      setTyping(true);
      const timer = setTimeout(() => {
        client.send(
          '/app/lastEdited', 
          {},
          JSON.stringify({
            sender: 'User1', 
            receiver: 'User2',
            lastEditedMessage: message,
            documentName: 'Document1',
          })
        );
        setTyping(false);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [message, client]);

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl mb-2">Document Sender</h2>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="border p-2 w-full mb-2"
        placeholder="Start typing..."
      />
      {typing && <p className="text-gray-500">Sending...</p>}
    </div>
  );
};

export default DocumentSender;
