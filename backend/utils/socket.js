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
        socket.join(`student_${studentId}`);
        console.log(`[Socket] Student ${studentId} joined their notification room.`);
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
