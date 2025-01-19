// import { useEffect, useRef } from "react";
// import { Client } from "@stomp/stompjs";
// import SockJS from "sockjs-client";

// const useWebSocket = (onMessageReceived) => {
//   const stompClient = useRef(null);

//   useEffect(() => {
//     const socket = new SockJS("http://localhost:8080/realtime-communication");
//     stompClient.current = new Client({
//       webSocketFactory: () => socket,
//       onConnect: () => {
//         stompClient.current.subscribe("http://localhost:8080/topic/communicate", (message) => {
//           const data = JSON.parse(message.body);
//           onMessageReceived(data); // Handle incoming message
//         });
//       },
//       debug: (str) => {
//         console.log(str);
//       },
//     });

//     stompClient.current.activate();

//     return () => {
//       if (stompClient.current) {
//         stompClient.current.deactivate();
//       }
//     };
//   }, [onMessageReceived]);

//   const sendMessage = (message) => {
//     if (stompClient.current && stompClient.current.connected) {
//       stompClient.current.send("/app/send-message", {}, JSON.stringify(message));
//     }
//   };

//   return { sendMessage };
// };

// export default useWebSocket;
