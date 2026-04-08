import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // Adjust this in production for security
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`[Socket] New connection: ${socket.id}`);

    // Join student specific room
    socket.on("join_student", (studentId) => {
      if (studentId) {
        const roomName = `student_${studentId}`;
        socket.join(roomName);
        console.log(`[Socket] Student ${studentId} joined room: ${roomName}`);
        console.log(`[Socket] Current rooms for ${socket.id}:`, Array.from(socket.rooms));
      } else {
        console.warn(`[Socket] Received join_student with empty studentId from ${socket.id}`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] Disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
