import jwt from "jsonwebtoken";
import Student from "../models/Student.js";

const protect = async (req, res, next) => {
  try {
    let token = "";

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    console.log(" Auth Debug - Token found:", !!token);
    console.log(" Auth Debug - Authorization header:", req.headers.authorization);

    if (!token) {
      console.log(" Auth Debug - No token provided");
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(" Auth Debug - Token decoded:", decoded);

    const student = await Student.findById(decoded.id).select("-password");

    if (!student) {
      console.log(" Auth Debug - Student not found for ID:", decoded.id);
      return res.status(401).json({ message: "Student not found" });
    }

    console.log(" Auth Debug - Student authenticated:", student._id);
    req.student = student;
    next();
  } catch (error) {
    console.log(" Auth Debug - Token verification failed:", error);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

export { protect };