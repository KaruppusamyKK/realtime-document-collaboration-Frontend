import React, { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const DocumentReceiver = () => {
  const [message,setMessage] = useState('');
  useEffect(() => {
    // Create a SockJS connection
    const socket = new SockJS('http://localhost:8080/websocket');
    const stompClient = Stomp.over(socket);

    // Configure and activate the STOMP client
    stompClient.connect({}, () => {
      console.log('Connected to WebSocket');

      // Subscribe to the topic
      stompClient.subscribe('/document/send', (message) => {
        if (message.body) {
          const parsedMessage = JSON.parse(message.body);
          setMessage(parsedMessage.body.lastEditedMessage);
          console.log('Last Edited Message:', parsedMessage.body.lastEditedMessage);
        } else {
          console.warn('Received empty message');
        }
      });
    });

    // Cleanup on unmount
    return () => {
      stompClient.disconnect(() => {
        console.log('Disconnected from WebSocket');
      });
    };
  }, []);

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl mb-2">Document Receiver</h2>
      <p>{message}</p>
    </div>
  );
};

export default DocumentReceiver;
