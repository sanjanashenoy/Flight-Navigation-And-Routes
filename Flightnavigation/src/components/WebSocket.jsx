import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const WebSocket = () => {
  useEffect(() => {
    // const socket = io("localhost:5000/", {
    //   transports: ["websocket"],
    //   cors: {
    //     origin: "http://localhost:3000/",
    //   },
    // });

    const socket = io("http://localhost:5000");

    socket.on("connected", (data) => {
      console.log("Socket connected", JSON.parse(data));
    });

    socket.on("data", (data) => {
      console.log("Data is comming", data);
    });

    socket.on("disconnect", (data) => {
      console.log("Socket disconnected", data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return <>Hewo</>;
};

export default WebSocket;
