import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Student from "../models/Student.js";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // Adjust in production
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`[Socket] New connection: ${socket.id}`);

    /**
     * join_student: Client sends their JWT token.
     * Server verifies it and derives the studentId server-side.
     * This prevents any client from spoofing another student's room.
     *
     * Client emits: socket.emit("join_student", token)
     */
    socket.on("join_student", async (token) => {
      if (!token) {
        console.warn("[Socket] join_student called with no token — rejected.");
        return;
      }

      try {
        // Decode and verify the JWT server-side
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Confirm the student exists in the DB
        const student = await Student.findById(decoded.id).select("studentId").lean();
        if (!student || !student.studentId) {
          console.warn(`[Socket] join_student — student not found for decoded id ${decoded.id}`);
          return;
        }

        const studentId = student.studentId.toUpperCase();

        // Join the private per-student room using server-verified ID
        socket.join(`student_${studentId}`);
        
        // Store on socket for future reference / cleanup
        socket.data.studentId = studentId;

        console.log(`[Socket] Student ${studentId} joined their verified notification room.`);
        
        // Acknowledge successful join to client
        socket.emit("room_joined", { studentId });
      } catch (err) {
        console.warn("[Socket] join_student — invalid token:", err.message);
        // Do NOT join any room — silently reject
      }
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] Disconnected: ${socket.id} (student: ${socket.data?.studentId || "unknown"})`);
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
