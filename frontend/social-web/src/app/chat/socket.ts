"use client";

import { io } from "socket.io-client";

export const socket = io("http://localhost:3004", {
  autoConnect: true,
  withCredentials: true,
  transports: ["websocket"],
});
