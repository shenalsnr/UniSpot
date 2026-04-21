import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Student from "../models/Student.js";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
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
        console.log(
          `[Socket] Current rooms for ${socket.id}:`,
          Array.from(socket.rooms)
        );
      } else {
        console.warn(
          `[Socket] Received join_student with empty studentId from ${socket.id}`
        );
      }
    }); // ✅ closed first handler properly

    // Second handler
    socket.on("join_student", async (token) => {
      if (!token) {
        console.warn("[Socket] join_student called with no token — rejected.");
        return;
      }

      try {
        // Decode and verify the JWT server-side
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Confirm the student exists in the DB
        const student = await Student.findById(decoded.id)
          .select("studentId")
          .lean();

        if (!student || !student.studentId) {
          console.warn(
            `[Socket] join_student — student not found for decoded id ${decoded.id}`
          );
          return;
        }

        const studentId = student.studentId.toUpperCase();

        // Join the private per-student room using server-verified ID
        socket.join(`student_${studentId}`);

        // Store on socket for future reference / cleanup
        socket.data.studentId = studentId;

        console.log(
          `[Socket] Student ${studentId} joined their verified notification room.`
        );

        // Acknowledge successful join to client
        socket.emit("room_joined", { studentId });
      } catch (err) {
        console.warn(
          "[Socket] join_student — invalid token:",
          err.message
        );
      }
    }); // ✅ try/catch now correctly inside

    socket.on("disconnect", () => {
      console.log(
        `[Socket] Disconnected: ${socket.id} (student: ${
          socket.data?.studentId || "unknown"
        })`
      );
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